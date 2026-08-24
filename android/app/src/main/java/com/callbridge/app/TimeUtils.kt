package com.callbridge.app

import java.text.SimpleDateFormat
import java.util.*
import java.time.Instant
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

fun formatTimestamp(isoTimestamp: String?): String {
    if (isoTimestamp.isNullOrEmpty() || isoTimestamp == "—") return "—"
    
    val cleanTimestamp = isoTimestamp.trim()
    
    return try {
        val instant = parseToInstant(cleanTimestamp)
        val now = Instant.now()
        val diffSeconds = now.epochSecond - instant.epochSecond
        
        when {
            diffSeconds < 0 -> "Just now" 
            diffSeconds < 60 -> "Just now"
            diffSeconds < 3600 -> "${diffSeconds / 60}m ago"
            diffSeconds < 86400 -> "${diffSeconds / 3600}h ago"
            else -> SimpleDateFormat("MMM d", Locale.getDefault()).format(Date.from(instant))
        }
    } catch (e: Exception) {
        android.util.Log.e("CallBridge", "TimeUtils: Failed to parse '$cleanTimestamp' - ${e.message}")
        "—"
    }
}

private fun parseToInstant(timestamp: String): Instant {
    return try {
        Instant.parse(timestamp)
    } catch (e: Exception) {
        try {
            OffsetDateTime.parse(timestamp, DateTimeFormatter.ISO_DATE_TIME).toInstant()
        } catch (e2: Exception) {
            // Try parsing with a space instead of T
            try {
                val replaced = timestamp.replace(" ", "T")
                if (!replaced.contains("Z") && !replaced.contains("+") && !replaced.contains("-")) {
                   Instant.parse(replaced + "Z")
                } else {
                   Instant.parse(replaced)
                }
            } catch (e3: Exception) {
                // Last ditch effort for common SQL-like formats
                val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
                sdf.parse(timestamp)?.toInstant() ?: throw e3
            }
        }
    }
}

fun formatFullDate(isoTimestamp: String?): String {
    if (isoTimestamp.isNullOrEmpty() || isoTimestamp == "—") return "—"
    
    return try {
        val instant = parseToInstant(isoTimestamp.trim())
        val sdf = SimpleDateFormat("MMM d, yyyy", Locale.getDefault())
        sdf.format(Date.from(instant))
    } catch (e: Exception) {
        android.util.Log.e("CallBridge", "formatFullDate failed for '$isoTimestamp': ${e.message}")
        "—"
    }
}

fun formatDateTime(isoTimestamp: String?): String {
    if (isoTimestamp.isNullOrEmpty() || isoTimestamp == "—") return "—"
    
    return try {
        val instant = parseToInstant(isoTimestamp.trim())
        val sdf = SimpleDateFormat("MMM d, yyyy • hh:mm a", Locale.getDefault())
        sdf.format(Date.from(instant))
    } catch (e: Exception) {
        "—"
    }
}

fun formatBeautifulSyncTime(isoTimestamp: String?): String {
    if (isoTimestamp.isNullOrEmpty() || isoTimestamp == "—") return "—"
    
    val timeAgo = formatTimestamp(isoTimestamp)
    val fullDate = formatDateTime(isoTimestamp)
    
    return if (timeAgo == "Just now" || timeAgo.endsWith("ago")) {
        "$timeAgo ($fullDate)"
    } else {
        fullDate
    }
}
