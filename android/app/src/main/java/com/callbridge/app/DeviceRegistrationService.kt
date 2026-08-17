package com.callbridge.app

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat
import io.appwrite.ID
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object DeviceRegistrationService {

    private const val TAG = "CallBridge"
    private const val PREFS_KEY_DEVICE_ID = "registered_device_id"

    suspend fun registerOrUpdateDevice(context: Context, userId: String) {
        withContext(Dispatchers.IO) {
            try {
                val prefs = context.getSharedPreferences(
                    "callbridge_prefs", Context.MODE_PRIVATE
                )
                val deviceDocId = prefs.getString(PREFS_KEY_DEVICE_ID, null)

                val deviceName = "${Build.MANUFACTURER} ${Build.MODEL}"
                val androidVersion = Build.VERSION.RELEASE
                val appVersion = BuildConfig.VERSION_NAME
                val now = java.time.Instant.now().toString()

                // Check actual permission states on the device
                val notificationPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    ContextCompat.checkSelfPermission(
                        context, android.Manifest.permission.POST_NOTIFICATIONS
                    ) == PackageManager.PERMISSION_GRANTED
                } else {
                    true
                }

                // Check if battery optimization is ignored
                val powerManager = context.getSystemService(Context.POWER_SERVICE)
                        as android.os.PowerManager
                val batteryOptIgnored = powerManager.isIgnoringBatteryOptimizations(
                    context.packageName
                )

                if (deviceDocId == null) {
                    // First time — create a new device document
                    val doc = AppwriteClient.databases.createDocument(
                        databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                        collectionId = BuildConfig.APPWRITE_COLLECTION_DEVICES,
                        documentId = ID.unique(),
                        data = mapOf(
                            "user_id" to userId,
                            "device_name" to deviceName,
                            "android_version" to androidVersion,
                            "app_version" to appVersion,
                            "monitoring_active" to true,
                            "monitoring_status" to true,
                            "last_sync" to now,
                            "device_registered_at" to now
                        )
                    )
                    prefs.edit().putString(PREFS_KEY_DEVICE_ID, doc.id).apply()
                    Log.d(TAG, "DeviceRegistration: device registered id=${doc.id}")

                } else {
                    // Already registered — update status fields
                    AppwriteClient.databases.updateDocument(
                        databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                        collectionId = BuildConfig.APPWRITE_COLLECTION_DEVICES,
                        documentId = deviceDocId,
                        data = mapOf(
                            "last_sync" to now,
                            "monitoring_active" to true,
                            "monitoring_status" to true
                        )
                    )
                    Log.d(TAG, "DeviceRegistration: device updated")
                }

            } catch (e: Exception) {
                Log.e(TAG, "DeviceRegistration: failed — ${e.message}")
            }
        }
    }
}