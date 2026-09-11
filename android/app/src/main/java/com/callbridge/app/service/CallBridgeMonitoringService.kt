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

    // CallMonitor only exists on Android 12 and above
    private var callMonitor: CallMonitor? = null

    private var smsObserver: SmsObserver? = null

    override fun onCreate() {
        // Create the notification channel the first time the service starts
        super.onCreate()
        Log.d("CallBridge", "ForegroundService: created")
        NotificationHelper.createNotificationChannel(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("CallBridge", "ForegroundService: started")
        val notification = buildNotification()

        // Pass the service type on Android 10 and above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NotificationHelper.NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_PHONE_CALL
            )
        } else {
            startForeground(NotificationHelper.NOTIFICATION_ID, notification)
        }

        // Start call monitoring on both Android 12+ and Android 11 - 8
        // Get the stored userId from SharedPreferences
        val prefs = getSharedPreferences("callbridge_prefs", MODE_PRIVATE)
        val userId = prefs.getString("current_user_id", "") ?: ""
        Log.d("CallBridge", "ForegroundService: userId = '$userId'")

// Pass userId into CallMonitor
        callMonitor = CallMonitor(this, userId)
        callMonitor?.startListening()

        // Start SMS observation — handles both received read status
        // and sent SMS detection simultaneously
        smsObserver = SmsObserver(this, userId)
        smsObserver?.startObserving()

        // Register or update device in Appwrite
        CoroutineScope(Dispatchers.IO).launch {
            if (userId.isNotEmpty()) {
                DeviceRegistrationService.registerOrUpdateDevice(
                    this@CallBridgeMonitoringService, userId
                )
                ActivityLogService.logActivity(
                    context = this@CallBridgeMonitoringService,
                    userId = userId,
                    activityType = ActivityLogService.TYPE_MONITORING_STARTED,
                    message = "Monitoring started on ${Build.MANUFACTURER} ${Build.MODEL}"
                )
                ActivityLogService.logActivity(
                    context = this@CallBridgeMonitoringService,
                    userId = userId,
                    activityType = ActivityLogService.TYPE_DEVICE_CONNECTED,
                    message = "${Build.MANUFACTURER} ${Build.MODEL} connected to dashboard"
                )
                ActivityLogService.cleanupOldLogs(this@CallBridgeMonitoringService, userId)
            }
            AppwriteSyncService.syncPendingCallLogs(this@CallBridgeMonitoringService)
            AppwriteSyncService.syncPendingSmsLogs(this@CallBridgeMonitoringService)
        }

        // Sync any events that were saved while offline
        CoroutineScope(Dispatchers.IO).launch {
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
                    message = "Monitoring stopped on ${Build.MANUFACTURER} ${Build.MODEL}"
                )
            }
        }
        Log.d("CallBridge", "ForegroundService: destroyed")
    }

    // We do not need binding — this service runs independently
    override fun onBind(intent: Intent?): IBinder? = null

    private fun buildNotification(): Notification {
        // Tapping the notification opens the app
        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, NotificationHelper.CHANNEL_ID)
            .setContentTitle("CallBridge is active")
            .setContentText("Monitoring calls and SMS in the background")
            .setSmallIcon(R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .setOngoing(true) // makes it non-dismissable by swipe
            .setSilent(true) // no sound when notification appears
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }
}