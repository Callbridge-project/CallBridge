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

    /**
     * Finds all unsynced call logs in Room and uploads them to Appwrite.
     */
    suspend fun syncPendingCallLogs(context: Context) {
        withContext(Dispatchers.IO) {
            try {
                val repository = CallLogRepository(context)
                val unsyncedLogs = repository.getUnsyncedLogs()

                if (unsyncedLogs.isEmpty()) {
                    Log.d(TAG, "AppwriteSync: no pending call logs to sync")
                    return@withContext
                }

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
                                "timestamp" to log.timestamp
                            ),
                            permissions = listOf(
                                Permission.read(Role.user(log.userId)),
                                Permission.update(Role.user(log.userId)),
                                Permission.delete(Role.user(log.userId))
                            )
                        )

                        repository.markAsSynced(log.id)
                        Log.d(TAG, "AppwriteSync: synced log id=${log.id} type=${log.logType}")

                    } catch (e: Exception) {
                        Log.e(TAG, "AppwriteSync: failed to sync call log id=${log.id} — ${e.message}")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "AppwriteSync: call sync failed — ${e.message}")
            }

            updateDeviceLastSync(context)
        }
    }

    /**
     * Finds all unsynced SMS logs in Room and uploads them to Appwrite.
     */
    suspend fun syncPendingSmsLogs(context: Context) {
        withContext(Dispatchers.IO) {
            try {
                val repository = SmsLogRepository(context)
                val unsyncedLogs = repository.getUnsyncedLogs()

                if (unsyncedLogs.isEmpty()) {
                    Log.d(TAG, "AppwriteSync: no pending SMS logs to sync")
                    return@withContext
                }

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
                        Log.d(TAG, "AppwriteSync: synced SMS id=${log.id}")

                    } catch (e: Exception) {
                        Log.e(TAG, "AppwriteSync: failed SMS id=${log.id} — ${e.message}")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "AppwriteSync: SMS sync failed — ${e.message}")
            }

            updateDeviceLastSync(context)
        }
    }

    /**
     * Updates Appwrite documents when SMS are marked as read locally.
     */
    suspend fun syncReadStatusUpdates(
        context: Context,
        phoneNumbers: List<String>,
        userId: String
    ) {
        withContext(Dispatchers.IO) {
            try {
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
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "AppwriteSync: read status update failed for $phoneNumber — ${e.message}")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "AppwriteSync: read status sync failed — ${e.message}")
            }
        }
    }

    private suspend fun updateDeviceLastSync(context: Context) {
        val prefs = context.getSharedPreferences("callbridge_prefs", Context.MODE_PRIVATE)
        val userId = prefs.getString("current_user_id", "") ?: ""
        if (userId.isNotEmpty()) {
            DeviceRegistrationService.registerOrUpdateDevice(context, userId)
        }
    }
}
