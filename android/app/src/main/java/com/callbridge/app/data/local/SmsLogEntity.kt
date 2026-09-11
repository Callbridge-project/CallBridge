package com.callbridge.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sms_logs")
data class SmsLogEntity(

    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,

    val userId: String,
    val phoneNumber: String,
    val contactName: String?,
    val messageBody: String?,
    val timestamp: String,
    val logType: String = "sms_received",

    // Whether the SMS has been opened/read on the device
    val isRead: Boolean = false,

    // isSynced tracks whether this has been uploaded to Appwrite
    val isSynced: Boolean = false
)