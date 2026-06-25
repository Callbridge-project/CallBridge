package com.callbridge.app

import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import kotlinx.coroutines.launch

// These are the route names — think of them like page URLs
object Routes {
    const val SPLASH = "splash"
    const val LOGIN = "login"
    const val DASHBOARD = "dashboard"
}

@Composable
fun AppNavigation() {
    // navController is the object that actually performs navigation
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = Routes.SPLASH  // app always starts here
    ) {

        composable(Routes.SPLASH) {
            val scope = rememberCoroutineScope()

            SplashScreen(
                onSplashFinished = {
                    scope.launch {
                        val currentUser = AuthService.getCurrentUser()
                        if (currentUser.isSuccess) {
                            // Session exists — go straight to dashboard
                            navController.navigate(Routes.DASHBOARD) {
                                popUpTo(Routes.SPLASH) { inclusive = true }
                            }
                        } else {
                            // No session — go to login
                            navController.navigate(Routes.LOGIN) {
                                popUpTo(Routes.SPLASH) { inclusive = true }
                            }
                        }
                    }
                }
            )
        }

        composable(Routes.LOGIN) {
            LoginScreen(
                onLoginSuccess = {
                    // When login succeeds, go to dashboard
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.DASHBOARD) {
            // Temporary placeholder until dashboard is built
            DashboardPlaceholder(
                onLogout = {
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(Routes.DASHBOARD) { inclusive = true }
                    }
                }
            )
        }
    }
}