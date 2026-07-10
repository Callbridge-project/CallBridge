package com.callbridge.app

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import android.content.Context
import android.content.Intent
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import androidx.compose.runtime.LaunchedEffect


@Composable
fun DashboardPlaceholder(onLogout: () -> Unit) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current



    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = "Dashboard coming soon or later", fontSize = 20.sp)

        Button(
            onClick = {
                scope.launch {
                    // Stop the monitoring service first
                    val serviceIntent = Intent(context, CallBridgeMonitoringService::class.java)
                    context.stopService(serviceIntent)
                    val prefs = context.getSharedPreferences("callbridge_prefs", Context.MODE_PRIVATE)
                    prefs.edit().remove("current_user_id").apply()

                    AuthService.logout()
                    onLogout()
                }
            },
            modifier = Modifier.padding(top = 24.dp)
        ) {
            Text("Logout")
        }
    }
}