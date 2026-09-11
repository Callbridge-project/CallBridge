package com.callbridge.app.ui.screens

import android.Manifest
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.callbridge.app.R

@Composable
fun PermissionsScreen(
    onPermissionsHandled: (notificationsGranted: Boolean, contactsGranted: Boolean) -> Unit,
    onTermsClick: () -> Unit
) {

    val context = LocalContext.current

    var notificationsChecked by remember { mutableStateOf(false) }
    var contactsChecked by remember { mutableStateOf(false) }

    // ── Colours — edit these one place to change everywhere ───────
    val primaryBlue = Color(0xFF4A90D9)
    val deepBlue = Color(0xFF1A3A6B)
    val nearBlack = Color(0xFF0A0A1A)
    val mutedText = Color(0xFF6B7A99)
    val cardBorder = Color(0xFFBBD7FA)
    val cardBackground = Color(0xFFF1F6FE)
    val cardBg = Color(0xFFEFF6FF)
    val badgeBg = Color(0xFFEEF4FF)
    val badgeIcon = Color(0xFF1A3A6B)

    // Permission launchers
    val corePermissionsLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { }

    val notificationLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted -> notificationsChecked = granted }

    val contactsLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted -> contactsChecked = granted }

    // ── Full screen gradient — white at top fading to light blue ──
    // ── Screen Background Gradient ──────────────────────────────────────
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(
                        Color(0xFFEEF5FF), // Subtle blue top-left tint
                        Color(0xFFFFFFFF)  // Fades to pure white
                    ),
                    start = Offset(0f, 0f),
                    end = Offset(0f, 1000f)
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
                .padding(top = 48.dp, bottom = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {

            // ── Logo ──────────────────────────────────────────────
            // Soft glow circle behind the logo
            Box(
                modifier = Modifier
                    .size(90.dp)
                    .clip(CircleShape)
                    .background(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                Color(0xFF4A90D9).copy(alpha = 0.18f),
                                Color(0xFF4A90D9).copy(alpha = 0.04f)
                            )
                        )
                    ),
                contentAlignment = Alignment.Center
            ) {
                // Your custom logo — replace R.drawable.logo with your file name
                // For crisp rendering use a vector drawable (.xml) not a bitmap (.png)
                // If using PNG make sure it is at least 256x256px
                Image(
                    painter = painterResource(id = R.drawable.permissionslogo),
                    contentDescription = "CallBridge Logo",
                    modifier = Modifier.size(90.dp),
                    contentScale = ContentScale.Fit
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── Heading ───────────────────────────────────────────
            Text(
                text = "Enable Permissions",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = nearBlack,
                textAlign = TextAlign.Center,
                letterSpacing = (-0.3).sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Allow access to improve call monitoring,\nnotifications, and overall app experience.",
                fontSize = 14.sp,
                color = mutedText,
                textAlign = TextAlign.Center,
                lineHeight = 18.sp
            )

            Spacer(modifier = Modifier.height(32.dp))

            // ── Required Permissions ──────────────────────────────
            SectionLabel(text = "Required Permissions", color = nearBlack)

            Spacer(modifier = Modifier.height(12.dp))

            // Edit title, description, and iconRes freely here
            RequiredPermissionCard(
                iconRes = R.drawable.sim,   // your drawable name
                title = "Phone State Access",
                description = "Allows the app to detect call activity and monitor device telephony state",
                badgeBg = badgeBg,
                badgeIcon = badgeIcon,
                cardBorder = cardBorder,
                cardBackground = cardBackground,
                nearBlack = nearBlack,
                mutedText = mutedText,
                iconSize = 18.dp,
                // adjust icon size here
            )

            Spacer(modifier = Modifier.height(10.dp))

            RequiredPermissionCard(
                iconRes = R.drawable.callpermissions,
                title = "Call Access",
                description = "Manage and monitor incoming calls for synchronization",
                badgeBg = badgeBg,
                badgeIcon = badgeIcon,
                cardBorder = cardBorder,
                cardBackground = cardBackground,
                nearBlack = nearBlack,
                mutedText = mutedText,
                iconSize = 18.dp
            )

            Spacer(modifier = Modifier.height(10.dp))

            RequiredPermissionCard(
                iconRes = R.drawable.sms,
                title = "SMS Access & Synchronization",
                description = "Backup and sync your messages across devices",
                badgeBg = badgeBg,
                badgeIcon = badgeIcon,
                cardBorder = cardBorder,
                cardBackground = cardBackground,
                nearBlack = nearBlack,
                mutedText = mutedText,
                iconSize = 18.dp,
            )

            Spacer(modifier = Modifier.height(28.dp))

            // ── Your Preferences ──────────────────────────────────
            SectionLabel(text = "Your Preferences", color = nearBlack)

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "You can change these anytime in Settings.",
                fontSize = 12.sp,
                color = mutedText,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(12.dp))

            PreferencePermissionCard(
                iconRes = R.drawable.notifications,
                title = "Receive Notifications",
                description = "Send important call and message notifications",
                checked = notificationsChecked,
                onCheckedChange = { checked ->
                    if (checked) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            notificationLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                        } else {
                            notificationsChecked = true
                        }
                    } else {
                        notificationsChecked = false
                    }
                },
                badgeBg = badgeBg,
                badgeIcon = badgeIcon,
                cardBorder = cardBorder,
                nearBlack = nearBlack,
                mutedText = mutedText,
                primaryBlue = primaryBlue,
                iconSize = 18.dp
            )

            Spacer(modifier = Modifier.height(10.dp))

            PreferencePermissionCard(
                iconRes = R.drawable.contactaccess,
                title = "Contacts Access",
                description = "Displays saved contact names with synced phone activity for easy identification",
                checked = contactsChecked,
                onCheckedChange = { checked ->
                    if (checked) {
                        contactsLauncher.launch(Manifest.permission.READ_CONTACTS)
                    } else {
                        contactsChecked = false
                    }
                },
                badgeBg = badgeBg,
                badgeIcon = badgeIcon,
                cardBorder = cardBorder,
                nearBlack = nearBlack,
                mutedText = mutedText,
                primaryBlue = primaryBlue,
                iconSize = 18.dp
            )

            Spacer(modifier = Modifier.height(24.dp))

            // ── Battery Note ──────────────────────────────────────
            Text(
                text = "NB: Android kills background services, turn off battery optimization.",
                fontSize = 12.sp,
                color = primaryBlue,
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable {
                        val intent = Intent(
                            Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
                        ).apply {
                            data = Uri.parse("package:${context.packageName}")
                        }
                        context.startActivity(intent)
                    }
            )

            Spacer(modifier = Modifier.height(10.dp))

            // ── Terms Row ─────────────────────────────────────────
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("By continuing you agree to our ", fontSize = 12.sp, color = mutedText)
                Text(
                    text = "Terms",
                    fontSize = 12.sp,
                    color = primaryBlue,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.clickable { onTermsClick() }
                )
                Text(" & ", fontSize = 12.sp, color = mutedText)
                Text(
                    text = "Privacy Policy",
                    fontSize = 12.sp,
                    color = primaryBlue,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.clickable { onTermsClick() }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── Continue Button ───────────────────────────────────
            Button(
                onClick = {
                    val corePermissions = mutableListOf(
                        Manifest.permission.READ_PHONE_STATE,
                        Manifest.permission.READ_CALL_LOG,
                        Manifest.permission.RECEIVE_SMS,
                        Manifest.permission.READ_SMS
                    )
                    corePermissionsLauncher.launch(corePermissions.toTypedArray())

                    val prefs = context.getSharedPreferences(
                        "callbridge_prefs", Context.MODE_PRIVATE
                    )
                    prefs.edit().putBoolean("permissions_shown", true).apply()

                    // Pass actual checkbox states to the next screen
                    onPermissionsHandled(notificationsChecked, contactsChecked)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                shape = RoundedCornerShape(27.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                contentPadding = PaddingValues(0.dp),
                elevation = ButtonDefaults.buttonElevation(0.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            brush = Brush.horizontalGradient(
                                colors = listOf(deepBlue, primaryBlue)
                            ),
                            shape = RoundedCornerShape(27.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Continue",
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        letterSpacing = 0.3.sp
                    )
                }
            }
        }
    }
}

