package com.callbridge.app

import android.content.Context
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.callbridge.app.data.DeviceDocument
import com.google.gson.Gson
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

private const val LogTag = "CallBridge.Dashboard"

data class ActivityItem(
    val type: String,
    val number: String,
    val contact: String?,
    val timestamp: String
)

@Composable
fun DashboardScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // ── Colors ────────────────────────────────────────────────────
    val primaryBlue = Color(0xFF4A90D9)
    val deepBlue = Color(0xFF1A3A6B)
    val nearBlack = Color(0xFF0A0A1A)
    val mutedText = Color(0xFF6B7A99)
    val cardBorder = Color(0xFFE0E7F0)
    val screenBg = Color(0xFFF5F7FA)
    val white = Color.White

    // ── State ─────────────────────────────────────────────────────
    var userName by remember { mutableStateOf("") }
    var userInitials by remember { mutableStateOf("") }
    var notificationsEnabled by remember { mutableStateOf(true) }
    var isSyncing by remember { mutableStateOf(false) }
    var callCount by remember { mutableIntStateOf(0) }
    var smsCount by remember { mutableIntStateOf(0) }
    var lastSync by remember { mutableStateOf("") }
    var deviceName by remember { mutableStateOf("") }
    var androidVersion by remember { mutableStateOf("") }
    var recentActivity by remember { mutableStateOf<List<ActivityItem>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }

    // Sync button rotation animation
    val rotation = remember { Animatable(0f) }

    val infiniteTransition = rememberInfiniteTransition(label = "pulseTransition")

    // Animate dot scale
    val dotScale by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1.3f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 800, easing = LinearOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "dotScale"
    )

    // Animate dot opacity
    val dotAlpha by infiniteTransition.animateFloat(
        initialValue = 0.5f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 800, easing = LinearOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "dotAlpha"
    )

    // ── Load data on mount ────────────────────────────────────────
    LaunchedEffect(Unit) {
        isLoading = true
        try {
            // 1. Get current user profile
            val userResult = AuthService.getCurrentUser()
            if (userResult.isSuccess) {
                val user = userResult.getOrNull()
                val name = user?.name ?: "User"
                userName = name
                userInitials = name.split(" ")
                    .filter { it.isNotBlank() }
                    .take(2)
                    .joinToString("") { it.firstOrNull()?.uppercase() ?: "" }
            }

            // 2. Load preferences
            val prefs = context.getSharedPreferences("callbridge_prefs", Context.MODE_PRIVATE)
            val userId = prefs.getString("current_user_id", "") ?: ""
            val deviceDocId = prefs.getString("registered_device_id", null)

            android.util.Log.d(LogTag, "Loading dashboard data for userId: '$userId'")

            // 3. Combine Room data and Appwrite device data loading
            if (userId.isNotEmpty()) {
                val callRepo = CallLogRepository(context)
                callCount = callRepo.getTotalCount(userId)

                val smsRepo = SmsLogRepository(context)
                smsCount = smsRepo.getTotalCount(userId)

                // Optimized activity loading
                val recentCalls = callRepo.getLogsForUser(userId).take(4)
                val recentSms = smsRepo.getLogsForUser(userId).take(4)

                recentActivity = (recentCalls.map {
                    ActivityItem(
                        type = it.logType,
                        number = it.phoneNumber,
                        contact = it.contactName,
                        timestamp = it.timestamp
                    )
                } + recentSms.map {
                    ActivityItem(
                        type = it.logType,
                        number = it.phoneNumber,
                        contact = it.contactName,
                        timestamp = it.timestamp
                    )
                }).sortedByDescending { it.timestamp }.take(4)
            }

            // 4. Load device info from Appwrite
            if (deviceDocId != null) {
                try {
                    android.util.Log.d(LogTag, "Fetching device document: '$deviceDocId'")
                    val doc = AppwriteClient.databases.getDocument(
                        databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                        collectionId = BuildConfig.APPWRITE_COLLECTION_DEVICES,
                        documentId = deviceDocId
                    )

                    // Convert the Appwrite doc data to our typed class
                    val deviceData = doc.convertTo(DeviceDocument::class.java)
                    val rawData = doc.data

                    android.util.Log.d(LogTag, "Parsed Device Data: $deviceData")

                    val finalDeviceName = deviceData?.deviceName ?: rawData["device_name"]?.toString() ?: ""
                    val finalAndroidVersion = deviceData?.androidVersion ?: rawData["android_version"]?.toString() ?: ""
                    val finalLastSync = deviceData?.lastSync ?: rawData["last_sync"]?.toString() ?: ""
                    val localLastSync = prefs.getString("last_device_sync_time", "")

                    deviceName = finalDeviceName.ifEmpty {
                        val manufacturer = android.os.Build.MANUFACTURER
                        val model = android.os.Build.MODEL
                        if (model.startsWith(manufacturer, ignoreCase = true)) {
                            model
                        } else {
                            "${manufacturer.replaceFirstChar { it.uppercase() }} $model"
                        }
                    }
                    
                    androidVersion = "Android ${finalAndroidVersion.ifEmpty {
                        android.os.Build.VERSION.RELEASE
                    }}"
                    
                    lastSync = if (finalLastSync.isNotEmpty() || !localLastSync.isNullOrEmpty()) {
                        formatTimestamp(finalLastSync.ifEmpty { localLastSync })
                    } else {
                        "Never synced"
                    }

                    android.util.Log.d(LogTag, "Device info loaded: $deviceName, lastSync: $lastSync")
                } catch (e: Exception) {
                    android.util.Log.e(LogTag, "Failed to load Appwrite device doc: ${e.message}")
                    deviceName = "${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL}"
                    androidVersion = "Android ${android.os.Build.VERSION.RELEASE}"
                    lastSync = "Error loading"
                }
            } else {
                android.util.Log.w(LogTag, "No device ID found in preferences")
                deviceName = "${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL}"
                androidVersion = "Android ${android.os.Build.VERSION.RELEASE}"
                lastSync = ""
            }

        } catch (e: Exception) {
            android.util.Log.e(LogTag, "Dashboard general load error: ${e.message}")
        } finally {
            isLoading = false
        }
    }

    // ── Sync handler ──────────────────────────────────────────────
    fun handleSync() {
        if (isSyncing) return
        isSyncing = true
        scope.launch {
            // Spin animation
            rotation.animateTo(
                targetValue = 360f,
                animationSpec = infiniteRepeatable(
                    animation = tween(800, easing = LinearEasing),
                    repeatMode = RepeatMode.Restart
                )
            )
        }
        scope.launch {
            try {
                AppwriteSyncService.syncPendingCallLogs(context)
                AppwriteSyncService.syncPendingSmsLogs(context)

                // Refresh counts after sync
                val prefs = context.getSharedPreferences("callbridge_prefs", Context.MODE_PRIVATE)
                val userId = prefs.getString("current_user_id", "") ?: ""
                if (userId.isNotEmpty()) {
                    callCount = CallLogRepository(context).getTotalCount(userId)
                    smsCount = SmsLogRepository(context).getTotalCount(userId)
                }

                lastSync = "Just now"
            } catch (e: Exception) {
                android.util.Log.e(LogTag, "Sync error: ${e.message}")
            } finally {
                isSyncing = false
                rotation.stop()
                rotation.snapTo(0f)
            }
        }
    }

    // ── UI ────────────────────────────────────────────────────────
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(screenBg)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp)
            .padding(top = 20.dp, bottom = 24.dp)
    ) {

        // ── Header row ────────────────────────────────────────────
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Avatar
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(primaryBlue.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = userInitials.ifEmpty { "U" },
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = deepBlue
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Text(
                        text = "Welcome back,",
                        fontSize = 13.sp,
                        color = mutedText
                    )
                    Text(
                        text = userName.ifEmpty { "User" },
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = nearBlack
                    )
                }
            }

            // Notification bell
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(white)
                    .border(1.dp, cardBorder, CircleShape)
                    .clickable { notificationsEnabled = !notificationsEnabled },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(
                        id = android.R.drawable.ic_popup_reminder
                    ),
                    contentDescription = if (notificationsEnabled)
                        "Disable notifications" else "Enable notifications",
                    tint = if (notificationsEnabled) primaryBlue else mutedText,
                    modifier = Modifier.size(22.dp)
                )
                if (notificationsEnabled) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFE53935))
                            .border(2.dp, white, CircleShape)
                            .align(Alignment.TopEnd)
                            .offset(x = 2.dp, y = (-2).dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // ── Monitoring Status Card ────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(deepBlue, primaryBlue)
                    )
                )
                .padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            painter = painterResource(id = android.R.drawable.ic_menu_sort_by_size),
                            contentDescription = null,
                            tint = white.copy(alpha = 0.8f),
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Monitoring Status",
                            fontSize = 13.sp,
                            color = white.copy(alpha = 0.8f)
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Active",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = white
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .graphicsLayer {
                                    scaleX = dotScale
                                    scaleY = dotScale
                                    alpha = dotAlpha
                                }
                                .clip(CircleShape)
                                .background(Color(0xFF4CAF50))
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "Your device is being monitored",
                        fontSize = 13.sp,
                        color = white.copy(alpha = 0.75f)
                    )
                }

                // Shield icon
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(white.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.active),
                        contentDescription = null,
                        tint = white,
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // ── Stats Grid ────────────────────────────────────────────
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard(
                modifier = Modifier.weight(1f),
                iconRes = R.drawable.callpermissions,
                iconBg = Color(0xFFEEF4FF),
                iconTint = deepBlue,
                label = "Calls Synced",
                primaryValue = callCount.toString(),
                secondaryValue = "Today →",
                cardBorder = cardBorder,
                nearBlack = nearBlack,
                mutedText = mutedText
            )

            StatCard(
                modifier = Modifier.weight(1f),
                iconRes = R.drawable.synnow,
                iconBg = Color(0xFFEEF4FF),
                iconTint = deepBlue,
                label = "Last Sync",
                primaryValue = lastSync.ifEmpty { "—" },
                secondaryValue = formatFullDate(),
                cardBorder = cardBorder,
                nearBlack = nearBlack,
                mutedText = mutedText
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard(
                modifier = Modifier.weight(1f),
                iconRes = R.drawable.sms,
                iconBg = Color(0xFFEEF4FF),
                iconTint = deepBlue,
                label = "SMS Synced",
                primaryValue = smsCount.toString(),
                secondaryValue = "Today →",
                cardBorder = cardBorder,
                nearBlack = nearBlack,
                mutedText = mutedText
            )

            StatCard(
                modifier = Modifier.weight(1f),
                iconRes = R.drawable.devicedash,
                iconBg = Color(0xFFEEF4FF),
                iconTint = deepBlue,
                label = "Device",
                primaryValue = androidVersion.ifEmpty { "Android" },
                secondaryValue = deviceName.ifEmpty { "—" },
                cardBorder = cardBorder,
                nearBlack = nearBlack,
                mutedText = mutedText
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // ── Recent Activity ───────────────────────────────────────
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Recent Activity",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = nearBlack
            )
            Text(
                text = "View all",
                fontSize = 14.sp,
                color = mutedText,
                modifier = Modifier.clickable { }
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = primaryBlue, strokeWidth = 2.dp)
            }
        } else if (recentActivity.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(white)
                    .border(1.dp, cardBorder, RoundedCornerShape(14.dp))
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No activity yet.\nMake or receive a call to get started.",
                    fontSize = 14.sp,
                    color = mutedText,
                    textAlign = TextAlign.Center,
                    lineHeight = 22.sp
                )
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(white)
                    .border(1.dp, cardBorder, RoundedCornerShape(14.dp))
            ) {
                recentActivity.forEachIndexed { index, item ->
                    ActivityRow(
                        item = item,
                        nearBlack = nearBlack,
                        mutedText = mutedText
                    )
                    if (index < recentActivity.size - 1) {
                        HorizontalDivider(
                            color = Color(0xFFF0F4F8),
                            thickness = 1.dp,
                            modifier = Modifier.padding(horizontal = 16.dp)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // ── Quick Actions ─────────────────────────────────────────
        Text(
            text = "Quick Actions",
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
            color = nearBlack,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Sync Now
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(14.dp))
                    .background(white)
                    .border(1.dp, cardBorder, RoundedCornerShape(14.dp))
                    .clickable { handleSync() }
                    .padding(18.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.synnow),
                        contentDescription = "Sync",
                        tint = if (isSyncing) primaryBlue else nearBlack,
                        modifier = Modifier
                            .size(22.dp)
                            .rotate(if (isSyncing) rotation.value else 0f)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = if (isSyncing) "Syncing..." else "Sync Now",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (isSyncing) primaryBlue else nearBlack
                    )
                }
            }


        }
        Spacer(modifier = Modifier.height(8.dp))
    }
}

