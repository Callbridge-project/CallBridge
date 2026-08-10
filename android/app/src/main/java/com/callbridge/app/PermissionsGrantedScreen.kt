package com.callbridge.app

import android.content.Context
import androidx.compose.foundation.Image
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.animation.core.*
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun PermissionsGrantedScreen(
    notificationsGranted: Boolean,  // passed from PermissionsScreen
    contactsGranted: Boolean,        // passed from PermissionsScreen
    onGoToDashboard: () -> Unit) {

    val context = LocalContext.current

    // Fetch device ID stored in SharedPreferences after registration
    val deviceId = remember {
        val prefs = context.getSharedPreferences("callbridge_prefs", Context.MODE_PRIVATE)
        val rawId = prefs.getString("registered_device_id", "CB-XXXX-XXX") ?: "CB-XXXX-XXX"
        if (rawId != null) {
            // Format to CB-XXXX-XXX style for display
            "CB-" + rawId.take(4).uppercase() + "-" + rawId.substring(4, 7).uppercase()
        } else {
            "CB-XXXX-XXX"
        }
    }

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

    // Colors
    val white = Color.White
    val nearBlack = Color(0xFF0A0A1A)
    val mutedText = Color(0xFF6B7A99)
    val cardBorder = Color(0xFFE0E7F0)
    val badgeBg = Color(0xFFEEF4FF)
    val badgeIcon = Color(0xFF1A3A6B)
    val deepBlue = Color(0xFF1A3A6B)
    val accentBlue = Color(0xFF4A90D9)
    val green = Color(0xFF2E7D32)
    val greenBg = Color(0xFFE8F5E9)

    Box(modifier = Modifier.fillMaxSize()) {

        // ── Full screen gradient background ───────────────────────
        // White at top fading through light blue into deep navy at bottom
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    brush = Brush.verticalGradient(
                        colorStops = arrayOf(
                            0.0f to Color(0xFFFFFFFF),
                            0.15f to Color(0xFFEAF1FB),
                            0.45f to Color(0xFFCFDFF5),
                            0.72f to Color(0xFF4A6FA5),
                            1.0f to Color(0xFF0D1F3C)
                        )
                    )
                )
        )

        Column(

            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {

            Spacer(modifier = Modifier.height(52.dp))

            // ── Logo at top ───────────────────────────────────────
            Image(
                painter = painterResource(id = R.drawable.logo1),
                contentDescription = "CallBridge Logo",
                modifier = Modifier
                    .height(86.dp)
                    .wrapContentWidth(),
                contentScale = ContentScale.Fit
            )

            Spacer(modifier = Modifier.height(14.dp))

            // ── Main white card ───────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 10.dp)
                    .shadow(
                        elevation = 8.dp,
                        shape = RoundedCornerShape(24.dp),
                        ambientColor = Color(0xFF4A90D9).copy(alpha = 0.15f),
                        spotColor = Color(0xFF1A3A6B).copy(alpha = 0.12f)
                    )
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color.White)
                    .padding(horizontal = 20.dp, vertical = 32.dp)
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {

                    // ── Green checkmark circle ────────────────────
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .shadow(
                                elevation = 6.dp,
                                shape = CircleShape,
                                ambientColor = green.copy(alpha = 0.3f),
                                spotColor = green.copy(alpha = 0.2f)
                            )
                            .clip(CircleShape)
                            .background(
                                brush = Brush.radialGradient(
                                    colors = listOf(
                                        Color(0xFF4CAF50),
                                        Color(0xFF2E7D32)
                                    )
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(
                                id = R.drawable.check
                            ),
                            contentDescription = "Granted",
                            tint = white,
                            modifier = Modifier.size(36.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(22.dp))

                    // ── Heading ───────────────────────────────────
                    Text(
                        text = "Permissions Granted!",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = nearBlack,
                        textAlign = TextAlign.Center,
                        letterSpacing = (-0.3).sp
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Your device is now securely bridged. All necessary permissions have been successfully authorized, and real-time monitoring is active.",
                        fontSize = 14.sp,
                        color = mutedText,
                        textAlign = TextAlign.Center,
                        lineHeight = 21.sp
                    )

                    Spacer(modifier = Modifier.height(28.dp))

                    // ── Permission rows ───────────────────────────
                    GrantedPermissionRow(
                        iconRes = R.drawable.device, // replace with ic_phone_state
                        title = "Phone State Access",
                        subtitle = "Encrypted & Secure",
                        badgeBg = badgeBg,
                        badgeIcon = badgeIcon,
                        green = green,
                        greenBg = greenBg,
                        cardBorder = cardBorder,
                        nearBlack = nearBlack,
                        mutedText = mutedText,

                    )


                    Spacer(modifier = Modifier.height(10.dp))

                    GrantedPermissionRow(
                        iconRes = R.drawable.call, // replace with ic_call_access
                        title = "Calls Access",
                        subtitle = "Active Bridge Link",
                        badgeBg = badgeBg,
                        badgeIcon = badgeIcon,
                        green = green,
                        greenBg = greenBg,
                        cardBorder = cardBorder,
                        nearBlack = nearBlack,
                        mutedText = mutedText
                    )


                    Spacer(modifier = Modifier.height(10.dp))

                    GrantedPermissionRow(
                        iconRes = R.drawable.message, // replace with ic_sms_access
                        title = "SMS Access & Synchronization",
                        subtitle = "Real-time sync",
                        badgeBg = badgeBg,
                        badgeIcon = badgeIcon,
                        green = green,
                        greenBg = greenBg,
                        cardBorder = cardBorder,
                        nearBlack = nearBlack,
                        mutedText = mutedText
                    )


                    if (notificationsGranted) {
                    Spacer(modifier = Modifier.height(10.dp))
                    GrantedPermissionRow(
                        iconRes = R.drawable.notify, // replace with ic_notifications
                        title = "Receive Notifications",
                        subtitle = "Instant status updates",
                        badgeBg = badgeBg,
                        badgeIcon = badgeIcon,
                        green = green,
                        greenBg = greenBg,
                        cardBorder = cardBorder,
                        nearBlack = nearBlack,
                        mutedText = mutedText
                    )}

                    if (contactsGranted) {
                        Spacer(modifier = Modifier.height(10.dp))
                        GrantedPermissionRow(
                            iconRes = R.drawable.contacts, // replace with ic_notifications
                            title = "Contact Access",
                            subtitle = "Name resolution active",
                            badgeBg = badgeBg,
                            badgeIcon = badgeIcon,
                            green = green,
                            greenBg = greenBg,
                            cardBorder = cardBorder,
                            nearBlack = nearBlack,
                            mutedText = mutedText
                        )}

                    Spacer(modifier = Modifier.height(28.dp))

                    // ── Go to Dashboard button ────────────────────
                    Button(
                        onClick = onGoToDashboard,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(54.dp),
                        shape = RoundedCornerShape(27.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color.Transparent
                        ),
                        contentPadding = PaddingValues(0.dp),
                        elevation = ButtonDefaults.buttonElevation(0.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    brush = Brush.horizontalGradient(
                                        colors = listOf(
                                            Color(0xFF0D1F3C),
                                            Color(0xFF1A3A6B)
                                        )
                                    ),
                                    shape = RoundedCornerShape(27.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Text(
                                    text = "Go to Dashboard",
                                    color = white,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    letterSpacing = 0.3.sp
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Icon(
                                    painter = painterResource(
                                        id = R.drawable.forward
                                    ),
                                    contentDescription = null,
                                    tint = white,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // ── Device ID ─────────────────────────────────
                    Text(
                        text = "Device ID: $deviceId",
                        fontSize = 12.sp,
                        color = mutedText,
                        textAlign = TextAlign.Center
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // ── System Engine Online badge ─────────────────────────
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.White.copy(alpha = 0.15f))
                    .border(
                        1.dp,
                        Color.White.copy(alpha = 0.25f),
                        RoundedCornerShape(20.dp)
                    )
                    .padding(horizontal = 18.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Green pulse dot
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .graphicsLayer {
                            scaleX = dotScale
                            scaleY = dotScale
                            alpha = dotAlpha
                        }
                        .clip(CircleShape)
                        .background(Color(0xFF4CAF50))
                )
                Spacer(modifier = Modifier.width(7.dp))
                Text(
                    text = "System Engine Online",
                    fontSize = 12.sp,
                    color = Color.White,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

// ── Single granted permission row ─────────────────────────────────
@Composable
fun GrantedPermissionRow(
    iconRes: Int,
    title: String,
    subtitle: String,
    badgeBg: Color,
    badgeIcon: Color,
    green: Color,
    greenBg: Color,
    cardBorder: Color,
    nearBlack: Color,
    mutedText: Color
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Color(0xFFF8FAFF))
            .border(1.dp, cardBorder, RoundedCornerShape(14.dp))
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Left icon badge
        Box(
            modifier = Modifier
                .size(42.dp)
                .clip(CircleShape)
                .background(badgeBg),
            contentAlignment = Alignment.Center
        ) {
            Image(
                painter = painterResource(id = iconRes),
                contentDescription = null,
                modifier = Modifier.size(22.dp),
                contentScale = ContentScale.Fit
            )
        }

        Spacer(modifier = Modifier.width(14.dp))

        // Text
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = nearBlack
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                fontSize = 12.sp,
                color = mutedText
            )
        }

        Spacer(modifier = Modifier.width(10.dp))

        // Green check badge on right
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(greenBg),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                painter = painterResource(
                    id = R.drawable.confirmed
                ),
                contentDescription = "Granted",
                tint = green,
                modifier = Modifier.size(18.dp)
            )
        }
    }
}