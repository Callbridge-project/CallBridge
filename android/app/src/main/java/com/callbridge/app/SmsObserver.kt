package com.callbridge.app

import android.content.Context
import android.database.ContentObserver
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.Telephony
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.Instant

class SmsObserver(
    private val context: Context,
    private val userId: String
) : ContentObserver(Handler(Looper.getMainLooper())) {

    private val scope = CoroutineScope(Dispatchers.IO)

    // Track the last SMS count to detect new sent messages
    private var lastSmsCount = getSmsCount()

    override fun onChange(selfChange: Boolean, uri: Uri?) {
        super.onChange(selfChange, uri)
        scope.launch {
            handleSmsChange(uri)
        }
    }

    private suspend fun handleSmsChange(uri: Uri?) {
        try {
            // Check for newly sent SMS
            checkForSentSms()

            // Check for read status changes
            checkForReadStatusChanges()

        } catch (e: Exception) {
            Log.e("CallBridge", "SmsObserver: error handling change — ${e.message}")
        }
    }

    // ── Detect newly sent SMS ─────────────────────────────────────
    private suspend fun checkForSentSms() {
        val currentCount = getSmsCount()
        if (currentCount <= lastSmsCount) return

        // New SMS detected in sent box
        try {
            val cursor = context.contentResolver.query(
                Uri.parse("content://sms/sent"),
                arrayOf("address", "body", "date"),
                null, null,
                "date DESC"
            )

            cursor?.use {
                if (it.moveToFirst()) {
                    val phoneNumber = it.getString(
                        it.getColumnIndexOrThrow("address")
                    ) ?: ""
                    val body = it.getString(
                        it.getColumnIndexOrThrow("body")
                    ) ?: ""
                    val timestamp = Instant.now().toString()

                    val contactName = ContactResolver.getContactName(context, phoneNumber)

                    Log.d("CallBridge", "SmsObserver: sent SMS to $phoneNumber")

                    // Save sent SMS to Room
                    val repository = SmsLogRepository(context)
                    repository.saveSmsLog(
                        userId = userId,
                        phoneNumber = phoneNumber,
                        contactName = contactName,
                        messageBody = body.take(500),
                        logType = "sms_sent",
                        timestamp = timestamp,
                        isRead = true  // sent messages are always read by default
                    )

                    // Sync to Appwrite
                    AppwriteSyncService.syncPendingSmsLogs(context)
                }
            }
        } catch (e: Exception) {
            Log.e("CallBridge", "SmsObserver: sent SMS error — ${e.message}")
        }

        lastSmsCount = currentCount
    }

    // ── Detect when user reads a received SMS on the device ───────
    private suspend fun checkForReadStatusChanges() {
        try {
            // Query for messages that are now marked as read
            // but our Room database still has them as unread
            val cursor = context.contentResolver.query(
                Telephony.Sms.CONTENT_URI,
                arrayOf(
                    Telephony.Sms._ID,
                    Telephony.Sms.ADDRESS,
                    Telephony.Sms.READ,
                    Telephony.Sms.DATE
                ),
                "${Telephony.Sms.READ} = 1 AND ${Telephony.Sms.TYPE} = ${Telephony.Sms.MESSAGE_TYPE_INBOX}",
                null,
                "${Telephony.Sms.DATE} DESC LIMIT 20"
            )

            cursor?.use {
                val phoneNumbers = mutableListOf<String>()
                while (it.moveToNext()) {
                    val phone = it.getString(it.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)) ?: ""
                    if (phone.isNotEmpty()) phoneNumbers.add(phone)
                }

                if (phoneNumbers.isNotEmpty()) {
                    // Update Appwrite documents for these numbers to is_read: true
                    AppwriteSyncService.syncReadStatusUpdates(context, phoneNumbers, userId)
                }
            }
        } catch (e: Exception) {
            Log.e("CallBridge", "SmsObserver: read status check error — ${e.message}")
        }
    }

    private fun getSmsCount(): Int {
        return try {
            val cursor = context.contentResolver.query(
                Uri.parse("content://sms/sent"),
                arrayOf("_id"),
                null, null, null
            )
            val count = cursor?.count ?: 0
            cursor?.close()
            count
        } catch (e: Exception) {
            0
        }
    }

    fun startObserving() {
        context.contentResolver.registerContentObserver(
            Telephony.Sms.CONTENT_URI,
            true,
            this
        )
        Log.d("CallBridge", "SmsObserver: started observing")
    }

    fun stopObserving() {
        context.contentResolver.unregisterContentObserver(this)
        Log.d("CallBridge", "SmsObserver: stopped observing")
    }
}