// ── Stat card ─────────────────────────────────────────────────────
@Composable
fun StatCard(
    modifier: Modifier = Modifier,
    iconRes: Int,
    iconBg: Color,
    iconTint: Color,
    label: String,
    primaryValue: String,
    secondaryValue: String,
    cardBorder: Color,
    nearBlack: Color,
    mutedText: Color
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .background(Color.White)
            .border(1.dp, cardBorder, RoundedCornerShape(14.dp))
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(iconBg),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = iconRes),
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(18.dp)
                )
            }
            Text(
                text = secondaryValue,
                fontSize = 11.sp,
                color = mutedText
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        Text(
            text = primaryValue,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = nearBlack
        )

        Spacer(modifier = Modifier.height(2.dp))

        Text(
            text = label,
            fontSize = 12.sp,
            color = mutedText
        )
    }
}

// ── Activity row ──────────────────────────────────────────────────
@Composable
fun ActivityRow(
    item: ActivityItem,
    nearBlack: Color,
    mutedText: Color
) {
    val style = when {
        item.type.contains("missed") -> ActivityStyle(R.drawable.missedcall, Color(0xFFFFEBEE), Color(0xFFE53935), "Missed Call")
        item.type.contains("incoming") -> ActivityStyle(R.drawable.answeredcall, Color(0xFFF0FDF4), Color(0xFF10B981), "Incoming Call")
        item.type.contains("sms_received") -> ActivityStyle(R.drawable.unreadsms, Color(0xFFE3F2FD), Color(0xFF3B82F6), "SMS Received")
        item.type.contains("sms_sent") -> ActivityStyle(R.drawable.readsms, Color(0xFFF3E5F5), Color(0xFF7B1FA2), "SMS Sent")
        else -> ActivityStyle(android.R.drawable.ic_menu_call, Color(0xFFEEF4FF), Color(0xFF1A3A6B), item.type.replace("_", " "))
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(42.dp)
                .clip(CircleShape)
                .background(style.iconBg),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                painter = painterResource(id = style.iconRes),
                contentDescription = null,
                tint = style.iconTint,
                modifier = Modifier.size(20.dp)
            )
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = style.label.replaceFirstChar { it.uppercase() },
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = nearBlack
            )
            Text(
                text = item.contact ?: item.number,
                fontSize = 12.sp,
                color = mutedText
            )
        }

        Column(horizontalAlignment = Alignment.End) {
            Text(
                text = formatTimeOnly(item.timestamp),
                fontSize = 12.sp,
                color = nearBlack
            )
            Text(
                text = formatDateOnly(item.timestamp),
                fontSize = 11.sp,
                color = mutedText
            )
        }
    }
}

