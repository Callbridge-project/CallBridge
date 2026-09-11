package com.callbridge.app.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.callbridge.app.data.local.CallLogEntity

@Dao
interface CallLogDao {

    // Insert one call log — if the same row somehow exists, replace it
    @Insert(onConflict = OnConflictStrategy.Companion.REPLACE)
    suspend fun insertCallLog(callLog: CallLogEntity)

    // Get all logs that have not been synced to Appwrite yet
    // This is used by the sync worker to find pending events
    @Query("SELECT * FROM call_logs WHERE isSynced = 0")
    suspend fun getUnsyncedLogs(): List<CallLogEntity>

    // Get all logs for the current user sorted newest first
    // This is used by the Calls screen to display the log list
    @Query("SELECT * FROM call_logs WHERE userId = :userId ORDER BY timestamp DESC")
    suspend fun getLogsForUser(userId: String): List<CallLogEntity>

    // Mark a specific log as synced after it has been uploaded to Appwrite
    @Query("UPDATE call_logs SET isSynced = 1 WHERE id = :id")
    suspend fun markAsSynced(id: Int)

    // Get total count of logs for a user — used by the dashboard summary cards
    @Query("SELECT COUNT(*) FROM call_logs WHERE userId = :userId")
    suspend fun getTotalCount(userId: String): Int

    // Get count of missed calls — used by the dashboard missed calls card
    @Query("SELECT COUNT(*) FROM call_logs WHERE userId = :userId AND logType = 'missed_call'")
    suspend fun getMissedCount(userId: String): Int

    @Query("DELETE FROM call_logs WHERE userId = :userId")
    suspend fun deleteAllForUser(userId: String)
}