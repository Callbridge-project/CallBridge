package com.callbridge.app

import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.os.Build
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

    companion object {
        // Unique tracking key for the role manager request system
        private const val ROLE_REQUEST_CODE = 4321
    }

    // This launcher shows the permission dialog and handles the result
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { results ->
        results.forEach { (permission, granted) ->
            Log.d("CallBridge", "Permission $permission granted: $granted")
        }
        // Check for Android 16 special role requirement once runtime dialog closes
        checkAndRequestSystemRole()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        enableEdgeToEdge()

        // Request any permissions that have not been granted yet
        val permissionsNeeded = PermissionManager.getPermissionsToRequest(this)
        if (permissionsNeeded.isNotEmpty()) {
            Log.d("CallBridge", "Requesting permissions: ${permissionsNeeded.joinToString()}")
            permissionLauncher.launch(permissionsNeeded)
        } else {
            Log.d("CallBridge", "All permissions already granted")
            // If permissions are already safe, verify the background role status immediately
            checkAndRequestSystemRole()
        }

        setContent {
            CallBridgeTheme {
                AppNavigation()
            }
        }
    }

    /**
     * Bypasses strict Android 16 background restrictions by prompting the user
     * to grant the application Assistant tracking capabilities.
     */
    private fun checkAndRequestSystemRole() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = getSystemService(Context.ROLE_SERVICE) as? RoleManager
            if (roleManager != null) {
                val isRoleHeld = roleManager.isRoleHeld(RoleManager.ROLE_ASSISTANT)
                if (!isRoleHeld) {
                    Log.d("CallBridge", "Assistant role not held. Prompting user...")
                    try {
                        val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_ASSISTANT)
                        @Suppress("DEPRECATION")
                        startActivityForResult(intent, ROLE_REQUEST_CODE)
                    } catch (e: Exception) {
                        Log.e("CallBridge", "Failed to launch role manager intent: ${e.message}")
                    }
                } else {
                    Log.d("CallBridge", "System Assistant role is securely verified.")
                }
            }
        }
    }

    @Suppress("DEPRECATION")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == ROLE_REQUEST_CODE) {
            if (resultCode == RESULT_OK) {
                Log.d("CallBridge", "User successfully granted Assistant privileges!")
            } else {
                Log.w("CallBridge", "User denied Assistant privileges. Background telemetry might be restricted.")
            }
        }
    }
}
