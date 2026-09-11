package com.callbridge.app.data.local

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class CallLogRepository(context: Context) {

    // Get the DAO from the database singleton
    private val dao = CallBridgeDatabase.getInstance(context).callLogDao()

    // Save a detected call event to the local database
    suspend fun saveCallLog(
        userId: String,
        phoneNumber: String,
        contactName: String?,
        logType: String,         // "incoming_call" or "missed_call"
        timestamp: String,
    ) {
        // withContext(Dispatchers.IO) means this runs on a background thread
        // Database operations must never run on the main UI thread
        withContext(Dispatchers.IO) {
            val entity = CallLogEntity(
                userId = userId,
                phoneNumber = phoneNumber,
                contactName = contactName,
                logType = logType,
                timestamp = timestamp,
                isSynced = false  // always starts as unsynced
            )
            dao.insertCallLog(entity)
            Log.d("CallBridge", "Repository: saved $logType from $phoneNumber")
        }
    }

    // Get all logs waiting to be synced to Appwrite
    suspend fun getUnsyncedLogs(): List<CallLogEntity> {
        return withContext(Dispatchers.IO) {
            dao.getUnsyncedLogs()
        }
    }

    // Mark a log as successfully synced
    suspend fun markAsSynced(id: Int) {
        withContext(Dispatchers.IO) {
            dao.markAsSynced(id)
        }
    }

    // Get all logs for display on the Calls screen
    suspend fun getLogsForUser(userId: String): List<CallLogEntity> {
        return withContext(Dispatchers.IO) {
            dao.getLogsForUser(userId)
        }
    }

    suspend fun getTotalCount(userId: String): Int {
        return withContext(Dispatchers.IO) {
            dao.getTotalCount(userId)
        }
    }

    suspend fun getMissedCount(userId: String): Int {
        return withContext(Dispatchers.IO) {
            dao.getMissedCount(userId)
        }
    }
}