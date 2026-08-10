package com.callbridge.app

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TermsAndPrivacyScreen(onBack: () -> Unit) {

    val primaryBlue = Color(0xFF1A3A6B)
    val accentBlue = Color(0xFF4A90D9)
    val nearBlack = Color(0xFF0A0A1A)
    val policeBlue = Color(0xFF00236F)
    val mutedText = Color(0xFF6B7A99)
    val borderGray = Color(0xFFE0E7F0)
    val sectionBorder = Color(0xFF1A3A6B)

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = "Platform Policy",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = policeBlue,
                        modifier = Modifier.fillMaxWidth().padding(end = 48.dp),
                        textAlign = TextAlign.Center,

                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            painter = androidx.compose.ui.res.painterResource(
                                id = R.drawable.back
                            ),
                            contentDescription = "Back",
                            tint = policeBlue,
                            modifier = Modifier.size(20.dp)

                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                )
            )
            HorizontalDivider(color = borderGray, thickness = 1.dp)
        },
        containerColor = Color.White
    ) { paddingValues ->

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
        ) {

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {

                // ── Official Documentation Badge ──────────────────
                Row(
                    modifier = Modifier
                        .background(
                            color = Color(0xFFEEF4FF),
                            shape = RoundedCornerShape(20.dp)
                        )
                        .border(1.dp, borderGray, RoundedCornerShape(20.dp))
                        .padding(horizontal = 14.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        painter = androidx.compose.ui.res.painterResource(
                            id = R.drawable.shield,
                        ),
                        contentDescription = null,
                        tint = policeBlue,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Official Documentation",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = policeBlue
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // ── Main Heading ──────────────────────────────────
                Text(
                    text = "User Agreements & Privacy Standards",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = nearBlack,
                    textAlign = TextAlign.Center,
                    lineHeight = 30.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "Transparency and security are the cornerstones of our architecture. At CallBridge, we maintain rigorous standards to ensure your telephony monitoring remains safe, private, and compliant.",
                    fontSize = 14.sp,
                    color = mutedText,
                    textAlign = TextAlign.Center,
                    lineHeight = 22.sp
                )

                Spacer(modifier = Modifier.height(28.dp))

                // ── Sections Card ─────────────────────────────────
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            color = Color.White,
                            shape = RoundedCornerShape(14.dp)
                        )
                        .border(1.dp, borderGray, RoundedCornerShape(14.dp))
                        .padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(28.dp)
                ) {

                    // Section 1
                    PolicySection(
                        number = "1",
                        title = "Introduction",
                        sectionBorder = sectionBorder,
                        nearBlack = nearBlack
                    ) {
                        PolicyBodyText(
                            text = buildAnnotatedString {
                                append("Welcome to ")
                                withStyle(SpanStyle(color = accentBlue, fontWeight = FontWeight.Medium)) {
                                    append("CallBridge")
                                }
                                append(". This document outlines our unwavering commitment to providing secure telephony monitoring and bridging solutions. By accessing our platform, you agree to these fundamental standards designed to protect all stakeholders.")
                            },
                            mutedText = mutedText
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        PolicyBodyText(
                            text = buildAnnotatedString {
                                append("Our mission is to provide enterprise-grade connectivity through fluid crystal clarity. We believe that professional telephony monitoring should be accessible without compromising the integrity of the data being transmitted.")
                            },
                            mutedText = mutedText
                        )
                    }

                    // Section 2
                    PolicySection(
                        number = "2",
                        title = "Data Usage & Synchronization",
                        sectionBorder = sectionBorder,
                        nearBlack = nearBlack
                    ) {
                        Text(
                            text = buildAnnotatedString {
                                withStyle(SpanStyle(color = accentBlue, fontWeight = FontWeight.SemiBold)) {
                                    append("CallBridge")
                                }
                                append(" facilitates the seamless bridging of voice calls and SMS data. This synchronization occurs in real-time, utilizing our proprietary low-latency cloud infrastructure.")
                            },
                            fontSize = 14.sp,
                            lineHeight = 22.sp
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        // Item 1: Operational Analysis / Real-time Icon
                        PolicyBulletItem(
                            iconRes = R.drawable.sync, // Replace with R.drawable.ic_analytics or similar
                            text = "Real-time metadata capture for operational analysis.",
                            mutedText = mutedText,
                            iconTint = accentBlue
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        // Item 2: Storage / Time Logs Icon
                        PolicyBulletItem(
                            iconRes = R.drawable.icon_refresh, // Replace with R.drawable.ic_clock or similar
                            text = "Temporary storage of session logs for diagnostic purposes, retained for no longer than 30 days.",
                            mutedText = mutedText,
                            iconTint = accentBlue
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        // Item 3: Encryption / Sync Icon
                        PolicyBulletItem(
                            iconRes = R.drawable.cloud, // Replace with R.drawable.ic_sync or similar
                            text = "Encrypted synchronization across authorized administrative dashboards.",
                            mutedText = mutedText,
                            iconTint = accentBlue
                        )
                    }

                    // Section 3
                    PolicySection(
                        number = "3",
                        title = "User Responsibility",
                        sectionBorder = sectionBorder,
                        nearBlack = nearBlack
                    ) {
                        PolicyBodyText(
                            text = buildAnnotatedString {
                                append("Integrity is vital to the ")
                                withStyle(SpanStyle(color = accentBlue, fontWeight = FontWeight.Medium)) {
                                    append("CallBridge")
                                }
                                append(" ecosystem. Users are strictly required to verify ownership or explicit authorization for any device integrated into our platform.")
                            },
                            mutedText = mutedText
                        )
                        Spacer(modifier = Modifier.height(14.dp))
                        // Quote block
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    color = Color(0xFFF5F7FA),
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .border(1.dp, borderGray, RoundedCornerShape(8.dp))
                                .padding(16.dp)
                        ) {
                            Text(
                                text = "\"The platform must not be used for unauthorized surveillance. It is the sole responsibility of the account holder to ensure that the monitoring of telephony data complies with local and international jurisdictional laws.\"",
                                fontSize = 13.sp,
                                color = Color(0xFF4A5568),
                                lineHeight = 20.sp,
                                fontStyle = FontStyle.Italic
                            )
                        }
                    }

                    // Section 4
                    PolicySection(
                        number = "4",
                        title = "Privacy Architecture",
                        sectionBorder = sectionBorder,
                        nearBlack = nearBlack
                    ) {
                        // Vertical feature list
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // End-to-End Encryption
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(
                                        color = Color(0xFFF8FAFF),
                                        shape = RoundedCornerShape(10.dp)
                                    )
                                    .border(1.dp, borderGray, RoundedCornerShape(10.dp))
                                    .padding(14.dp)
                            ) {
                                Icon(
                                    painter = androidx.compose.ui.res.painterResource(
                                        id = R.drawable.encryption
                                    ),
                                    contentDescription = null,
                                    tint = policeBlue,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "End-to-End Encryption",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = policeBlue,
                                    lineHeight = 18.sp
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "All packets transmitted via CallBridge are shielded using military-grade AES-256 encryption, ensuring no mid-flight interception.",
                                    fontSize = 12.sp,
                                    color = mutedText,
                                    lineHeight = 18.sp
                                )
                            }

                            // Zero-Knowledge Storage
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(
                                        color = Color(0xFFF8FAFF),
                                        shape = RoundedCornerShape(10.dp)
                                    )
                                    .border(1.dp, borderGray, RoundedCornerShape(10.dp))
                                    .padding(14.dp)
                            ) {
                                Icon(
                                    painter = androidx.compose.ui.res.painterResource(
                                        id = R.drawable.shield1
                                    ),
                                    contentDescription = null,
                                    tint = primaryBlue,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "Zero-Knowledge Storage",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = primaryBlue,
                                    lineHeight = 18.sp
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "Our cloud infrastructure is designed so that even our administrators cannot access the content of bridged communications.",
                                    fontSize = 12.sp,
                                    color = mutedText,
                                    lineHeight = 18.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        PolicyBodyText(
                            text = buildAnnotatedString {
                                append("Our Fluid Crystal design philosophy extends to our back-end: clear, structured, and impenetrable. We maintain physical and logical separation of data sets to prevent cross-contamination of user information.")
                            },
                            mutedText = mutedText
                        )
                    }

                    // Section 5
                    PolicySection(
                        number = "5",
                        title = "Consent",
                        sectionBorder = sectionBorder,
                        nearBlack = nearBlack
                    ) {
                        PolicyBodyText(
                            text = buildAnnotatedString {
                                append("By utilizing the ")
                                withStyle(SpanStyle(color = accentBlue, fontWeight = FontWeight.Medium)) {
                                    append("CallBridge")
                                }
                                append(" platform, you provide explicit consent for the processing of telephony data as described herein. You acknowledge that your interaction with the service constitutes a binding agreement to adhere to these standards.")
                            },
                            mutedText = mutedText
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        PolicyBodyText(
                            text = buildAnnotatedString {
                                append("We reserve the right to update these terms to reflect evolving regulatory landscapes. Significant changes will be communicated via the platform's primary administrative dashboard.")
                            },
                            mutedText = mutedText
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // ── Last Updated ──────────────────────────────────
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        painter = androidx.compose.ui.res.painterResource(
                            id = android.R.drawable.ic_menu_recent_history
                        ),
                        contentDescription = null,
                        tint = mutedText,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Last Updated: October 24, 2024",
                        fontSize = 12.sp,
                        color = mutedText
                    )
                }

                Spacer(modifier = Modifier.height(32.dp))

                // ── Footer ────────────────────────────────────────
                HorizontalDivider(color = borderGray, thickness = 1.dp)

                Spacer(modifier = Modifier.height(20.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "CallBridge",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = nearBlack
                        )
                        Text(
                            text = "© 2024 CallBridge Platform. All rights reserved.",
                            fontSize = 11.sp,
                            color = mutedText
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}



// ── Section with left blue border ────────────────────────────────
@Composable
fun PolicySection(
    number: String,
    title: String,
    sectionBorder: Color,
    nearBlack: Color,
    content: @Composable ColumnScope.() -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            // Left accent bar
            Box(
                modifier = Modifier
                    .width(4.dp)
                    .height(22.dp)
                    .background(
                        color = sectionBorder,
                        shape = RoundedCornerShape(2.dp)
                    )
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = "$number. $title",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = nearBlack
            )
        }
        Spacer(modifier = Modifier.height(12.dp))
        content()
    }
}

// ── Body text helper ──────────────────────────────────────────────
@Composable
fun PolicyBodyText(
    text: androidx.compose.ui.text.AnnotatedString,
    mutedText: Color
) {
    Text(
        text = text,
        fontSize = 14.sp,
        color = mutedText,
        lineHeight = 22.sp
    )
}

// ── Bullet point item ─────────────────────────────────────────────
@Composable
fun PolicyBulletItem(text: String, mutedText: Color, iconRes: Int, iconTint: Color) {
    Row(
        verticalAlignment = Alignment.Top,
        modifier = Modifier.fillMaxWidth()
    ) {
        Icon(
            painter = androidx.compose.ui.res.painterResource(
                id = iconRes
            ),
            contentDescription = null,
            tint = iconTint,
            modifier = Modifier
                .size(16.dp)
                .padding(top = 3.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = text,
            fontSize = 13.sp,
            color = mutedText,
            lineHeight = 20.sp,
            modifier = Modifier.weight(1f)
        )
    }
}