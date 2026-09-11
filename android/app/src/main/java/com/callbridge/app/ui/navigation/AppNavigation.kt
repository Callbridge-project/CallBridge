package com.callbridge.app.ui.navigation

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.callbridge.app.ui.screens.LoginScreen
import com.callbridge.app.ui.screens.MainScreen
import com.callbridge.app.ui.screens.PermissionsGrantedScreen
import com.callbridge.app.ui.screens.PermissionsScreen
import com.callbridge.app.ui.screens.SplashScreen
import com.callbridge.app.ui.screens.TermsAndPrivacyScreen
import com.callbridge.app.auth.AuthService
import kotlinx.coroutines.launch

object Routes {
    const val SPLASH = "splash"
    const val LOGIN = "login"
    const val PERMISSIONS = "permissions"
    const val PERMISSIONS_GRANTED = "permissions_granted/{notificationsGranted}/{contactsGranted}"
    const val TERMS = "terms"
    const val DASHBOARD = "dashboard"

    fun permissionsGranted(notifications: Boolean, contacts: Boolean): String {
        return "permissions_granted/$notifications/$contacts"
    }
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    NavHost(
        navController = navController,
        startDestination = Routes.SPLASH
    ) {
        composable(Routes.SPLASH) {
            SplashScreen(
                onSplashFinished = {
                    scope.launch {
                        val currentUser = AuthService.getCurrentUser()
                        if (currentUser.isSuccess) {
                            navController.navigate(Routes.DASHBOARD) {
                                popUpTo(Routes.SPLASH) { inclusive = true }
                            }
                        } else {
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
                    val prefs = context.getSharedPreferences(
                        "callbridge_prefs", Context.MODE_PRIVATE
                    )
                    val permissionsShown = prefs.getBoolean("permissions_shown", false)
                    if (permissionsShown) {
                        navController.navigate(Routes.DASHBOARD) {
                            popUpTo(Routes.LOGIN) { inclusive = true }
                        }
                    } else {
                        navController.navigate(Routes.PERMISSIONS) {
                            popUpTo(Routes.LOGIN) { inclusive = true }
                        }
                    }
                }
            )
        }

        composable(Routes.PERMISSIONS) {
            PermissionsScreen(
                onPermissionsHandled = { notificationsGranted, contactsGranted ->
                    navController.navigate(
                        Routes.permissionsGranted(notificationsGranted, contactsGranted)
                    ) {
                        popUpTo(Routes.PERMISSIONS) { inclusive = true }
                    }
                },
                onTermsClick = {
                    navController.navigate(Routes.TERMS)
                }
            )
        }

        composable(
            route = Routes.PERMISSIONS_GRANTED,
            arguments = listOf(
                navArgument("notificationsGranted") { type = NavType.BoolType },
                navArgument("contactsGranted") { type = NavType.BoolType }
            )
        ) { backStackEntry ->
            val notificationsGranted = backStackEntry.arguments
                ?.getBoolean("notificationsGranted") ?: false
            val contactsGranted = backStackEntry.arguments
                ?.getBoolean("contactsGranted") ?: false

            PermissionsGrantedScreen(
                notificationsGranted = notificationsGranted,
                contactsGranted = contactsGranted,
                onGoToDashboard = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(Routes.PERMISSIONS_GRANTED) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.TERMS) {
            TermsAndPrivacyScreen(
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        composable(Routes.DASHBOARD) {
            MainScreen(
                onLogout = {
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(Routes.DASHBOARD) { inclusive = true }
                    }
                }
            )
        }
    }
}