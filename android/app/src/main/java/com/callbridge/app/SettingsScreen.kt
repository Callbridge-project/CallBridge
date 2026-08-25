package com.callbridge.app

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

// FAQ data
data class FaqItem(val question: String, val answer: String)

val faqItems = listOf(
    FaqItem(
        question = "Is my phone data safe with CallBridge?",
        answer = "Yes. CallBridge only reads telephony metadata — numbers, times, and contact names. No audio, no location, and no passwords are ever accessed or stored. All data is encrypted in transit."
    ),
    FaqItem(
        question = "Can I monitor the web dashboard from multiple devices?",
        answer = "Yes. Your CallBridge web dashboard is accessible from any browser. The Android app is the monitoring agent — the web is where you view your data."
    ),
    FaqItem(
        question = "What happens if my phone loses internet?",
        answer = "The app queues all detected events locally and syncs them automatically the moment your connection is restored. No logs are ever lost."
    ),
    FaqItem(
        question = "Does CallBridge work on iOS?",
        answer = "Not currently. CallBridge is Android-only due to the system-level permissions required for telephony monitoring. iOS does not expose those APIs to third-party apps."
    ),
    FaqItem(
        question = "Will CallBridge drain my battery?",
        answer = "The app runs a lightweight foreground service. Battery impact is minimal. We recommend exempting CallBridge from battery optimization in your device settings for uninterrupted monitoring."
    ),
    FaqItem(
        question = "How do I update my profile or password?",
        answer = "Profile and password updates are managed on the web dashboard under Settings. The Android app is kept lightweight intentionally — account management lives on the web."
    )
)

