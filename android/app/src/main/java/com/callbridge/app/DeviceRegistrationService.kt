package com.callbridge.app

import android.content.Context
import android.os.Build
import android.util.Log
import io.appwrite.ID
import io.appwrite.Permission
import io.appwrite.Role
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object DeviceRegistrationService {

    private const val TAG = "CallBridge"
    private const val PREFS_KEY_DEVICE_ID = "registered_device_id"

    suspend fun registerOrUpdateDevice(context: Context, userId: String) {
        withContext(Dispatchers.IO) {
            try {
                val prefs = context.getSharedPreferences("callbridge_prefs", Context.MODE_PRIVATE)
                var deviceDocId = prefs.getString(PREFS_KEY_DEVICE_ID, null)

                val deviceName = "${Build.MANUFACTURER} ${Build.MODEL}"
                val androidVersion = Build.VERSION.RELEASE
                val appVersion = BuildConfig.VERSION_NAME
                val now = java.time.Instant.now().toString()

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
                            "monitoring_status" to "active",
                            "last_sync" to now,
                            "registered_at" to now
                        ),
                        permissions = listOf(
                            Permission.read(Role.user(userId)),
                            Permission.update(Role.user(userId)),
                            Permission.delete(Role.user(userId))
                        )
                    )
                    // Save the document ID so we update it next time
                    prefs.edit().putString(PREFS_KEY_DEVICE_ID, doc.id).apply()
                    Log.d(TAG, "DeviceRegistration: device registered id=${doc.id}")
                } else {
                    // Already registered — just update last_sync
                    AppwriteClient.databases.updateDocument(
                        databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                        collectionId = BuildConfig.APPWRITE_COLLECTION_DEVICES,
                        documentId = deviceDocId,
                        data = mapOf(
                            "last_sync" to now,
                            "monitoring_active" to true,
                            "monitoring_status" to "active"
                        )
                    )
                    Log.d(TAG, "DeviceRegistration: device last_sync updated")
                }
            } catch (e: Exception) {
                Log.e(TAG, "DeviceRegistration: failed — ${e.message}")
            }
        }
    }
}