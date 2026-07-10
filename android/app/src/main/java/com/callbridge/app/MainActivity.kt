package com.callbridge.app

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import com.callbridge.app.ui.theme.CallBridgeTheme

class MainActivity : ComponentActivity() {

    // This launcher shows the permission dialog and handles the result
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { results ->
        results.forEach { (permission, granted) ->
            Log.d("CallBridge", "Permission $permission granted: $granted")
        }
        // Whether granted or denied we still launch the app
        // The service will handle missing permissions gracefully
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        NotificationHelper.createNotificationChannel(this)
        AppwriteClient.initialize(applicationContext)

        // Request any permissions that have not been granted yet
        val permissionsNeeded = PermissionManager.getPermissionsToRequest(this)
        if (permissionsNeeded.isNotEmpty()) {
            Log.d("CallBridge", "Requesting permissions: ${permissionsNeeded.joinToString()}")
            permissionLauncher.launch(permissionsNeeded)
        } else {
            Log.d("CallBridge", "All permissions already granted")
        }

        setContent {
            CallBridgeTheme {
                AppNavigation()
            }
        }
    }
}