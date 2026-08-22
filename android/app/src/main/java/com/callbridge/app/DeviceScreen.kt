package com.callbridge.app

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.SimpleDateFormat
import java.util.*

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
    val androidGreen = Color(0xFF3DDC84)
    val transparent = Color(0xFFF3F4F6)

    // ── State ─────────────────────────────────────────────────────
    var deviceInfo by remember { mutableStateOf(DeviceInfo()) }
    var isLoading by remember { mutableStateOf(true) }

    // ── Load device data ──────────────────────────────────────────
    LaunchedEffect(Unit) {
        try {
            val prefs = context.getSharedPreferences("callbridge_prefs", Context.MODE_PRIVATE)
            val deviceDocId = prefs.getString("registered_device_id", null)

            // Always read local device info from Build constants
            val manufacturer = Build.MANUFACTURER.replaceFirstChar { it.uppercase() }
            val model = Build.MODEL
            val androidVer = Build.VERSION.RELEASE
            val codename = getAndroidCodename(Build.VERSION.SDK_INT)
            val ramGb = getDeviceRam(context)

            if (deviceDocId != null) {
                try {
                    val doc = AppwriteClient.databases.getDocument(
                        databaseId = BuildConfig.APPWRITE_DATABASE_ID,
                        collectionId = BuildConfig.APPWRITE_COLLECTION_DEVICES,
                        documentId = deviceDocId
                    )

                    android.util.Log.d("CallBridge", "Device doc: ${doc.data}")

                    val monitoringStatus = doc.data["monitoring_status"] as? Boolean ?: true
                    val lastSyncRaw = doc.data["last_sync"]?.toString() ?: ""
                    val localLastSync = prefs.getString("last_device_sync_time", "")
                    val registeredRaw = doc.data["device_registered_at"]?.toString() ?: ""

                    android.util.Log.d("CallBridge", "DeviceScreen: registeredRaw=$registeredRaw")

                    val storedDeviceName = doc.data["device_name"]?.toString()
                        ?: "$manufacturer $model"
                    val storedAndroid = doc.data["android_version"]?.toString() ?: androidVer
                    val storedAppVersion = doc.data["app_version"]?.toString()
                        ?: BuildConfig.VERSION_NAME

                    deviceInfo = DeviceInfo(
                        deviceName = storedDeviceName,
                        androidVersion = storedAndroid,
                        appVersion = storedAppVersion,
                        monitoringActive = monitoringStatus,
                        lastSync = formatTimestamp(lastSyncRaw),           // TimeUtils version
                        registeredAt = formatFullDate(registeredRaw),      // TimeUtils version — NOT formatFullDate2
                        manufacturer = manufacturer,
                        model = model,
                        ramGb = ramGb,
                        androidCodename = codename
                    )
                } catch (e: Exception) {
                    android.util.Log.e("CallBridge", "Device fetch error: ${e.message}")
                    // Fall back to local device info
                    deviceInfo = DeviceInfo(
                        deviceName = "$manufacturer $model",
                        androidVersion = androidVer,
                        appVersion = BuildConfig.VERSION_NAME,
                        monitoringActive = true,
                        lastSync = "Just now",
                        registeredAt = "—",
                        manufacturer = manufacturer,
                        model = model,
                        ramGb = ramGb,
                        androidCodename = codename
                    )
                }
            } else {
                // No Appwrite document yet — use local constants only
                deviceInfo = DeviceInfo(
                    deviceName = "$manufacturer $model",
                    androidVersion = androidVer,
                    appVersion = BuildConfig.VERSION_NAME,
                    monitoringActive = true,
                    lastSync = "Just now",
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

    // ── UI ────────────────────────────────────────────────────────
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
                text = "Device",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = nearBlack,
                modifier = Modifier.align(Alignment.Center)
            )
        }

        if (isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
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

                // ── Main Device Card ──────────────────────────────
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(
                            elevation = 6.dp,
                            shape = RoundedCornerShape(20.dp),
                            ambientColor = Color.Black.copy(alpha = 0.06f),
                            spotColor = Color.Black.copy(alpha = 0.04f)
                        )
                        .clip(RoundedCornerShape(20.dp))
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(
                                    white,
                                    Color(0xFFF8FAFF)
                                )
                            )
                        )
                        .padding(20.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Device icon badge
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(blueBg),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(
                                    id = R.drawable.maindevice
                                ),
                                contentDescription = null,
                                tint = primaryBlue,
                                modifier = Modifier.size(32.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(16.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            // Device name
                            Text(
                                text = deviceInfo.deviceName,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = nearBlack,
                                lineHeight = 26.sp
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            // Android version and RAM
                            Text(
                                text = "ANDROID ${deviceInfo.androidVersion} • ${deviceInfo.ramGb} RAM",
                                fontSize = 11.sp,
                                color = mutedText,
                                fontWeight = FontWeight.Medium,
                                letterSpacing = 0.5.sp
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            // Status pills row
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                // Monitoring status pill
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(20.dp))
                                        .background(greenBg)
                                        .border(
                                            1.dp,
                                            green.copy(alpha = 0.3f),
                                            RoundedCornerShape(20.dp)
                                        )
                                        .padding(horizontal = 10.dp, vertical = 5.dp)
                                ) {
                                    Text(
                                        text = if (deviceInfo.monitoringActive)
                                            "MONITORING ACTIVE"
                                        else
                                            "MONITORING PAUSED",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = green,
                                        letterSpacing = 0.5.sp
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            // Last synced pill
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(blueBg)
                                    .border(
                                        1.dp,
                                        primaryBlue.copy(alpha = 0.3f),
                                        RoundedCornerShape(20.dp)
                                    )
                                    .padding(horizontal = 10.dp, vertical = 5.dp)
                            ) {
                                Text(
                                    text = "LAST SYNCED ${deviceInfo.lastSync.uppercase()}",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = primaryBlue,
                                    letterSpacing = 0.5.sp
                                )
                            }
                        }

                        // Online green dot — top right
                        Box(
                            modifier = Modifier
                                .size(12.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF4CAF50))
                                .align(Alignment.Top)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(28.dp))

                // ── Device Details Section Header ─────────────────
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

                // ── Details Card ──────────────────────────────────
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(
                            elevation = 3.dp,
                            shape = RoundedCornerShape(18.dp),
                            ambientColor = Color.Black.copy(alpha = 0.05f)
                        )
                        .clip(RoundedCornerShape(18.dp))
                        .background(white)
                ) {
                    // Device Model
                    DeviceDetailRow(
                        iconRes = R.drawable.model,
                        iconBg = Color(0xFFF5F7FA),
                        iconTint = mutedText,
                        title = "Device Model",
                        value = deviceInfo.model,
                        nearBlack = nearBlack,
                        mutedText = mutedText,
                        cardBorder = cardBorder,
                        showDivider = true
                    )

                    // Android Version
                    DeviceDetailRow(
                        iconRes = R.drawable.greenandroid,
                        iconBg = Color(0xFFEDFDF1),
                        iconTint = androidGreen,
                        title = "Android Version",
                        value = "${deviceInfo.androidVersion} (${deviceInfo.androidCodename})",
                        nearBlack = nearBlack,
                        mutedText = mutedText,
                        cardBorder = cardBorder,
                        showDivider = true,
                        useAndroidIcon = true
                    )

                    // Manufacturer
                    DeviceDetailRow(
                        iconRes = R.drawable.manufacture,
                        iconBg = Color(0xFFF5F7FA),
                        iconTint = Color(0xFF4A5568),
                        title = "Manufacturer",
                        value = deviceInfo.manufacturer,
                        nearBlack = nearBlack,
                        mutedText = mutedText,
                        cardBorder = cardBorder,
                        showDivider = true
                    )

                    // App Version


                    // Registered Since
                    DeviceDetailRow(
                        iconRes = android.R.drawable.ic_menu_recent_history,
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

// ── Single device detail row ──────────────────────────────────────
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
    showDivider: Boolean,
    useAndroidIcon: Boolean = false
) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon badge
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
                Text(
                    text = title,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = nearBlack
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = value,
                    fontSize = 13.sp,
                    color = mutedText
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

// ── Helpers ───────────────────────────────────────────────────────
fun getDeviceRam(context: Context): String {
    return try {
        val activityManager =
            context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memInfo)
        val totalRamGb = memInfo.totalMem / (1024.0 * 1024.0 * 1024.0)
        val rounded = when {
            totalRamGb <= 2.5 -> "2GB"
            totalRamGb <= 3.5 -> "3GB"
            totalRamGb <= 4.5 -> "4GB"
            totalRamGb <= 6.5 -> "6GB"
            totalRamGb <= 8.5 -> "8GB"
            totalRamGb <= 10.5 -> "10GB"
            totalRamGb <= 12.5 -> "12GB"
            totalRamGb <= 16.5 -> "16GB"
            else -> "${totalRamGb.toInt()}GB"
        }
        rounded
    } catch (e: Exception) {
        "—"
    }
}

fun getAndroidCodename(sdkInt: Int): String {
    return when (sdkInt) {
        26, 27 -> "Oreo"
        28 -> "Pie"
        29 -> "Android 10"
        30 -> "Android 11"
        31, 32 -> "Snow Cone"
        33 -> "Tiramisu"
        34 -> "Upside Down Cake"
        35 -> "Vanilla Ice Cream"
        36 -> "Baklava"
        else -> "Android $sdkInt"
    }
}



