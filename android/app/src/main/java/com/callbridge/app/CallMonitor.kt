package com.callbridge.app

import android.content.Context
import android.os.Build
import android.telephony.PhoneStateListener
import android.telephony.TelephonyCallback
import android.telephony.TelephonyManager
import android.util.Log
import androidx.annotation.RequiresApi
import java.util.concurrent.Executors

class CallMonitor(private val context: Context) {

    private val telephonyManager =
        context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager

    private var lastState = TelephonyManager.CALL_STATE_IDLE
    private var callStartTime: Long = 0L

    // ── Modern API (Android 12+) ──────────────────────────────────
    @RequiresApi(Build.VERSION_CODES.S)
    private val modernCallback = object : TelephonyCallback(),
        TelephonyCallback.CallStateListener {
        override fun onCallStateChanged(state: Int) {
            handleCallStateChange(state)
        }
    }

    // ── Legacy API (Android 8 to 11) ─────────────────────────────
    @Suppress("DEPRECATION")
    private val legacyListener = object : PhoneStateListener() {
        @Deprecated("Deprecated in Java")
        override fun onCallStateChanged(state: Int, phoneNumber: String?) {
            handleCallStateChange(state)
        }
    }

    // ── Start listening — picks the right API automatically ───────
    fun startListening() {
        // Check permission before attempting to register
        if (!PermissionManager.hasCallPermissions(context)) {
            Log.e("CallBridge", "CallMonitor: READ_PHONE_STATE not granted — cannot start")
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Android 12 and above — use TelephonyCallback
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
            // Android 8 to 11 — use PhoneStateListener
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

    // ── Shared logic — same for both APIs ─────────────────────────
    private fun handleCallStateChange(state: Int) {
        when (state) {

            TelephonyManager.CALL_STATE_RINGING -> {
                callStartTime = System.currentTimeMillis()
                Log.d("CallBridge", "CallMonitor: Incoming call ringing")
            }

            TelephonyManager.CALL_STATE_OFFHOOK -> {
                if (lastState == TelephonyManager.CALL_STATE_RINGING) {
                    Log.d("CallBridge", "CallMonitor: Call ANSWERED")
                    // TODO: Save to Room and sync to Appwrite
                }
            }

            TelephonyManager.CALL_STATE_IDLE -> {
                if (lastState == TelephonyManager.CALL_STATE_RINGING) {
                    Log.d("CallBridge", "CallMonitor: Call MISSED")
                    // TODO: Save to Room and sync to Appwrite
                }
                callStartTime = 0L
            }
        }

        lastState = state
    }
}