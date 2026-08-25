package com.callbridge.app

import android.app.Application
import android.util.Log

class CallBridgeApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        Log.d("CallBridge", "CallBridgeApplication: onCreate")
        
        // Initialize AppwriteClient here so it's available to all components
        // (Activities, Services, BroadcastReceivers) as soon as the process starts.
        try {
            AppwriteClient.initialize(this)
            Log.d("CallBridge", "CallBridgeApplication: AppwriteClient initialized")
        } catch (e: Exception) {
            Log.e("CallBridge", "CallBridgeApplication: Failed to initialize AppwriteClient: ${e.message}")
        }

        // Create notification channel
        NotificationHelper.createNotificationChannel(this)
    }
}
