package com.callbridge.app

import android.content.Context
import android.util.Log
import io.appwrite.Permission
import io.appwrite.Role
import io.appwrite.ID
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object AppwriteSyncService {


    private const val TAG = "CallBridge"

    // Call this after every detected call event
    // It finds all unsynced rows and uploads them to Appwrite
    suspend fun syncPendingCallLogs(context: Context) {
        withContext(Dispatchers.IO) {
            val repository = CallLogRepository(context)
            val unsyncedLogs = try {
                repository.getUnsyncedLogs()
            } catch (e: Exception) {
                Log.e(TAG, "AppwriteSync: failed to fetch logs — ${e.message}")
                emptyList()
            }

            if (unsyncedLogs.isEmpty()) {
                Log.d(TAG, "AppwriteSync: no pending logs to sync")
            } else {
                Log.d(TAG, "AppwriteSync: found ${unsyncedLogs.size} unsynced log(s)")

                for (log in unsyncedLogs) {
                    try {
                        AppwriteClient.databases.createDocument(
                            databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                            collectionId = BuildConfig.APPWRITE_COLLECTION_CALLLOGS,
                            documentId = ID.unique(),
                            data = mapOf(
                                "user_id" to log.userId,
                                "phone_number" to log.phoneNumber,
                                "contact_name" to log.contactName,
                                "log_type" to log.logType,
                                "timestamp" to log.timestamp,
                            ),
                            permissions = listOf(
                                Permission.read(Role.user(log.userId)),
                                Permission.update(Role.user(log.userId)),
                                Permission.delete(Role.user(log.userId))
                            )
                        )

                        repository.markAsSynced(log.id)
                        Log.d(TAG, "AppwriteSync: synced log id=${log.id} " +
                                "type=${log.logType} number=${log.phoneNumber}")

                    } catch (e: Exception) {
                        Log.e(TAG, "AppwriteSync: failed to sync log id=${log.id} — ${e.message}")
                    }
                }
                Log.d(TAG, "AppwriteSync: sync cycle complete")
            }

            val prefs = context.getSharedPreferences("callbridge_prefs", Context.MODE_PRIVATE)
            val userId = prefs.getString("current_user_id", "") ?: ""

            if (userId.isNotEmpty() && unsyncedLogs.isNotEmpty()) {
                ActivityLogService.logActivity(
                    context = context,
                    userId = userId,
                    activityType = ActivityLogService.TYPE_SYNC_COMPLETED,
                    message = "Synced ${unsyncedLogs.size} call log(s) to dashboard successfully"
                )
            }

            // Update device last_sync timestamp after successful sync
            if (userId.isNotEmpty()) {
                val now = java.time.Instant.now().toString()
                prefs.edit().putString("last_device_sync_time", now).apply()
                DeviceRegistrationService.registerOrUpdateDevice(context, userId)
            }
        }
    }

    suspend fun syncPendingSmsLogs(context: Context) {
        withContext(Dispatchers.IO) {
            val repository = SmsLogRepository(context)
            val unsyncedLogs = try {
                repository.getUnsyncedLogs()
            } catch (e: Exception) {
                Log.e(TAG, "AppwriteSync: failed to fetch SMS logs — ${e.message}")
                emptyList()
            }

            if (unsyncedLogs.isEmpty()) {
                Log.d(TAG, "AppwriteSync: no pending SMS logs to sync")
            } else {
                Log.d(TAG, "AppwriteSync: found ${unsyncedLogs.size} unsynced SMS log(s)")

                for (log in unsyncedLogs) {
                    try {
                        AppwriteClient.databases.createDocument(
                            databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                            collectionId = BuildConfig.APPWRITE_COLLECTION_SMSLOGS,
                            documentId = ID.unique(),
                            data = mapOf(
                                "user_id" to log.userId,
                                "phone_number" to log.phoneNumber,
                                "contact_name" to log.contactName,
                                "message_body" to log.messageBody,
                                "timestamp" to log.timestamp,
                                "log_type" to log.logType,
                                "is_read" to log.isRead
                            )
                        )

                        repository.markAsSynced(log.id)
                        Log.d(TAG, "AppwriteSync: synced SMS id=${log.id} from=${log.phoneNumber}")

                    } catch (e: Exception) {
                        Log.e(TAG, "AppwriteSync: failed SMS id=${log.id} — ${e.message}")
                    }
                }
                Log.d(TAG, "AppwriteSync: SMS sync cycle complete")
            }

            // Post-sync tasks
            val prefs = context.getSharedPreferences("callbridge_prefs", Context.MODE_PRIVATE)
            val userId = prefs.getString("current_user_id", "") ?: ""

            if (userId.isNotEmpty() && unsyncedLogs.isNotEmpty()) {
                ActivityLogService.logActivity(
                    context = context,
                    userId = userId,
                    activityType = ActivityLogService.TYPE_SYNC_COMPLETED,
                    message = "Synced ${unsyncedLogs.size} SMS log(s) to dashboard successfully"
                )
            }

            if (userId.isNotEmpty()) {
                val now = java.time.Instant.now().toString()
                prefs.edit().putString("last_device_sync_time", now).apply()
                DeviceRegistrationService.registerOrUpdateDevice(context, userId)
            }
        }
    }

    suspend fun syncReadStatusUpdates(
        context: Context,
        phoneNumbers: List<String>,
        userId: String
    ) {
        withContext(Dispatchers.IO) {
            try {
                // Find documents in Appwrite that match these phone numbers
                // and are still marked as unread
                for (phoneNumber in phoneNumbers) {
                    try {
                        val results = AppwriteClient.databases.listDocuments(
                            databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                            collectionId = BuildConfig.APPWRITE_COLLECTION_SMSLOGS,
                            queries = listOf(
                                io.appwrite.Query.equal("user_id", userId),
                                io.appwrite.Query.equal("phone_number", phoneNumber),
                                io.appwrite.Query.equal("is_read", false),
                                io.appwrite.Query.equal("log_type", "sms_received")
                            )
                        )

                        for (doc in results.documents) {
                            AppwriteClient.databases.updateDocument(
                                databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                                collectionId = BuildConfig.APPWRITE_COLLECTION_SMSLOGS,
                                documentId = doc.id,
                                data = mapOf("is_read" to true)
                            )
                            Log.d("CallBridge", "AppwriteSync: marked SMS as read doc=${doc.id}")
                        }
                    } catch (e: Exception) {
                        Log.e("CallBridge", "AppwriteSync: read sync error for $phoneNumber — ${e.message}")
                    }
                }
            } catch (e: Exception) {
                Log.e("CallBridge", "AppwriteSync: read status sync failed — ${e.message}")
            }
        }
    }
}