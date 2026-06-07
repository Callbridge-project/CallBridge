package com.callbridge.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import android.util.Log
import androidx.lifecycle.lifecycleScope
import com.callbridge.app.ui.theme.CallBridgeTheme
import io.appwrite.exceptions.AppwriteException
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        AppwriteClient.initialize(applicationContext)
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Appwrite connection test
        testAppwriteConnection()

        setContent {
            CallBridgeTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    Greeting(
                        name = "Android",
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }

    private fun testAppwriteConnection() {
        lifecycleScope.launch {
            try {
                // Try to get the current account (even if not logged in, it verifies the endpoint/project)
                val response = AppwriteClient.account.get()
                Log.d("AppwriteTest", "Connected! User: ${response.name}")
            } catch (e: AppwriteException) {
                if (e.code == 401) {
                    Log.d("AppwriteTest", "Connected to Appwrite, but no user is logged in (expected).")
                } else {
                    Log.e("AppwriteTest", "Connection failed: ${e.message}")
                }
            } catch (e: Exception) {
                Log.e("AppwriteTest", "Unexpected error: ${e.message}")
            }
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    CallBridgeTheme {
        Greeting("Android")
    }
}