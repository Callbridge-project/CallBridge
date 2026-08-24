package com.callbridge.app

import android.app.Application
import android.util.Log

class CallBridgeApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        Log.d("CallBridge", "CallBridgeApplication: onCreate")
        try {
            AppwriteClient.initialize(this)
            Log.d("CallBridge", "CallBridgeApplication: AppwriteClient initialized")
        } catch (e: Exception) {
            Log.e("CallBridge", "CallBridgeApplication: Failed: ${e.message}")
        }
        NotificationHelper.createNotificationChannel(this)
    }
}