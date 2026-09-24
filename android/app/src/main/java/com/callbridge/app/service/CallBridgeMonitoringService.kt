package com.callbridge.app.service

import android.R
import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.callbridge.app.service.CallMonitor
import com.callbridge.app.MainActivity
import com.callbridge.app.service.SmsObserver
import com.callbridge.app.core.NotificationHelper
import com.callbridge.app.data.remote.ActivityLogService
import com.callbridge.app.data.remote.AppwriteSyncService
import com.callbridge.app.data.remote.DeviceRegistrationService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class CallBridgeMonitoringService : Service() {

    private var callMonitor: CallMonitor? = null
    private var smsObserver: SmsObserver? = null

    override fun onCreate() {
        super.onCreate()
        Log.d("CallBridge", "ForegroundService: created")
        NotificationHelper.createNotificationChannel(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("CallBridge", "ForegroundService: started")
        val notification = buildNotification()

        // ── FIX 2: Combine Phone Call and Remote Messaging types to satisfy Android 16 security constraints ──
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val serviceTypes = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                // Combined flags are required on Android 14, 15, and 16+
                ServiceInfo.FOREGROUND_SERVICE_TYPE_PHONE_CALL or ServiceInfo.FOREGROUND_SERVICE_TYPE_REMOTE_MESSAGING
            } else {
                ServiceInfo.FOREGROUND_SERVICE_TYPE_PHONE_CALL
            }

            startForeground(
                NotificationHelper.NOTIFICATION_ID,
                notification,
                serviceTypes
            )
        } else {
            startForeground(NotificationHelper.NOTIFICATION_ID, notification)
        }

        // Get the stored userId from SharedPreferences
        val prefs = getSharedPreferences("callbridge_prefs", MODE_PRIVATE)
        val userId = prefs.getString("current_user_id", "") ?: ""
        Log.d("CallBridge", "ForegroundService: userId = '$userId'")

        // Initialize Call Tracking Layer
        callMonitor = CallMonitor(this, userId)
        callMonitor?.startListening()

        // Initialize SMS Observation Layer
        smsObserver = SmsObserver(this, userId)
        smsObserver?.startObserving()

        // ── FIX 3: Consolidated Coroutine Sync Scope ──
        CoroutineScope(Dispatchers.IO).launch {
            if (userId.isNotEmpty()) {
                // Register hardware metadata to Appwrite Console
                DeviceRegistrationService.registerOrUpdateDevice(
                    this@CallBridgeMonitoringService, userId
                )

                // Dispatch background health log metrics
                ActivityLogService.logActivity(
                    context = this@CallBridgeMonitoringService,
                    userId = userId,
                    activityType = ActivityLogService.TYPE_MONITORING_STARTED,
                    message = "Monitoring active on ${Build.MANUFACTURER} ${Build.MODEL}"
                )
                ActivityLogService.logActivity(
                    context = this@CallBridgeMonitoringService,
                    userId = userId,
                    activityType = ActivityLogService.TYPE_DEVICE_CONNECTED,
                    message = "${Build.MANUFACTURER} ${Build.MODEL} bound to control center"
                )
                ActivityLogService.cleanupOldLogs(this@CallBridgeMonitoringService, userId)
            }

            // Push any stored offline data cache up to Appwrite
            AppwriteSyncService.syncPendingCallLogs(this@CallBridgeMonitoringService)
            AppwriteSyncService.syncPendingSmsLogs(this@CallBridgeMonitoringService)
        }

        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        callMonitor?.stopListening()
        smsObserver?.stopObserving()

        val prefs = getSharedPreferences("callbridge_prefs", MODE_PRIVATE)
        val userId = prefs.getString("current_user_id", "") ?: ""
        if (userId.isNotEmpty()) {
            CoroutineScope(Dispatchers.IO).launch {
                ActivityLogService.logActivity(
                    context = this@CallBridgeMonitoringService,
                    userId = userId,
                    activityType = ActivityLogService.TYPE_MONITORING_STOPPED,
                    message = "Monitoring terminated on ${Build.MANUFACTURER} ${Build.MODEL}"
                )
            }
        }
        Log.d("CallBridge", "ForegroundService: destroyed")
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun buildNotification(): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, NotificationHelper.CHANNEL_ID)
            .setContentTitle("CallBridge is active")
            .setContentText("Monitoring telemetry logs in background context")
            .setSmallIcon(R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setSilent(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }
}
