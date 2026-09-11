package com.callbridge.app.data.remote

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.PowerManager
import android.util.Log
import androidx.core.content.ContextCompat
import com.callbridge.app.BuildConfig
import com.callbridge.app.core.AppwriteClient
import io.appwrite.ID
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.Instant

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

                val manufacturer = Build.MANUFACTURER.trim()
                val model = Build.MODEL.trim()
                val deviceName = if (model.lowercase().startsWith(manufacturer.lowercase())) {
                    model
                } else {
                    "$manufacturer $model"
                }

                val androidVersion = Build.VERSION.RELEASE
                val appVersion = BuildConfig.VERSION_NAME
                val now = Instant.now().toString()

                val notificationPermission =
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        ContextCompat.checkSelfPermission(
                            context, Manifest.permission.POST_NOTIFICATIONS
                        ) == PackageManager.PERMISSION_GRANTED
                    } else true

                val powerManager = context.getSystemService(Context.POWER_SERVICE)
                        as PowerManager
                val batteryOptIgnored = powerManager.isIgnoringBatteryOptimizations(
                    context.packageName
                )

                if (deviceDocId == null) {
                    val doc = AppwriteClient.databases.createDocument(
                        databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                        collectionId = BuildConfig.APPWRITE_COLLECTION_DEVICES,
                        documentId = ID.Companion.unique(),
                        data = mapOf(
                            "user_id" to userId,
                            "device_name" to deviceName,
                            "android_version" to androidVersion,
                            "app_version" to appVersion,
                            "monitoring_status" to true,
                            "notification_permission" to notificationPermission,
                            "battery_optimization_ignored" to batteryOptIgnored,
                            "last_sync" to now,
                            "device_registered_at" to now
                        )
                    )

                    // Try both .id and .$id — log both so we know which works
                    val savedId = doc.id.ifEmpty {
                        doc.data["\$id"]?.toString() ?: ""
                    }
                    Log.d(
                        TAG,
                        "DeviceRegistration: doc.id='${doc.id}' data.\$id='${doc.data["\$id"]}'"
                    )
                    Log.d(TAG, "DeviceRegistration: saving deviceDocId='$savedId'")

                    prefs.edit().putString(PREFS_KEY_DEVICE_ID, savedId).apply()
                    Log.d(TAG, "DeviceRegistration: registered with id=$savedId")

                } else {
                    AppwriteClient.databases.updateDocument(
                        databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                        collectionId = BuildConfig.APPWRITE_COLLECTION_DEVICES,
                        documentId = deviceDocId,
                        data = mapOf(
                            "last_sync" to now,
                            "monitoring_status" to true,
                            "notification_permission" to notificationPermission,
                            "battery_optimization_ignored" to batteryOptIgnored
                        )
                    )
                    Log.d(TAG, "DeviceRegistration: updated id=$deviceDocId")
                }

            } catch (e: Exception) {
                Log.e(TAG, "DeviceRegistration: failed — ${e.message}")
            }
        }
    }
}