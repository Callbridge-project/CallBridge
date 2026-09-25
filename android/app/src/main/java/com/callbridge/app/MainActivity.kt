package com.callbridge.app

import android.os.Bundle
import android.util.Log

import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts

import com.callbridge.app.ui.navigation.AppNavigation
import com.callbridge.app.ui.theme.CallBridgeTheme
import com.callbridge.app.utils.PermissionManager

class MainActivity : ComponentActivity() {

    /**
     * Requests the Android permissions required by CallBridge.
     *
     * IMPORTANT:
     * MainActivity does NOT start the monitoring service.
     *
     * The monitoring service should be started after a valid
     * authenticated user session exists.
     */
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { results ->

        var allGranted = true

        results.forEach { (permission, granted) ->

            Log.d(
                "CallBridge",
                "Permission $permission granted: $granted"
            )

            if (!granted) {
                allGranted = false
            }
        }

        if (allGranted) {

            Log.d(
                "CallBridge",
                "All requested permissions granted"
            )

            Log.d(
                "CallBridge",
                "Monitoring service will be started after user authentication"
            )

        } else {

            Log.w(
                "CallBridge",
                "One or more required permissions were denied"
            )
        }
    }

    override fun onCreate(
        savedInstanceState: Bundle?
    ) {

        super.onCreate(savedInstanceState)

        enableEdgeToEdge()

        /*
         * Request permissions that are not yet granted.
         */
        val permissionsNeeded =
            PermissionManager.getPermissionsToRequest(this)

        if (permissionsNeeded.isNotEmpty()) {

            Log.d(
                "CallBridge",
                "Requesting permissions: ${
                    permissionsNeeded.joinToString()
                }"
            )

            permissionLauncher.launch(
                permissionsNeeded
            )

        } else {

            Log.d(
                "CallBridge",
                "All required permissions already granted"
            )
        }

        setContent {

            CallBridgeTheme {
                AppNavigation()
            }
        }
    }
}