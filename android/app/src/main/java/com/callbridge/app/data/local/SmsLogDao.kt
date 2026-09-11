package com.callbridge.app.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.callbridge.app.data.local.SmsLogEntity

@Dao
interface SmsLogDao {

    @Insert(onConflict = OnConflictStrategy.Companion.REPLACE)
    suspend fun insertSmsLog(smsLog: SmsLogEntity)

    // Check if a sent SMS already exists by phone number and approximate timestamp
    // Used to prevent duplicates from rapid onChange triggers
    @Query("""
        SELECT COUNT(*) FROM sms_logs 
        WHERE phoneNumber = :phoneNumber 
        AND logType = :logType 
        AND timestamp > :afterTimestamp
    """)
    suspend fun countRecentLogs(
        phoneNumber: String,
        logType: String,
        afterTimestamp: String
    ): Int

    @Query("SELECT * FROM sms_logs WHERE isSynced = 0")
    suspend fun getUnsyncedLogs(): List<SmsLogEntity>

    @Query("SELECT * FROM sms_logs WHERE userId = :userId ORDER BY timestamp DESC")
    suspend fun getLogsForUser(userId: String): List<SmsLogEntity>

    @Query("UPDATE sms_logs SET isSynced = 1 WHERE id = :id")
    suspend fun markAsSynced(id: Int)

    @Query("SELECT COUNT(*) FROM sms_logs WHERE userId = :userId")
    suspend fun getTotalCount(userId: String): Int

    @Query("DELETE FROM sms_logs WHERE userId = :userId")
    suspend fun deleteAllForUser(userId: String)
}