package com.callbridge.app

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface SmsLogDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSmsLog(smsLog: SmsLogEntity)

    @Query("SELECT * FROM sms_logs WHERE isSynced = 0")
    suspend fun getUnsyncedLogs(): List<SmsLogEntity>

    @Query("SELECT * FROM sms_logs WHERE userId = :userId ORDER BY timestamp DESC")
    suspend fun getLogsForUser(userId: String): List<SmsLogEntity>

    @Query("UPDATE sms_logs SET isSynced = 1 WHERE id = :id")
    suspend fun markAsSynced(id: Int)

    @Query("SELECT COUNT(*) FROM sms_logs WHERE userId = :userId")
    suspend fun getTotalCount(userId: String): Int
}