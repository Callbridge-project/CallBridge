package com.callbridge.app.data.remote

import android.content.Context
import android.util.Log
import com.callbridge.app.BuildConfig
import com.callbridge.app.core.AppwriteClient
import io.appwrite.ID
import io.appwrite.Query
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.Instant
import java.time.temporal.ChronoUnit

object ActivityLogService {

    private const val TAG = "CallBridge"

    // These must match exactly what ActivityLogsPage.tsx expects
    // in its getActivityConfig switch statement
    const val TYPE_CALL_DETECTED = "call_detected"
    const val TYPE_SMS_DETECTED = "sms_detected"
    const val TYPE_MONITORING_STARTED = "monitoring_started"
    const val TYPE_MONITORING_STOPPED = "monitoring_stopped"
    const val TYPE_DEVICE_CONNECTED = "device_connected"
    const val TYPE_SYNC_COMPLETED = "sync_completed"
    const val TYPE_SYNC_FAILED = "sync_failed"
    const val TYPE_LOGIN = "login_success"
    const val TYPE_LOGOUT = "session_ended"
    const val TYPE_PERMISSION_WARNING = "permission_warning"

    suspend fun logActivity(
        context: Context,
        userId: String,
        activityType: String,
        message: String,
        deviceId: String? = null
    ) {
        withContext(Dispatchers.IO) {
            try {
                val prefs = context.getSharedPreferences(
                    "callbridge_prefs", Context.MODE_PRIVATE
                )
                val resolvedUserId = userId.ifEmpty {
                    prefs.getString("current_user_id", "") ?: ""
                }

                if (resolvedUserId.isEmpty()) {
                    Log.w(TAG, "ActivityLog: skipping — userId is empty")
                    return@withContext
                }

                val resolvedDeviceId = deviceId
                    ?: prefs.getString("registered_device_id", null)

                // Field names must match Appwrite schema exactly:
                // activity_type, activity_message, timestamp, user_id, device_id
                val data = mutableMapOf<String, Any>(
                    "user_id" to resolvedUserId,
                    "activity_type" to activityType,
                    "activity_message" to message,  // NOT "description"
                    "timestamp" to Instant.now().toString()
                )

                if (resolvedDeviceId != null) {
                    data["device_id"] = resolvedDeviceId
                }

                AppwriteClient.databases.createDocument(
                    databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                    collectionId = BuildConfig.APPWRITE_COLLECTION_ACTIVITYLOGS,
                    documentId = ID.Companion.unique(),
                    data = data
                )

                Log.d(TAG, "ActivityLog: logged '$activityType' — $message")

            } catch (e: Exception) {
                Log.e(TAG, "ActivityLog: failed '$activityType' — ${e.message}")
            }
        }
    }

    // Delete logs older than 14 days — runs on every service start
    suspend fun cleanupOldLogs(context: Context, userId: String) {
        withContext(Dispatchers.IO) {
            try {
                val fourteenDaysAgo = Instant.now()
                    .minus(14, ChronoUnit.DAYS)
                    .toString()

                val oldLogs = AppwriteClient.databases.listDocuments(
                    databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                    collectionId = BuildConfig.APPWRITE_COLLECTION_ACTIVITYLOGS,
                    queries = listOf(
                        Query.equal("user_id", userId),
                        Query.lessThan("timestamp", fourteenDaysAgo),
                        Query.limit(100)
                    )
                )

                var deleted = 0
                for (doc in oldLogs.documents) {
                    try {
                        AppwriteClient.databases.deleteDocument(
                            databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                            collectionId = BuildConfig.APPWRITE_COLLECTION_ACTIVITYLOGS,
                            documentId = doc.id
                        )
                        deleted++
                    } catch (e: Exception) {
                        Log.e(TAG, "ActivityLog cleanup: failed ${doc.id} — ${e.message}")
                    }
                }

                if (deleted > 0) {
                    Log.d(TAG, "ActivityLog: cleaned $deleted logs older than 14 days")
                }

            } catch (e: Exception) {
                Log.e(TAG, "ActivityLog cleanup failed — ${e.message}")
            }
        }
    }
}