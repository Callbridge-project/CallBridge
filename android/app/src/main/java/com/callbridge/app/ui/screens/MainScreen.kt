package com.callbridge.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.callbridge.app.R

sealed class BottomNavItem(
    val route: String,
    val label: String,
    val iconRes: Int
) {
    object Dashboard : BottomNavItem("dashboard", "Dashboard", R.drawable.inactivehome)
    object Calls : BottomNavItem("calls", "Calls", R.drawable.inactivecall)
    object SMS : BottomNavItem("sms", "SMS", R.drawable.inactivesms)
    object Device : BottomNavItem("device", "Device", R.drawable.inactivedevice)
    object Settings : BottomNavItem("settings", "Settings", R.drawable.inactivesetting)
}

@Composable
fun MainScreen(onLogout: () -> Unit) {
    var selectedTab by remember { mutableStateOf("dashboard") }

    val primaryBlue = Color(0xFF4A90D9)
    val deepBlue = Color(0xFF1A3A6B)
    val nearBlack = Color(0xFF0A0A1A)
    val mutedText = Color(0xFF6B7A99)
    val borderGray = Color(0xFFE0E7F0)

    val navItems = listOf(
        BottomNavItem.Dashboard,
        BottomNavItem.Calls,
        BottomNavItem.SMS,
        BottomNavItem.Device,
        BottomNavItem.Settings
    )

    Scaffold(
        containerColor = Color(0xFFF5F7FA),
        bottomBar = {
            Column {
                HorizontalDivider(color = borderGray, thickness = 0.dp,)
                NavigationBar(
                    containerColor = Color.White,
                    tonalElevation = 0.dp,
                    windowInsets = WindowInsets(left = 16.dp, right = 16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(70.dp)


                ) {
                    navItems.forEach { item ->
                        val selected = selectedTab == item.route
                        NavigationBarItem(
                            selected = selected,
                            onClick = { selectedTab = item.route },
                            icon = {
                                Icon(
                                    painter = painterResource(id = item.iconRes),
                                    contentDescription = item.label,
                                    modifier = Modifier.size(20.dp)
                                )
                            },
                            label = {
                                Text(
                                    text = item.label,
                                    fontSize = 10.sp,
                                    fontWeight = if (selected) FontWeight.SemiBold
                                    else FontWeight.Normal
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = primaryBlue,
                                selectedTextColor = primaryBlue,
                                unselectedIconColor = mutedText,
                                unselectedTextColor = mutedText,
                                indicatorColor = Color.Transparent
                            )
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues)) {
            when (selectedTab) {
                "dashboard" -> DashboardScreen()
                "calls" -> CallsScreen()
                "sms" -> SmsScreen()
                "device" -> DeviceScreen()
                "settings" -> SettingsScreen(onLogout = onLogout)
            }
        }
    }
}