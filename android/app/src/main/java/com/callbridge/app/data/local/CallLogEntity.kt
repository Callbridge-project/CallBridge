package com.callbridge.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

// @Entity tells Room this class is a database table
// tableName is what the table is called in the SQLite database
@Entity(tableName = "call_logs")
data class CallLogEntity(

    // @PrimaryKey(autoGenerate = true) means Room automatically
    // assigns a unique ID to each row — you never set this yourself
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,

    val userId: String,
    val phoneNumber: String,
    val contactName: String?,      // nullable — unknown callers have no name
    val logType: String,           // "incoming_call" or "missed_call"
    val timestamp: String,

    // isSynced tracks whether this event has been sent to Appwrite yet
    // false = waiting to sync, true = already uploaded
    val isSynced: Boolean = false
)