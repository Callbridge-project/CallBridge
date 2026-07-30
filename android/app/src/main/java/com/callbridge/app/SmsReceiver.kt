package com.callbridge.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.Instant

class SmsReceiver : BroadcastReceiver() {

    private val scope = CoroutineScope(Dispatchers.IO)

    override fun onReceive(context: Context, intent: Intent) {

        Log.d("CallBridge", "========== SMS RECEIVER STARTED ==========")

        // Only handle incoming SMS events
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        // Extract SMS messages from the intent
        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)

        if (messages.isNullOrEmpty()) {
            Log.e("CallBridge", "SmsReceiver: no messages found in intent")
            return
        }

        // Messages from the same sender can arrive in multiple parts
        // We group them by sender and concatenate the body
        val senderNumber = messages[0].displayOriginatingAddress
        val messageBody = messages.joinToString("") { it.messageBody }
        val timestamp = Instant.now().toString()

        Log.d("CallBridge", "SmsReceiver: SMS received from $senderNumber")

        // Get userId from SharedPreferences
        val prefs = context.getSharedPreferences("callbridge_prefs", Context.MODE_PRIVATE)
        val userId = prefs.getString("current_user_id", "") ?: ""

        if (userId.isEmpty()) {
            Log.e("CallBridge", "SmsReceiver: userId is empty — skipping save")
            return
        }

        // Resolve contact name from device contacts
        val contactName = ContactResolver.getContactName(context, senderNumber)

        Log.d("CallBridge", "SmsReceiver: from $senderNumber contact=${contactName ?: "Unknown"}")

        // Save to Room and sync to Appwrite on background thread
        scope.launch {
            try {
                val repository = SmsLogRepository(context)
                repository.saveSmsLog(
                    userId = userId,
                    phoneNumber = senderNumber,
                    contactName = contactName,
                    messageBody = messageBody.take(500), // preview only
                    timestamp = timestamp,
                    isRead = false
                )
                Log.d("CallBridge", "SmsReceiver: saved to Room")

                // Sync to Appwrite immediately
                AppwriteSyncService.syncPendingSmsLogs(context)

            } catch (e: Exception) {
                Log.e("CallBridge", "SmsReceiver: failed to save — ${e.message}")
            }
        }
    }
}