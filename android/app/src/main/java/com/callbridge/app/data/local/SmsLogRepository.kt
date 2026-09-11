package com.callbridge.app.data.local

import android.content.Context
import android.util.Log
import com.callbridge.app.data.local.SmsLogEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.Instant

class SmsLogRepository(context: Context) {

    private val dao = CallBridgeDatabase.getInstance(context).smsLogDao()

    suspend fun saveSmsLog(
        userId: String,
        phoneNumber: String,
        contactName: String?,
        messageBody: String?,
        logType: String = "sms_received",
        timestamp: String,
        isRead: Boolean = false
    ) {
        withContext(Dispatchers.IO) {
            // Check if we already saved this same log type from this number
            // in the last 10 seconds — if so skip to prevent duplicates
            val tenSecondsAgo = Instant.now()
                .minusSeconds(10)
                .toString()

            val recentCount = dao.countRecentLogs(
                phoneNumber = phoneNumber,
                logType = logType,
                afterTimestamp = tenSecondsAgo
            )

            if (recentCount > 0) {
                Log.d("CallBridge", "SmsRepository: duplicate detected for $phoneNumber — skipping")
                return@withContext
            }
            val entity = SmsLogEntity(
                userId = userId,
                phoneNumber = phoneNumber,
                contactName = contactName,
                messageBody = messageBody,
                logType = logType,
                timestamp = timestamp,
                isRead = isRead,
                isSynced = false
            )
            dao.insertSmsLog(entity)
            Log.d("CallBridge", "SmsRepository: saved $logType from $phoneNumber")
        }
    }

    suspend fun getUnsyncedLogs(): List<SmsLogEntity> {
        return withContext(Dispatchers.IO) {
            dao.getUnsyncedLogs()
        }
    }

    suspend fun markAsSynced(id: Int) {
        withContext(Dispatchers.IO) {
            dao.markAsSynced(id)
        }
    }

    suspend fun getLogsForUser(userId: String): List<SmsLogEntity> {
        return withContext(Dispatchers.IO) {
            dao.getLogsForUser(userId)
        }
    }

    suspend fun getTotalCount(userId: String): Int {
        return withContext(Dispatchers.IO) {
            dao.getTotalCount(userId)
        }
    }
}