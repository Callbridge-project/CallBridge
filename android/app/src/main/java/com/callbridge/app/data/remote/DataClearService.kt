package com.callbridge.app.data.remote

import android.content.Context
import android.util.Log
import com.callbridge.app.BuildConfig
import com.callbridge.app.core.AppwriteClient
import com.callbridge.app.data.local.CallBridgeDatabase
import io.appwrite.Query
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object DataClearService {

    private const val TAG = "CallBridge"

    suspend fun clearAllUserData(
        context: Context,
        userId: String,
        onProgress: (String) -> Unit = {}
    ): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                onProgress("Clearing call logs...")
                deleteCollectionDocs(
                    userId = userId,
                    collectionId = BuildConfig.APPWRITE_COLLECTION_CALLLOGS
                )

                onProgress("Clearing SMS logs...")
                deleteCollectionDocs(
                    userId = userId,
                    collectionId = BuildConfig.APPWRITE_COLLECTION_SMSLOGS
                )

                onProgress("Clearing activity logs...")
                deleteCollectionDocs(
                    userId = userId,
                    collectionId = BuildConfig.APPWRITE_COLLECTION_ACTIVITYLOGS
                )

                onProgress("Clearing local database...")
                // Clear Room database tables
                val db = CallBridgeDatabase.Companion.getInstance(context)
                db.callLogDao().deleteAllForUser(userId)
                db.smsLogDao().deleteAllForUser(userId)

                // Log that data was cleared
                ActivityLogService.logActivity(
                    context = context,
                    userId = userId,
                    activityType = "data_cleared",
                    message = "All call and SMS logs were manually erased by the user"
                )

                Log.d(TAG, "DataClear: all user data cleared successfully")
                Result.success(Unit)

            } catch (e: Exception) {
                Log.e(TAG, "DataClear: failed — ${e.message}")
                Result.failure(e)
            }
        }
    }

    private suspend fun deleteCollectionDocs(userId: String, collectionId: String) {
        var hasMore = true
        var deleted = 0

        while (hasMore) {
            val docs = AppwriteClient.databases.listDocuments(
                databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                collectionId = collectionId,
                queries = listOf(
                    Query.Companion.equal("user_id", userId),
                    Query.Companion.limit(100)
                )
            )

            if (docs.documents.isEmpty()) {
                hasMore = false
                break
            }

            for (doc in docs.documents) {
                try {
                    AppwriteClient.databases.deleteDocument(
                        databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                        collectionId = collectionId,
                        documentId = doc.id
                    )
                    deleted++
                } catch (e: Exception) {
                    Log.e(TAG, "DataClear: failed to delete ${doc.id} — ${e.message}")
                }
            }

            // If we got less than 100 there are no more pages
            if (docs.documents.size < 100) hasMore = false
        }

        Log.d(TAG, "DataClear: deleted $deleted docs from $collectionId")
    }
}