data class ActivityStyle(
    val iconRes: Int,
    val iconBg: Color,
    val iconTint: Color,
    val label: String
)

// ── Helper Extensions ─────────────────────────────────────────────

/**
 * Extension to convert Appwrite Document map data to a typed class using Gson.
 */
private fun <T> io.appwrite.models.Document<*>.convertTo(clazz: Class<T>): T? {
    return try {
        val gson = Gson()
        val json = gson.toJson(this.data)
        gson.fromJson(json, clazz)
    } catch (_: Exception) {
        null
    }
}

// ── Time formatters ───────────────────────────────────────────────


private fun formatTimeOnly(isoTimestamp: String): String {
    return try {
        val sdf = SimpleDateFormat("hh:mm a", Locale.getDefault())
        val date = java.time.Instant.parse(isoTimestamp).let { Date.from(it) }
        sdf.format(date)
    } catch (_: Exception) { "" }
}

private fun formatDateOnly(isoTimestamp: String): String {
    return try {
        val sdf = SimpleDateFormat("MMM d", Locale.getDefault())
        val date = java.time.Instant.parse(isoTimestamp).let { Date.from(it) }
        sdf.format(date)
    } catch (_: Exception) { "" }
}

private fun formatFullDate(): String {
    val sdf = SimpleDateFormat("MMM dd, yyyy\nhh:mm a", Locale.getDefault())
    return sdf.format(Date())
}
