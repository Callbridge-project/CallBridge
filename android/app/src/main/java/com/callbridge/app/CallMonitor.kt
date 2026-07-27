package com.callbridge.app

import android.content.Context
import android.os.Build
import android.telephony.PhoneStateListener
import android.telephony.TelephonyCallback
import android.telephony.TelephonyManager
import android.util.Log
import androidx.annotation.RequiresApi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.Instant
import java.util.concurrent.Executors

class CallMonitor(
    private val context: Context,
    private val userId: String
) {

    private val telephonyManager =
        context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager

    private val repository = CallLogRepository(context)
    private val scope = CoroutineScope(Dispatchers.IO)

    private var lastState = TelephonyManager.CALL_STATE_IDLE
    private var callStartTime: Long = 0L
    private var lastIncomingNumber: String = ""

    // ── Modern API (Android 12+) ──────────────────────────────────
    @RequiresApi(Build.VERSION_CODES.S)
    private val modernCallback = object : TelephonyCallback(),
        TelephonyCallback.CallStateListener {
        override fun onCallStateChanged(state: Int) {
            handleCallStateChange(state, null)
        }
    }

    // ── Legacy API (Android 8 to 11) ─────────────────────────────
    @Suppress("DEPRECATION")
    private val legacyListener = object : PhoneStateListener() {
        @Deprecated("Deprecated in Java")
        override fun onCallStateChanged(state: Int, phoneNumber: String?) {
            handleCallStateChange(state, phoneNumber)
        }
    }

    // ── Start listening — picks the right API automatically ───────
    fun startListening() {
        if (!PermissionManager.hasCallPermissions(context)) {
            Log.e("CallBridge", "CallMonitor: READ_PHONE_STATE not granted — cannot start")
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            try {
                telephonyManager.registerTelephonyCallback(
                    Executors.newSingleThreadExecutor(),
                    modernCallback
                )
                Log.d("CallBridge", "CallMonitor: started (modern API)")
            } catch (e: SecurityException) {
                Log.e("CallBridge", "CallMonitor: permission missing — ${e.message}")
            }
        } else {
            try {
                @Suppress("DEPRECATION")
                telephonyManager.listen(
                    legacyListener,
                    PhoneStateListener.LISTEN_CALL_STATE
                )
                Log.d("CallBridge", "CallMonitor: started (legacy API)")
            } catch (e: SecurityException) {
                Log.e("CallBridge", "CallMonitor: permission missing — ${e.message}")
            }
        }
    }

    // ── Stop listening — cleans up whichever API was used ─────────
    fun stopListening() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            try {
                telephonyManager.unregisterTelephonyCallback(modernCallback)
                Log.d("CallBridge", "CallMonitor: stopped (modern API)")
            } catch (e: Exception) {
                Log.e("CallBridge", "CallMonitor: error stopping — ${e.message}")
            }
        } else {
            try {
                @Suppress("DEPRECATION")
                telephonyManager.listen(
                    legacyListener,
                    PhoneStateListener.LISTEN_NONE
                )
                Log.d("CallBridge", "CallMonitor: stopped (legacy API)")
            } catch (e: Exception) {
                Log.e("CallBridge", "CallMonitor: error stopping — ${e.message}")
            }
        }
    }

    // ── Read the most recent number from the system call log ──────
    // Used on Android 12+ where TelephonyCallback no longer provides
    // the phone number directly for privacy reasons
    private fun getLastCallNumber(): String {
        if (!PermissionManager.hasCallPermissions(context)) return ""

        return try {
            val cursor = context.contentResolver.query(
                android.provider.CallLog.Calls.CONTENT_URI,
                arrayOf(android.provider.CallLog.Calls.NUMBER),
                null,
                null,
                "${android.provider.CallLog.Calls.DATE} DESC"
            )

            cursor?.use {
                if (it.moveToFirst()) {
                    it.getString(
                        it.getColumnIndexOrThrow(android.provider.CallLog.Calls.NUMBER)
                    ) ?: ""
                } else ""
            } ?: ""
        } catch (e: Exception) {
            Log.e("CallBridge", "CallMonitor: error reading call log — ${e.message}")
            ""
        }
    }

    // ── Shared detection logic — same for both APIs ───────────────
    private fun handleCallStateChange(state: Int, phoneNumber: String?) {
        when (state) {

            TelephonyManager.CALL_STATE_RINGING -> {
                callStartTime = System.currentTimeMillis()

                // On Android 8-11 the number comes directly from the callback
                // On Android 12+ phoneNumber is null here so we read call log later
                lastIncomingNumber = phoneNumber ?: ""

                Log.d("CallBridge", "CallMonitor: Incoming call ringing from $lastIncomingNumber")
            }

            TelephonyManager.CALL_STATE_OFFHOOK -> {
                if (lastState == TelephonyManager.CALL_STATE_RINGING) {
                    scope.launch {
                        // Wait 1 second for the system call log to update
                        // before reading the number from it
                        delay(1000)

                        val phoneNum = if (lastIncomingNumber.isNotEmpty()) {
                            lastIncomingNumber
                        } else {
                            getLastCallNumber()
                        }

                        val contactName = ContactResolver.getContactName(context, phoneNum)

                        Log.d("CallBridge", "CallMonitor: Call ANSWERED from $phoneNum")
                        Log.d("CallBridge", "CallMonitor: contact resolved as '${contactName ?: "Unknown"}'")

                        repository.saveCallLog(
                            userId = userId,
                            phoneNumber = phoneNum,
                            contactName = contactName,
                            logType = "incoming_call",
                            timestamp = Instant.now().toString()
                        )

                        Log.d("CallBridge", "CallMonitor: answered call saved to Room")

                        // Sync to Appwrite immediately after saving locally
                        AppwriteSyncService.syncPendingCallLogs(context)
                    }
                }
            }

            TelephonyManager.CALL_STATE_IDLE -> {
                if (lastState == TelephonyManager.CALL_STATE_RINGING) {
                    scope.launch {
                        // Wait 1 second for the system call log to update
                        // before reading the number from it
                        delay(1000)

                        val phoneNum = if (lastIncomingNumber.isNotEmpty()) {
                            lastIncomingNumber
                        } else {
                            getLastCallNumber()
                        }

                        val contactName = ContactResolver.getContactName(context, phoneNum)

                        Log.d("CallBridge", "CallMonitor: Call MISSED from $phoneNum")
                        Log.d("CallBridge", "CallMonitor: contact resolved as '${contactName ?: "Unknown"}'")


                        repository.saveCallLog(
                            userId = userId,
                            phoneNumber = phoneNum,
                            contactName = contactName,
                            logType = "missed_call",
                            timestamp = Instant.now().toString()
                        )

                        Log.d("CallBridge", "CallMonitor: missed call saved to Room")

                        // Sync to Appwrite immediately after saving locally
                        AppwriteSyncService.syncPendingCallLogs(context)
                    }
                }

                callStartTime = 0L
                lastIncomingNumber = ""
            }
        }

        lastState = state
    }
}