// ── Reusable section label ────────────────────────────────────────
@Composable
fun SectionLabel(text: String, color: Color) {
    Text(
        text = text,
        fontSize = 14.sp,
        fontWeight = FontWeight.SemiBold,
        color = color,
        modifier = Modifier.fillMaxWidth()
    )
}

// ── Required Permission Card — no chevron arrow ───────────────────
@Composable
fun RequiredPermissionCard(
    iconRes: Int,
    title: String,           // edit title here
    description: String,     // edit description here
    badgeBg: Color,
    badgeIcon: Color,
    cardBorder: Color,
    nearBlack: Color,
    mutedText: Color,
    iconSize: Dp = 18.dp,     // adjust icon size here
    cardBackground: Color
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Color.White)
            .border(1.dp, cardBorder, RoundedCornerShape(14.dp))
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(46.dp)
                .clip(CircleShape)
                .background(badgeBg),
            contentAlignment = Alignment.Center
        ) {
            // Uses your drawable directly — crisp at any size
            Image(
                painter = painterResource(id = iconRes),
                contentDescription = null,
                modifier = Modifier.size(iconSize),
                contentScale = ContentScale.Fit
            )
        }

        Spacer(modifier = Modifier.width(14.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                fontSize = 15.sp,          // adjust font size here
                fontWeight = FontWeight.SemiBold,
                color = nearBlack
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = description,
                fontSize = 13.sp,          // adjust font size here
                color = mutedText,
                lineHeight = 18.sp
            )
        }

    }
}

// ── Preference Permission Card — with checkbox ────────────────────
@Composable
fun PreferencePermissionCard(
    iconRes: Int,
    title: String,
    description: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    badgeBg: Color,
    badgeIcon: Color,
    cardBorder: Color,
    nearBlack: Color,
    mutedText: Color,
    primaryBlue: Color,
    iconSize: Dp = 18.dp
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Color.White)
            .border(1.dp, cardBorder, RoundedCornerShape(14.dp))
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = CheckboxDefaults.colors(
                checkedColor = primaryBlue,
                uncheckedColor = Color(0xFF8C9FBD),
                checkmarkColor = Color.White
            )
        )

        Spacer(modifier = Modifier.width(10.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                color = nearBlack
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = description,
                fontSize = 13.sp,
                color = mutedText,
                lineHeight = 18.sp
            )
        }

        Spacer(modifier = Modifier.width(10.dp))

        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(badgeBg),
            contentAlignment = Alignment.Center
        ) {
            Image(
                painter = painterResource(id = iconRes),
                contentDescription = null,
                modifier = Modifier.size(iconSize),
                contentScale = ContentScale.Fit
            )
        }
    }
}