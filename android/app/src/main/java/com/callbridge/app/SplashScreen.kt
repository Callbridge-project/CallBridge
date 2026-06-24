package com.callbridge.app

import android.annotation.SuppressLint
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

@SuppressLint("InvalidColorHexValue")
@Composable
fun SplashScreen(onSplashFinished: () -> Unit) {

    // These two values control the logo's fade-in and scale-up animation
    val scale = remember { Animatable(0.8f) }
    val alpha = remember { Animatable(0f) }

    // LaunchedEffect runs once when the screen first appears
    LaunchedEffect(key1 = true) {
        // Animate scale from 80% to 100%
        scale.animateTo(
            targetValue = 1f,
            animationSpec = tween(durationMillis = 700)
        )
    }

    LaunchedEffect(key1 = true) {
        // Animate opacity from invisible to fully visible
        alpha.animateTo(
            targetValue = 1f,
            animationSpec = tween(durationMillis = 700)
        )
        // Hold the splash screen for 2.5 seconds total, then move on
        delay(1800)
        onSplashFinished()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF999999), // white
                        Color(0xFFFFFFFF), // blue
                        Color(0xFF999999)  // near black
                    )
                )
            ),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Image(
            painter = painterResource(id = R.drawable.logo1),
            contentDescription = "CallBridge Logo",
            modifier = Modifier
                .scale(scale.value)
                .alpha(alpha.value)
                .padding(bottom = 16.dp)
        )

//        Text(
//            text = "",
//            color = Color.White,
//            fontSize = 28.sp,
//            fontWeight = FontWeight.SemiBold,
//            modifier = Modifier.alpha(alpha.value)
//        )
    }
}