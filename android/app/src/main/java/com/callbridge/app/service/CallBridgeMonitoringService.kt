package com.callbridge.app.service

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log

import androidx.core.app.NotificationCompat

import com.callbridge.app.MainActivity
import com.callbridge.app.core.NotificationHelper
import com.callbridge.app.data.remote.ActivityLogService
import com.callbridge.app.data.remote.AppwriteSyncService
import com.callbridge.app.data.remote.DeviceRegistrationService

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

class CallBridgeMonitoringService : Service() {

    companion object {
        private const val TAG = "CallBridge"
        private const val PREFS_NAME = "callbridge_prefs"
        private const val USER_ID_KEY = "current_user_id"
    }

    private var callMonitor: CallMonitor? = null
    private var smsObserver: SmsObserver? = null

    private var activeUserId: String? = null

    private val serviceScope =
        CoroutineScope(
            SupervisorJob() + Dispatchers.IO
        )

    override fun onCreate() {

        super.onCreate()

        Log.d(
            TAG,
            "ForegroundService: created"
        )

        NotificationHelper.createNotificationChannel(this)
    }

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int
    ): Int {

        Log.d(
            TAG,
            "ForegroundService: onStartCommand"
        )

        /*
         * ---------------------------------------------------------
         * STEP 1 — Start foreground notification immediately
         * ---------------------------------------------------------
         *
         * Android 8.0+ (API 26+) requires services started via
         * Context.startForegroundService() to call startForeground()
         * within a strict timeout window (~5 seconds).
         *
         * Calling startForeground() FIRST before any logic or conditional
         * checks ensures we never trigger ForegroundServiceDidNotStartInTimeException.
         */

        val notification =
            buildNotification()

        try {

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {

                try {
                    startForeground(
                        NotificationHelper.NOTIFICATION_ID,
                        notification,
                        ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
                    )
                } catch (e: Exception) {
                    Log.w(
                        TAG,
                        "ForegroundService: startForeground with SPECIAL_USE type failed, falling back to basic startForeground — ${e.message}"
                    )
                    startForeground(
                        NotificationHelper.NOTIFICATION_ID,
                        notification
                    )
                }

            } else {

                startForeground(
                    NotificationHelper.NOTIFICATION_ID,
                    notification
                )
            }

        } catch (e: SecurityException) {

            Log.e(
                TAG,
                "ForegroundService: security error starting foreground service — ${e.message}",
                e
            )

            stopSelf(startId)

            return START_NOT_STICKY

        } catch (e: Exception) {

            Log.e(
                TAG,
                "ForegroundService: failed to enter foreground — ${e.message}",
                e
            )

            stopSelf(startId)

            return START_NOT_STICKY
        }

        /*
         * ---------------------------------------------------------
         * STEP 2 — Get authenticated CallBridge user
         * ---------------------------------------------------------
         */

        val prefs =
            getSharedPreferences(
                PREFS_NAME,
                MODE_PRIVATE
            )

        val userId =
            prefs.getString(
                USER_ID_KEY,
                ""
            )?.trim().orEmpty()

        if (userId.isEmpty()) {

            Log.e(
                TAG,
                "ForegroundService: no authenticated user ID found — stopping service"
            )

            stopSelf(startId)

            return START_NOT_STICKY
        }

        Log.d(
            TAG,
            "ForegroundService: userId='$userId'"
        )

        /*
         * ---------------------------------------------------------
         * STEP 3 — Avoid creating duplicate monitor instances
         * ---------------------------------------------------------
         */

        if (activeUserId == userId &&
            callMonitor != null &&
            smsObserver != null
        ) {

            Log.d(
                TAG,
                "ForegroundService: monitors already active for this user"
            )

            return START_STICKY
        }

        /*
         * If a different user is now active, clean up the
         * previous monitor instances first.
         */
        if (activeUserId != null &&
            activeUserId != userId
        ) {

            Log.d(
                TAG,
                "ForegroundService: user changed — resetting monitors"
            )

            callMonitor?.stopListening()
            smsObserver?.stopObserving()

            callMonitor = null
            smsObserver = null
        }

        activeUserId = userId

        /*
         * ---------------------------------------------------------
         * STEP 4 — Start Call Log monitor
         * ---------------------------------------------------------
         */

        if (callMonitor == null) {

            callMonitor =
                CallMonitor(
                    context = this,
                    userId = userId
                )

            callMonitor?.startListening()

            Log.d(
                TAG,
                "ForegroundService: CallMonitor started"
            )
        }

        /*
         * ---------------------------------------------------------
         * STEP 5 — Start SMS observer
         * ---------------------------------------------------------
         */

        if (smsObserver == null) {

            smsObserver =
                SmsObserver(
                    context = this,
                    userId = userId
                )

            smsObserver?.startObserving()

            Log.d(
                TAG,
                "ForegroundService: SmsObserver started"
            )
        }

        /*
         * ---------------------------------------------------------
         * STEP 6 — Backend registration / synchronization
         * ---------------------------------------------------------
         */

        serviceScope.launch {

            try {

                DeviceRegistrationService.registerOrUpdateDevice(
                    this@CallBridgeMonitoringService,
                    userId
                )

                ActivityLogService.logActivity(
                    context = this@CallBridgeMonitoringService,
                    userId = userId,
                    activityType =
                        ActivityLogService.TYPE_MONITORING_STARTED,
                    message =
                        "Monitoring active on ${Build.MANUFACTURER} ${Build.MODEL}"
                )

                ActivityLogService.logActivity(
                    context = this@CallBridgeMonitoringService,
                    userId = userId,
                    activityType =
                        ActivityLogService.TYPE_DEVICE_CONNECTED,
                    message =
                        "${Build.MANUFACTURER} ${Build.MODEL} bound to control center"
                )

                ActivityLogService.cleanupOldLogs(
                    this@CallBridgeMonitoringService,
                    userId
                )

                /*
                 * Upload anything that was saved locally while
                 * the device was offline.
                 */
                AppwriteSyncService.syncPendingCallLogs(
                    this@CallBridgeMonitoringService
                )

                AppwriteSyncService.syncPendingSmsLogs(
                    this@CallBridgeMonitoringService
                )

                Log.d(
                    TAG,
                    "ForegroundService: startup synchronization completed"
                )

            } catch (e: Exception) {

                Log.e(
                    TAG,
                    "ForegroundService: backend initialization error — ${e.message}",
                    e
                )
            }
        }

        Log.d(
            TAG,
            "ForegroundService: monitoring pipeline active"
        )

        return START_STICKY
    }

    override fun onDestroy() {

        Log.d(
            TAG,
            "ForegroundService: destroying"
        )

        /*
         * Stop monitoring first.
         */
        try {

            callMonitor?.stopListening()

        } catch (e: Exception) {

            Log.e(
                TAG,
                "ForegroundService: error stopping CallMonitor — ${e.message}",
                e
            )
        }

        try {

            smsObserver?.stopObserving()

        } catch (e: Exception) {

            Log.e(
                TAG,
                "ForegroundService: error stopping SmsObserver — ${e.message}",
                e
            )
        }

        callMonitor = null
        smsObserver = null
        activeUserId = null

        /*
         * Log service termination.
         */
        val prefs =
            getSharedPreferences(
                PREFS_NAME,
                MODE_PRIVATE
            )

        val userId =
            prefs.getString(
                USER_ID_KEY,
                ""
            )?.trim().orEmpty()

        if (userId.isNotEmpty()) {

            serviceScope.launch {

                try {

                    ActivityLogService.logActivity(
                        context = this@CallBridgeMonitoringService,
                        userId = userId,
                        activityType =
                            ActivityLogService.TYPE_MONITORING_STOPPED,
                        message =
                            "Monitoring terminated on ${Build.MANUFACTURER} ${Build.MODEL}"
                    )

                } catch (e: Exception) {

                    Log.e(
                        TAG,
                        "ForegroundService: failed to log monitoring stop — ${e.message}",
                        e
                    )
                }
            }
        }

        /*
         * Cancel service-owned coroutines.
         */
        serviceScope.cancel()

        super.onDestroy()

        Log.d(
            TAG,
            "ForegroundService: destroyed"
        )
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun buildNotification(): Notification {

        val openAppIntent =
            Intent(
                this,
                MainActivity::class.java
            ).apply {

                flags =
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                            Intent.FLAG_ACTIVITY_CLEAR_TOP
            }

        val pendingIntent =
            PendingIntent.getActivity(
                this,
                0,
                openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or
                        PendingIntent.FLAG_IMMUTABLE
            )

        return NotificationCompat.Builder(
            this,
            NotificationHelper.CHANNEL_ID
        )
            .setContentTitle(
                "CallBridge is active"
            )
            .setContentText(
                "Monitoring calls and SMS in the background"
            )
            .setSmallIcon(
                android.R.drawable.ic_dialog_info
            )
            .setContentIntent(
                pendingIntent
            )
            .setOngoing(true)
            .setSilent(true)
            .setPriority(
                NotificationCompat.PRIORITY_LOW
            )
            .build()
    }
}