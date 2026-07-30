package com.callbridge.app

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class SmsLogRepository(context: Context) {

    private val dao = CallBridgeDatabase.getInstance(context).smsLogDao()

    suspend fun saveSmsLog(
        userId: String,
        phoneNumber: String,
        contactName: String?,
        messageBody: String?,
        logType: String = "sms_received",
        timestamp: String,
        isRead: Boolean
    ) {
        withContext(Dispatchers.IO) {
            val entity = SmsLogEntity(
                userId = userId,
                phoneNumber = phoneNumber,
                contactName = contactName,
                messageBody = messageBody,
                logType = logType,
                timestamp = timestamp,
                isRead = isRead,
                isSynced = isRead
            )
            dao.insertSmsLog(entity)
            Log.d("CallBridge", "SmsRepository: saved sms_received from $phoneNumber")
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