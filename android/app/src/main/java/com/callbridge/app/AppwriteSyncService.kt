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
            try {
                val repository = CallLogRepository(context)
                val unsyncedLogs = repository.getUnsyncedLogs()

                if (unsyncedLogs.isEmpty()) {
                    Log.d(TAG, "AppwriteSync: no pending logs to sync")
                    return@withContext
                }

                Log.d(TAG, "AppwriteSync: found ${unsyncedLogs.size} unsynced log(s)")

                for (log in unsyncedLogs) {
                    try {
                        // POST the call log document to Appwrite
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

                        // Mark as synced in Room only after
                        // Appwrite confirms the document was created
                        repository.markAsSynced(log.id)

                        Log.d(TAG, "AppwriteSync: synced log id=${log.id} " +
                                "type=${log.logType} number=${log.phoneNumber}")

                    } catch (e: Exception) {
                        // If one log fails do not stop — continue to the next one
                        // It will be retried on the next sync cycle
                        Log.e(TAG, "AppwriteSync: failed to sync log id=${log.id} — ${e.message}")
                    }
                }

                Log.d(TAG, "AppwriteSync: sync cycle complete")

            } catch (e: Exception) {
                Log.e(TAG, "AppwriteSync: sync failed — ${e.message}")
            }
            // Update device last_sync timestamp after successful sync
            val prefs = context.getSharedPreferences("callbridge_prefs", Context.MODE_PRIVATE)
            val userId = prefs.getString("current_user_id", "") ?: ""
            if (userId.isNotEmpty()) {
                DeviceRegistrationService.registerOrUpdateDevice(context, userId)
            }
        }
    }
}