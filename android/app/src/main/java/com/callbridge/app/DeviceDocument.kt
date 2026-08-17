package com.callbridge.app.data

import com.google.gson.annotations.SerializedName

/**
 * Type-safe model for the Devices collection.
 * This class now aligns perfectly with your Appwrite database schema.
 * @SerializedName attributes match your database keys exactly.
 */
data class DeviceDocument(
    @SerializedName("device_name") val deviceName: String = "",
    @SerializedName("android_version") val androidVersion: String = "",
    @SerializedName("app_version") val appVersion: String = "",

    // Database types are Boolean. Ensure these match.
    @SerializedName("monitoring_status") val monitoringStatus: Boolean = false,
    @SerializedName("notification_permission") val notificationPermission: Boolean = false,
    @SerializedName("battery_optimization_ignored") val batteryOptimizationIgnored: Boolean = false,

    // Appwrite returns datetime as formatted String. String is correct here.
    @SerializedName("last_sync") val lastSync: String = "",
    @SerializedName("device_registered_at") val deviceRegisteredAt: String = "",

    @SerializedName("user_id") val userId: String = ""
)