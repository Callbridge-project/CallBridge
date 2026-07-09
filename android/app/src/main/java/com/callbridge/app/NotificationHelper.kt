package com.callbridge.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context

object NotificationHelper {

    const val CHANNEL_ID = "callbridge_monitoring_channel"
    const val NOTIFICATION_ID = 1001

    // Call this once when the app starts
    fun createNotificationChannel(context: Context) {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "CallBridge Monitoring",
            NotificationManager.IMPORTANCE_LOW  // LOW means no sound, just a silent persistent icon
        ).apply {
            description = "Shows while CallBridge is actively monitoring calls and SMS"
            setShowBadge(false)  // no badge count on app icon
        }

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.createNotificationChannel(channel)
    }
}