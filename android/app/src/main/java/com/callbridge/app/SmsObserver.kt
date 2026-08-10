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
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.Instant

class SmsObserver(
    private val context: Context,
    private val userId: String
) : ContentObserver(Handler(Looper.getMainLooper())) {

    private val scope = CoroutineScope(Dispatchers.IO)

    // Debounce job — cancels and restarts on every rapid onChange call
    // Only executes after 2 seconds of silence
    private var debounceJob: Job? = null

    // Tracks the last sent SMS we processed to prevent duplicates
    private var lastProcessedSmsId: Long = -1L

    override fun onChange(selfChange: Boolean, uri: Uri?) {
        super.onChange(selfChange, uri)

        // Cancel any pending debounce and restart the timer
        // This means we only act after onChange stops firing rapidly
        debounceJob?.cancel()
        debounceJob = scope.launch {
            delay(2000) // wait 2 seconds of silence before processing
            handleSmsChange()
        }
    }

    private suspend fun handleSmsChange() {
        try {
            checkForSentSms()
            checkForReadStatusChanges()
        } catch (e: Exception) {
            Log.e("CallBridge", "SmsObserver: error — ${e.message}")
        }
    }

    private suspend fun checkForSentSms() {
        try {
            val cursor = context.contentResolver.query(
                Uri.parse("content://sms/sent"),
                arrayOf("_id", "address", "body", "date"),
                null,
                null,
                "date DESC LIMIT 1" // only the most recent sent message
            )

            cursor?.use {
                if (it.moveToFirst()) {
                    val smsId = it.getLong(it.getColumnIndexOrThrow("_id"))

                    // Duplicate guard — if we already processed this SMS id skip it
                    if (smsId == lastProcessedSmsId) {
                        Log.d("CallBridge", "SmsObserver: SMS id=$smsId already processed, skipping")
                        return
                    }

                    val phoneNumber = it.getString(
                        it.getColumnIndexOrThrow("address")
                    ) ?: ""
                    val body = it.getString(
                        it.getColumnIndexOrThrow("body")
                    ) ?: ""
                    val timestamp = Instant.now().toString()

                    val contactName = ContactResolver.getContactName(context, phoneNumber)

                    Log.d("CallBridge", "SmsObserver: sent SMS to $phoneNumber id=$smsId")

                    val repository = SmsLogRepository(context)
                    repository.saveSmsLog(
                        userId = userId,
                        phoneNumber = phoneNumber,
                        contactName = contactName,
                        messageBody = body.take(500),
                        logType = "sms_sent",
                        timestamp = timestamp,
                        isRead = true
                    )

                    // Mark this SMS id as processed so we never save it again
                    lastProcessedSmsId = smsId

                    AppwriteSyncService.syncPendingSmsLogs(context)
                }
            }
        } catch (e: Exception) {
            Log.e("CallBridge", "SmsObserver: sent SMS error — ${e.message}")
        }
    }

    private suspend fun checkForReadStatusChanges() {
        try {
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
                    val phone = it.getString(
                        it.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)
                    ) ?: ""
                    if (phone.isNotEmpty()) phoneNumbers.add(phone)
                }

                if (phoneNumbers.isNotEmpty()) {
                    AppwriteSyncService.syncReadStatusUpdates(context, phoneNumbers, userId)
                }
            }
        } catch (e: Exception) {
            Log.e("CallBridge", "SmsObserver: read status error — ${e.message}")
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
        debounceJob?.cancel()
        context.contentResolver.unregisterContentObserver(this)
        Log.d("CallBridge", "SmsObserver: stopped observing")
    }
}