@Composable
fun SettingsScreen(onLogout: () -> Unit) {

    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // ── Colors ────────────────────────────────────────────────────
    val primaryBlue = Color(0xFF4A90D9)
    val deepBlue = Color(0xFF1A3A6B)
    val nearBlack = Color(0xFF0A0A1A)
    val mutedText = Color(0xFF6B7A99)
    val cardBorder = Color(0xFFE0E7F0)
    val screenBg = Color(0xFFF2F4F7)
    val white = Color.White
    val green = Color(0xFF2E7D32)
    val greenBg = Color(0xFFE8F5E9)
    val blueBg = Color(0xFFEEF4FF)
    val red = Color(0xFFE53935)
    val redBg = Color(0xFFFFEBEE)

    // ── State ─────────────────────────────────────────────────────
    var userName by remember { mutableStateOf("") }
    var userEmail by remember { mutableStateOf("") }
    var userInitials by remember { mutableStateOf("") }
    var deviceName by remember { mutableStateOf("") }
    var androidVersion by remember { mutableStateOf("") }
    var lastSync by remember { mutableStateOf("") }
    var notificationsEnabled by remember { mutableStateOf(true) }
    var showLogoutDialog by remember { mutableStateOf(false) }
    var isLoggingOut by remember { mutableStateOf(false) }
    var expandedFaqIndex by remember { mutableStateOf(-1) }
    var faqExpanded by remember { mutableStateOf(false) }

    // ── Load user and device data ─────────────────────────────────
    LaunchedEffect(Unit) {
        try {
            val userResult = AuthService.getCurrentUser()
            if (userResult.isSuccess) {
                val user = userResult.getOrNull()
                val name = user?.name ?: "User"
                val email = user?.email ?: ""
                userName = name
                userEmail = email
                userInitials = name.split(" ")
                    .take(2)
                    .joinToString("") { it.firstOrNull()?.uppercase() ?: "" }
            }

            val prefs = context.getSharedPreferences("callbridge_prefs", Context.MODE_PRIVATE)
            val deviceDocId = prefs.getString("registered_device_id", null)

            if (deviceDocId != null) {
                try {
                    val doc = AppwriteClient.databases.getDocument(
                        databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                        collectionId = BuildConfig.APPWRITE_COLLECTION_DEVICES,
                        documentId = deviceDocId
                    )
                    deviceName = doc.data["device_name"]?.toString()
                        ?: "${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL}"
                    androidVersion = "Android ${doc.data["android_version"]?.toString()
                        ?: android.os.Build.VERSION.RELEASE}"
                    // AFTER
                    val rawLastSync = extractDateString(doc.data["last_sync"])
                    android.util.Log.d("CallBridge", "Settings extracted last_sync: '$rawLastSync'")
                    lastSync = formatTimestamp(rawLastSync)

                } catch (e: Exception) {
                    deviceName = "${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL}"
                    androidVersion = "Android ${android.os.Build.VERSION.RELEASE}"
                    lastSync = "—"
                }
            }

            // Read saved notifications preference
            notificationsEnabled = prefs.getBoolean("notifications_enabled", true)

        } catch (e: Exception) {
            android.util.Log.e("CallBridge", "SettingsScreen load error: ${e.message}")
        }
    }

    // ── Logout confirmation dialog ─────────────────────────────────
    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            containerColor = white,
            shape = RoundedCornerShape(20.dp),
            title = {
                Text(
                    text = "Sign Out",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = nearBlack
                )
            },
            text = {
                Text(
                    text = "Are you sure you want to sign out? Monitoring will stop on this device until you log back in.",
                    fontSize = 14.sp,
                    color = mutedText,
                    lineHeight = 21.sp
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showLogoutDialog = false
                        isLoggingOut = true
                        scope.launch {
                            try {
                                // Stop the monitoring service
                                val serviceIntent = Intent(
                                    context, CallBridgeMonitoringService::class.java
                                )
                                context.stopService(serviceIntent)

                                // Update device monitoring status in Appwrite
                                val prefs = context.getSharedPreferences(
                                    "callbridge_prefs", Context.MODE_PRIVATE
                                )
                                val deviceDocId = prefs.getString("registered_device_id", null)
                                if (deviceDocId != null) {
                                    try {
                                        AppwriteClient.databases.updateDocument(
                                            databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                                            collectionId = BuildConfig.APPWRITE_COLLECTION_DEVICES,
                                            documentId = deviceDocId,
                                            data = mapOf("monitoring_status" to false)
                                        )
                                    } catch (e: Exception) {
                                        android.util.Log.e(
                                            "CallBridge", "Device update on logout: ${e.message}"
                                        )
                                    }
                                }

                                // Clear stored credentials
                                prefs.edit()
                                    .remove("current_user_id")
                                    .remove("registered_device_id")
                                    .apply()

                                // Sign out of Appwrite
                                AuthService.logout()

                            } catch (e: Exception) {
                                android.util.Log.e("CallBridge", "Logout error: ${e.message}")
                            } finally {
                                isLoggingOut = false
                                onLogout()
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = red),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    if (isLoggingOut) {
                        CircularProgressIndicator(
                            color = white,
                            modifier = Modifier.size(16.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text("Sign Out", color = white, fontWeight = FontWeight.SemiBold)
                    }
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showLogoutDialog = false },
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Cancel", color = mutedText)
                }
            }
        )
    }

    // ── Main UI ───────────────────────────────────────────────────
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(screenBg)
    ) {

        // ── Top App Bar ───────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(screenBg)
                .padding(top = 16.dp, bottom = 12.dp, start = 16.dp, end = 16.dp)
        ) {


            Text(
                text = "Settings",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = nearBlack,
                modifier = Modifier.align(Alignment.Center)
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp)
        ) {

            Spacer(modifier = Modifier.height(4.dp))

            // ── Profile Card ──────────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(3.dp, RoundedCornerShape(18.dp), ambientColor = Color.Black.copy(0.05f))
                    .clip(RoundedCornerShape(18.dp))
                    .background(white)
                    .padding(16.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // Avatar circle with initials
                    Box(
                        modifier = Modifier
                            .size(52.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF4A90D9).copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = userInitials.ifEmpty { "U" },
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = deepBlue
                        )
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = userName.ifEmpty { "Loading..." },
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = nearBlack
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = userEmail.ifEmpty { "" },
                            fontSize = 13.sp,
                            color = mutedText
                        )
                        Spacer(modifier = Modifier.height(6.dp))

                        // Monitoring Active pill
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                painter = painterResource(
                                    id = R.drawable.settgaurd
                                ),
                                contentDescription = null,
                                tint = green,
                                modifier = Modifier.size(13.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Monitoring Active",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = green
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── ACCOUNT & MONITORING Section ──────────────────────
            Text(
                text = "ACCOUNT & MONITORING",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = mutedText,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(bottom = 10.dp)
            )

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(
                        3.dp, RoundedCornerShape(18.dp),
                        ambientColor = Color.Black.copy(0.05f)
                    )
                    .clip(RoundedCornerShape(18.dp))
                    .background(white)
            ) {
                // Profile Details — opens web settings
                SettingsRow(
                    iconRes = R.drawable.profile,
                    iconBg = blueBg,
                    iconTint = primaryBlue,
                    title = "Profile Details",
                    subtitle = "Update personal details on web app",
                    showChevron = true,
                    cardBorder = cardBorder,
                    nearBlack = nearBlack,
                    mutedText = mutedText,
                    showDivider = true,
                    onClick = {
                        val intent = Intent(
                            Intent.ACTION_VIEW,
                            Uri.parse("https://your-callbridge-web-url.vercel.app/settings")
                        )
                        context.startActivity(intent)
                    }
                )

                // Device Information
                SettingsRow(
                    iconRes = R.drawable.device,
                    iconBg = blueBg,
                    iconTint = primaryBlue,
                    title = "Device Information",
                    subtitle = if (deviceName.isNotEmpty() && androidVersion.isNotEmpty())
                        "$deviceName • $androidVersion"
                    else
                        "${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL} • Android ${android.os.Build.VERSION.RELEASE}",
                    showChevron = false,
                    cardBorder = cardBorder,
                    nearBlack = nearBlack,
                    mutedText = mutedText,
                    showDivider = true
                )

                // Monitoring Status
                SettingsRow(
                    iconRes = R.drawable.monitoring,
                    iconBg = blueBg,
                    iconTint = primaryBlue,
                    title = "Monitoring Status",
                    subtitle = "Monitoring enabled and synchronized",
                    showChevron = false,
                    cardBorder = cardBorder,
                    nearBlack = nearBlack,
                    mutedText = mutedText,
                    showDivider = true
                )

                // Notifications — with active toggle
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(blueBg),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(
                                id = R.drawable.notification
                            ),
                            contentDescription = null,
                            tint = primaryBlue,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Notifications",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = nearBlack
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Manage monitoring alerts",
                            fontSize = 13.sp,
                            color = mutedText
                        )
                    }

                    // Active notification toggle
                    Switch(
                        checked = notificationsEnabled,
                        onCheckedChange = { enabled ->
                            notificationsEnabled = enabled

                            // Persist preference
                            val prefs = context.getSharedPreferences(
                                "callbridge_prefs", Context.MODE_PRIVATE
                            )
                            prefs.edit()
                                .putBoolean("notifications_enabled", enabled)
                                .apply()

                            // Enable or disable the notification channel
                            val notificationManager = context.getSystemService(
                                Context.NOTIFICATION_SERVICE
                            ) as NotificationManager

                            if (enabled) {
                                // Re-enable — importance back to LOW (silent persistent)
                                val channel = android.app.NotificationChannel(
                                    NotificationHelper.CHANNEL_ID,
                                    "CallBridge Monitoring",
                                    NotificationManager.IMPORTANCE_LOW
                                ).apply {
                                    description = "Shows while CallBridge is monitoring"
                                    setShowBadge(false)
                                }
                                notificationManager.createNotificationChannel(channel)
                            } else {
                                // Disable — block the channel
                                val channel = notificationManager.getNotificationChannel(
                                    NotificationHelper.CHANNEL_ID
                                )
                                channel?.let {
                                    val updatedChannel = android.app.NotificationChannel(
                                        NotificationHelper.CHANNEL_ID,
                                        "CallBridge Monitoring",
                                        NotificationManager.IMPORTANCE_NONE
                                    )
                                    notificationManager.createNotificationChannel(updatedChannel)
                                }
                            }
                        },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = white,
                            checkedTrackColor = nearBlack,
                            uncheckedThumbColor = white,
                            uncheckedTrackColor = Color(0xFFD0D9E8)
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── SYSTEM & SUPPORT Section ──────────────────────────
            Text(
                text = "SYSTEM & SUPPORT",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = mutedText,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(bottom = 10.dp)
            )

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(
                        3.dp, RoundedCornerShape(18.dp),
                        ambientColor = Color.Black.copy(0.05f)
                    )
                    .clip(RoundedCornerShape(18.dp))
                    .background(white)
            ) {
                // Synchronization Status
                SettingsRow(
                    iconRes = R.drawable.syncing,
                    iconBg = blueBg,
                    iconTint = primaryBlue,
                    title = "Synchronization Status",
                    subtitle = if (lastSync.isNotEmpty()) "Last synced $lastSync"
                    else "Last synced —",
                    showChevron = false,
                    cardBorder = cardBorder,
                    nearBlack = nearBlack,
                    mutedText = mutedText,
                    showDivider = true
                )

                // Connection Status
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(blueBg),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(
                                id = R.drawable.connect
                            ),
                            contentDescription = null,
                            tint = primaryBlue,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Connection Status",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = nearBlack
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Row {
                            Text(
                                text = "Connected securely",
                                fontSize = 13.sp,
                                color = primaryBlue,
                                fontWeight = FontWeight.Medium
                            )
                            Text(
                                text = " to dashboard",
                                fontSize = 13.sp,
                                color = mutedText
                            )
                        }
                    }
                }

                HorizontalDivider(
                    color = cardBorder,
                    thickness = 1.dp,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )

                // Help / FAQ — expandable
                Column {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { faqExpanded = !faqExpanded }
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(blueBg),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(
                                    id = R.drawable.help
                                ),
                                contentDescription = null,
                                tint = primaryBlue,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Help / FAQ",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = nearBlack
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Support and setup guidance",
                                fontSize = 13.sp,
                                color = mutedText
                            )
                        }
                        Icon(
                            painter = painterResource(
                                id = if (faqExpanded)
                                    R.drawable.uparrow
                                else
                                    R.drawable.downarrow
                            ),
                            contentDescription = null,
                            tint = mutedText,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    // Expanded FAQ list
                    AnimatedVisibility(
                        visible = faqExpanded,
                        enter = expandVertically(animationSpec = tween(250)) +
                                fadeIn(animationSpec = tween(250)),
                        exit = shrinkVertically(animationSpec = tween(200)) +
                                fadeOut(animationSpec = tween(200))
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFFF8FAFF))
                                .padding(horizontal = 16.dp, vertical = 8.dp)
                        ) {
                            faqItems.forEachIndexed { index, faq ->
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(white)
                                        .border(1.dp, cardBorder, RoundedCornerShape(12.dp))
                                        .clickable {
                                            expandedFaqIndex =
                                                if (expandedFaqIndex == index) -1 else index
                                        }
                                        .padding(14.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = faq.question,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = nearBlack,
                                            modifier = Modifier.weight(1f),
                                            lineHeight = 18.sp
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Icon(
                                            painter = painterResource(
                                                id = if (expandedFaqIndex == index)
                                                    R.drawable.uparrow
                                                else
                                                    R.drawable.downarrow
                                            ),
                                            contentDescription = null,
                                            tint = mutedText,
                                            modifier = Modifier.size(14.dp)
                                        )
                                    }

                                    AnimatedVisibility(
                                        visible = expandedFaqIndex == index,
                                        enter = expandVertically(tween(200)) + fadeIn(tween(200)),
                                        exit = shrinkVertically(tween(150)) + fadeOut(tween(150))
                                    ) {
                                        Column {
                                            Spacer(modifier = Modifier.height(8.dp))
                                            HorizontalDivider(color = cardBorder, thickness = 1.dp)
                                            Spacer(modifier = Modifier.height(8.dp))
                                            Text(
                                                text = faq.answer,
                                                fontSize = 13.sp,
                                                color = mutedText,
                                                lineHeight = 20.sp
                                            )
                                        }
                                    }
                                }

                                if (index < faqItems.size - 1) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            // Contact Us link at bottom of FAQ
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(blueBg)
                                    .border(1.dp, primaryBlue.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                                    .clickable {
                                        val intent = Intent(
                                            Intent.ACTION_VIEW,
                                            Uri.parse("https://your-callbridge-web-url.vercel.app/contact")
                                        )
                                        context.startActivity(intent)
                                    }
                                    .padding(14.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                                ) {
                                    Icon(
                                        painter = painterResource(
                                            id = R.drawable.email
                                        ),
                                        contentDescription = null,
                                        tint = primaryBlue,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Still need help? Contact Us →",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = primaryBlue
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))
                        }
                    }
                }

                HorizontalDivider(
                    color = cardBorder,
                    thickness = 1.dp,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )

                // Application Version
                SettingsRow(
                    iconRes = R.drawable.apkversion,
                    iconBg = blueBg,
                    iconTint = primaryBlue,
                    title = "Application Version",
                    subtitle = "Version ${BuildConfig.VERSION_NAME}",
                    showChevron = false,
                    cardBorder = cardBorder,
                    nearBlack = nearBlack,
                    mutedText = mutedText,
                    showDivider = false
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // ── Logout Card ───────────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(
                        3.dp, RoundedCornerShape(18.dp),
                        ambientColor = Color.Black.copy(0.05f)
                    )
                    .clip(RoundedCornerShape(18.dp))
                    .background(white)
                    .border(1.dp, Color(0xFFFFCDD2), RoundedCornerShape(18.dp))
                    .clickable { showLogoutDialog = true }
                    .padding(horizontal = 16.dp, vertical = 16.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(redBg),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(
                                id = R.drawable.logout
                            ),
                            contentDescription = null,
                            tint = red,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Text(
                            text = "Logout",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = red
                        )
                        Text(
                            text = "Sign out from your account",
                            fontSize = 13.sp,
                            color = mutedText
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

// ── Reusable settings row ─────────────────────────────────────────
@Composable
fun SettingsRow(
    iconRes: Int,
    iconBg: Color,
    iconTint: Color,
    title: String,
    subtitle: String,
    showChevron: Boolean,
    cardBorder: Color,
    nearBlack: Color,
    mutedText: Color,
    showDivider: Boolean,
    onClick: (() -> Unit)? = null
) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(iconBg),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = iconRes),
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = nearBlack
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = subtitle,
                    fontSize = 13.sp,
                    color = mutedText,
                    lineHeight = 18.sp
                )
            }

            if (showChevron) {
                Icon(
                    painter = painterResource(
                        id = R.drawable.rightarrow
                    ),
                    contentDescription = null,
                    tint = mutedText,
                    modifier = Modifier.size(16.dp)
                )
            }
        }

        if (showDivider) {
            HorizontalDivider(
                color = cardBorder,
                thickness = 1.dp,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }
    }
}