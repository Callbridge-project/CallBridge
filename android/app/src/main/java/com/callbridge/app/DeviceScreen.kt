package com.callbridge.app

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import androidx.compose.animation.core.LinearOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class DeviceInfo(
    val deviceName: String = "",
    val androidVersion: String = "",
    val appVersion: String = "",
    val monitoringActive: Boolean = true,
    val lastSync: String = "",
    val registeredAt: String = "",
    val manufacturer: String = "",
    val model: String = "",
    val ramGb: String = "",
    val androidCodename: String = ""
)


@Composable
fun DeviceScreen() {

    val context = LocalContext.current

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
    val androidGreen = Color(0xFF3DDC84)

    var deviceInfo by remember { mutableStateOf(DeviceInfo()) }
    var isLoading by remember { mutableStateOf(true) }

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

    LaunchedEffect(Unit) {
        try {
            val manufacturer = Build.MANUFACTURER.trim().replaceFirstChar { it.uppercase() }
            val model = Build.MODEL.trim()
            val deviceNameLocal = if (model.lowercase()
                    .startsWith(manufacturer.lowercase())) model
            else "$manufacturer $model"

            val androidVer = Build.VERSION.RELEASE
            val codename = getAndroidCodename(Build.VERSION.SDK_INT)
            val ramGb = getDeviceRam(context)

            val prefs = context.getSharedPreferences("callbridge_prefs", Context.MODE_PRIVATE)
            val deviceDocId = prefs.getString("registered_device_id", null)

            android.util.Log.d("CallBridge", "DeviceScreen: deviceDocId='$deviceDocId'")

            if (deviceDocId != null && deviceDocId.isNotEmpty()) {
                try {
                    val doc = AppwriteClient.databases.getDocument(
                        databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                        collectionId = BuildConfig.APPWRITE_COLLECTION_DEVICES,
                        documentId = deviceDocId
                    )

                    // Log every field so we can see what Appwrite returns
                    android.util.Log.d("CallBridge", "DeviceScreen doc.data = ${doc.data}")

                    val rawLastSync = extractDateString(doc.data["last_sync"])
                    val rawRegisteredAt = extractDateString(doc.data["device_registered_at"])

                    android.util.Log.d("CallBridge", "rawLastSync = '$rawLastSync'")
                    android.util.Log.d("CallBridge", "rawRegisteredAt = '$rawRegisteredAt'")

                    val formattedSync = formatTimestamp(rawLastSync)
                    val formattedRegistered = formatFullDate(rawRegisteredAt)

                    android.util.Log.d("CallBridge", "formattedSync = '$formattedSync'")
                    android.util.Log.d("CallBridge", "formattedRegistered = '$formattedRegistered'")

                    val storedDeviceName = extractDateString(doc.data["device_name"])
                        .ifEmpty { deviceNameLocal }
                    val storedAndroid = extractDateString(doc.data["android_version"])
                        .ifEmpty { androidVer }
                    val storedApp = extractDateString(doc.data["app_version"])
                        .ifEmpty { BuildConfig.VERSION_NAME }
                    val monitoringStatus = doc.data["monitoring_status"] as? Boolean ?: true

                    deviceInfo = DeviceInfo(
                        deviceName = storedDeviceName,
                        androidVersion = storedAndroid,
                        appVersion = storedApp,
                        monitoringActive = monitoringStatus,
                        lastSync = formattedSync,
                        registeredAt = formattedRegistered,
                        manufacturer = manufacturer,
                        model = model,
                        ramGb = ramGb,
                        androidCodename = codename
                    )

                } catch (e: Exception) {
                    android.util.Log.e("CallBridge", "DeviceScreen fetch error: ${e.message}")
                    deviceInfo = DeviceInfo(
                        deviceName = deviceNameLocal,
                        androidVersion = androidVer,
                        appVersion = BuildConfig.VERSION_NAME,
                        monitoringActive = true,
                        lastSync = "—",
                        registeredAt = "—",
                        manufacturer = manufacturer,
                        model = model,
                        ramGb = ramGb,
                        androidCodename = codename
                    )
                }
            } else {
                android.util.Log.w("CallBridge", "DeviceScreen: no deviceDocId in prefs")
                deviceInfo = DeviceInfo(
                    deviceName = deviceNameLocal,
                    androidVersion = androidVer,
                    appVersion = BuildConfig.VERSION_NAME,
                    monitoringActive = true,
                    lastSync = "—",
                    registeredAt = "—",
                    manufacturer = manufacturer,
                    model = model,
                    ramGb = ramGb,
                    androidCodename = codename
                )
            }
        } catch (e: Exception) {
            android.util.Log.e("CallBridge", "DeviceScreen error: ${e.message}")
        } finally {
            isLoading = false
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF2F4F7))
    ) {
        // Top bar
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFF2F4F7))
                .padding(top = 16.dp, bottom = 12.dp, start = 16.dp, end = 16.dp)
        ) {

            Text(
                text = "Device",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = nearBlack,
                modifier = Modifier.align(Alignment.Center)
            )
        }

        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = primaryBlue, strokeWidth = 2.dp)
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp)
            ) {
                Spacer(modifier = Modifier.height(8.dp))

                // Main device card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(6.dp, RoundedCornerShape(20.dp),
                            ambientColor = Color.Black.copy(0.06f))
                        .clip(RoundedCornerShape(20.dp))
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(Color.White, Color(0xFFF8FAFF))
                            )
                        )
                        .padding(20.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(blueBg),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(
                                    id = R.drawable.settdevice
                                ),
                                contentDescription = null,
                                tint = primaryBlue,
                                modifier = Modifier.size(32.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(16.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = deviceInfo.deviceName.ifEmpty { "Unknown Device" },
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = nearBlack,
                                lineHeight = 26.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "ANDROID ${deviceInfo.androidVersion} • ${deviceInfo.ramGb} RAM",
                                fontSize = 11.sp,
                                color = mutedText,
                                fontWeight = FontWeight.Medium,
                                letterSpacing = 0.5.sp
                            )
                            Spacer(modifier = Modifier.height(10.dp))

                            // Monitoring pill
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(greenBg)
                                    .border(1.dp, green.copy(0.3f), RoundedCornerShape(20.dp))
                                    .padding(horizontal = 10.dp, vertical = 5.dp)
                            ) {
                                Text(
                                    text = if (deviceInfo.monitoringActive)
                                        "MONITORING ACTIVE" else "MONITORING PAUSED",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = green,
                                    letterSpacing = 0.5.sp
                                )
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            // Last sync pill
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(blueBg)
                                    .border(1.dp, primaryBlue.copy(0.3f), RoundedCornerShape(20.dp))
                                    .padding(horizontal = 10.dp, vertical = 5.dp)
                            ) {
                                Text(
                                    text = if (deviceInfo.lastSync == "—" || deviceInfo.lastSync.isEmpty())
                                        "NOT YET SYNCED"
                                    else
                                        "LAST SYNCED ${deviceInfo.lastSync.uppercase()}",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = primaryBlue,
                                    letterSpacing = 0.5.sp
                                )
                            }
                        }

                        // Online dot
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .align(Alignment.Top)
                                .graphicsLayer {
                                    scaleX = dotScale
                                    scaleY = dotScale
                                    alpha = dotAlpha
                                }
                                .clip(CircleShape)
                                .background(Color(0xFF4CAF50))
                        )
                    }
                }

                Spacer(modifier = Modifier.height(28.dp))

                // Section header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "DEVICE DETAILS",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = nearBlack,
                        letterSpacing = 1.sp
                    )
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(primaryBlue)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Details card
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(3.dp, RoundedCornerShape(18.dp),
                            ambientColor = Color.Black.copy(0.05f))
                        .clip(RoundedCornerShape(18.dp))
                        .background(Color.White)
                ) {
                    DeviceDetailRow(
                        iconRes = R.drawable.model,
                        iconBg = Color(0xFFF5F7FA),
                        iconTint = mutedText,
                        title = "Device Model",
                        value = deviceInfo.model.ifEmpty { "—" },
                        nearBlack = nearBlack,
                        mutedText = mutedText,
                        cardBorder = cardBorder,
                        showDivider = true
                    )
                    DeviceDetailRow(
                        iconRes = R.drawable.apkversion,
                        iconBg = Color(0xFFE8F5E9),
                        iconTint = androidGreen,
                        title = "Android Version",
                        value = "${deviceInfo.androidVersion} (${deviceInfo.androidCodename})",
                        nearBlack = nearBlack,
                        mutedText = mutedText,
                        cardBorder = cardBorder,
                        showDivider = true
                    )
                    DeviceDetailRow(
                        iconRes = R.drawable.manufacture,
                        iconBg = Color(0xFFF5F7FA),
                        iconTint = Color(0xFF4A5568),
                        title = "Manufacturer",
                        value = deviceInfo.manufacturer.ifEmpty { "—" },
                        nearBlack = nearBlack,
                        mutedText = mutedText,
                        cardBorder = cardBorder,
                        showDivider = true
                    )
                    DeviceDetailRow(
                        iconRes = R.drawable.registered,
                        iconBg = Color(0xFFF5F7FA),
                        iconTint = mutedText,
                        title = "Registered Since",
                        value = deviceInfo.registeredAt.ifEmpty { "—" },
                        nearBlack = nearBlack,
                        mutedText = mutedText,
                        cardBorder = cardBorder,
                        showDivider = false
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
fun DeviceDetailRow(
    iconRes: Int,
    iconBg: Color,
    iconTint: Color,
    title: String,
    value: String,
    nearBlack: Color,
    mutedText: Color,
    cardBorder: Color,
    showDivider: Boolean
) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
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
                Text(text = title, fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold, color = nearBlack)
                Spacer(modifier = Modifier.height(2.dp))
                Text(text = value, fontSize = 13.sp, color = mutedText)
            }
        }
        if (showDivider) {
            HorizontalDivider(
                color = cardBorder, thickness = 1.dp,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }
    }
}

fun getDeviceRam(context: Context): String {
    return try {
        val am = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val mem = ActivityManager.MemoryInfo()
        am.getMemoryInfo(mem)
        val gb = mem.totalMem / (1024.0 * 1024.0 * 1024.0)
        when {
            gb <= 2.5 -> "2GB"; gb <= 3.5 -> "3GB"; gb <= 4.5 -> "4GB"
            gb <= 6.5 -> "6GB"; gb <= 8.5 -> "8GB"; gb <= 10.5 -> "10GB"
            gb <= 12.5 -> "12GB"; gb <= 16.5 -> "16GB"
            else -> "${gb.toInt()}GB"
        }
    } catch (e: Exception) { "—" }
}

fun getAndroidCodename(sdk: Int): String {
    return when (sdk) {
        26, 27 -> "Oreo"; 28 -> "Pie"; 29 -> "Android 10"
        30 -> "Android 11"; 31, 32 -> "Snow Cone"; 33 -> "Tiramisu"
        34 -> "Upside Down Cake"; 35 -> "Vanilla Ice Cream"; 36 -> "Baklava"
        else -> "Android $sdk"
    }
}