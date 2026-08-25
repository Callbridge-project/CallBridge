package com.callbridge.app

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import android.content.Context
import android.content.Intent
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(onLoginSuccess: () -> Unit) {

    // State variables — these hold what the user types and what the screen shows
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var rememberMe by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    // scope lets us run suspend functions like AuthService.login from a button click
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // Color constants matching your design system
    val primaryBlue = Color(0xFF4A90D9)
    val deepBlue = Color(0xFF1A3A6B)
    val nearBlack = Color(0xFF0A0A1A)
    val mutedText = Color(0xFF6B7A99)
    val lightGray = Color(0xFFF5F7FA)
    val cardBorder = Color(0xFFE0E7F0)
    val white = Color(0xFFFFFFFF)

    Box(modifier = Modifier.fillMaxSize()) {

        // TOP GRADIENT SECTION
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .height(340.dp)
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF999999),
                            Color(0xFFFFFFFF),
                            Color(0xFF999999)
                        )
                    )
                ),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Image(
                painter = painterResource(id = R.drawable.logo1),
                contentDescription = "CallBridge Logo",
                modifier = Modifier.size(340.dp)
            )

            Spacer(modifier = Modifier.height(12.dp))

        }

        // WHITE CARD — overlaps the gradient from below
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .clip(RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp))
                .background(Color.White)
                .padding(horizontal = 24.dp, vertical = 12.dp)
                .verticalScroll(rememberScrollState())
        ) {

            // HEADING
            Text(
                text = "Welcome Back",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = nearBlack,
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Sign in to your account",
                fontSize = 14.sp,
                color = mutedText,
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            // EMAIL FIELD
            Text(
                text = "Email",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = nearBlack
            )

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                placeholder = { Text("Enter your email", color = mutedText) },
                leadingIcon = {
                    Icon(
                        painter = painterResource(id = R.drawable.email),
                        contentDescription = "Email icon",
                        tint = mutedText,
                        modifier = Modifier.size(20.dp)
                    )
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(30.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    unfocusedBorderColor = cardBorder,
                    focusedBorderColor = primaryBlue,
                    unfocusedContainerColor = white,
                    focusedContainerColor = white
                )
            )

            Spacer(modifier = Modifier.height(10.dp))

            // PASSWORD FIELD
            Text(
                text = "Password",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = nearBlack
            )

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                placeholder = { Text("Enter your password", color = mutedText) },
                leadingIcon = {
                    Icon(
                        painter = painterResource(id = android.R.drawable.ic_lock_idle_lock),
                        contentDescription = "Password icon",
                        tint = mutedText,
                        modifier = Modifier.size(20.dp)
                    )
                },
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            painter = painterResource(
                                id = if (passwordVisible)
                                   R.drawable.notvisible
                                else
                                    R.drawable.visible
                            ),
                            contentDescription = if (passwordVisible) "Hide password" else "Show password",
                            tint = mutedText,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                },
                visualTransformation = if (passwordVisible)
                    VisualTransformation.None
                else
                    PasswordVisualTransformation(),
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(30.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    unfocusedBorderColor = cardBorder,
                    focusedBorderColor = primaryBlue,
                    unfocusedContainerColor = white,
                    focusedContainerColor = white
                )
            )

            Spacer(modifier = Modifier.height(12.dp))

            // REMEMBER ME + FORGOT PASSWORD ROW
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(
                        checked = rememberMe,
                        onCheckedChange = { rememberMe = it }
                    )
                    Text(
                        text = "Remember me",
                        fontSize = 13.sp,
                        color = mutedText
                    )
                }

                Text(
                    text = "Forgot password?",
                    fontSize = 13.sp,
                    color = primaryBlue,
                    modifier = Modifier.clickable { /* TODO: forgot password flow */ }
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            // ERROR MESSAGE — only shows when there is an error
            if (errorMessage.isNotEmpty()) {
                Text(
                    text = errorMessage,
                    color = Color(0xFFE53935),
                    fontSize = 13.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp),
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // LOGIN BUTTON
            Button(
                onClick = {
                    // Basic validation before hitting Appwrite
                    if (email.isBlank() || password.isBlank()) {
                        errorMessage = "Please enter your email and password"
                        return@Button
                    }

                    isLoading = true
                    errorMessage = ""

                    scope.launch {
                        val result = AuthService.login(email.trim(), password)
                        isLoading = false

                        if (result.isSuccess) {
                            // Get the user ID and store it locally
                            val userResult = AuthService.getCurrentUser()
                            if (userResult.isSuccess) {
                                val userId = userResult.getOrNull()?.id ?: ""
                                // Store in SharedPreferences so the background service can access it
                                val prefs = context.getSharedPreferences("callbridge_prefs", Context.MODE_PRIVATE)
                                prefs.edit().putString("current_user_id", userId).apply()
                            }

                            // Start the monitoring service
                            val serviceIntent =
                                Intent(context, CallBridgeMonitoringService::class.java)
                            context.startForegroundService(serviceIntent)

                            onLoginSuccess()


                        } else {
                            errorMessage = "Invalid email or password. Please try again."
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                shape = RoundedCornerShape(27.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.Transparent
                ),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(0.dp)
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
                    if (isLoading) {
                        CircularProgressIndicator(
                            color = Color.White,
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(
                            text = "Log in",
                            color = Color.White,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // OR DIVIDER
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(modifier = Modifier
                    .weight(1f)
                    .height(1.dp)
                    .background(cardBorder))
                Text(
                    text = "  Or login with  ",
                    fontSize = 13.sp,
                    color = mutedText
                )
                Box(modifier = Modifier
                    .weight(1f)
                    .height(1.dp)
                    .background(cardBorder))
            }

            Spacer(modifier = Modifier.height(16.dp))

            // GOOGLE BUTTON — placeholder for now
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .border(1.dp, cardBorder, RoundedCornerShape(26.dp))
                    .clip(RoundedCornerShape(26.dp))
                    .background(Color.White)
                    .clickable { /* Google Sign-In — future implementation */ },
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.google),
                        contentDescription = "Google",
                        modifier = Modifier.size(22.dp)
                    )
                    Spacer(modifier = Modifier.size(10.dp))
                    Text(
                        text = "Continue with Google",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Medium,
                        color = nearBlack
                    )
                }
            }

            Spacer(modifier = Modifier.height(15.dp))

            // SIGN UP REDIRECT
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "Don't have an account? ",
                    fontSize = 14.sp,
                    color = mutedText
                )
                val contextView = LocalContext.current

                Text(
                    text = "Sign up",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = primaryBlue,
                    modifier = Modifier.clickable {
                        // TODO: Open web signup after deployment
                    }
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}