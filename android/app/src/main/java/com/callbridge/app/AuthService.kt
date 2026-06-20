package com.callbridge.app

import io.appwrite.services.Account
import io.appwrite.models.User
import io.appwrite.ID

object AuthService {

    private val account = Account(AppwriteClient.client)

    // SIGN UP — creates a new user account
    suspend fun signUp(
        fullName: String,
        email: String,
        password: String
    ): Result<User<Map<String, Any>>> {
        return try {
            val user = account.create(
                userId = ID.unique(),
                email = email,
                password = password,
                name = fullName
            )
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // LOGIN — authenticates an existing user
    suspend fun login(
        email: String,
        password: String
    ): Result<Any> {
        return try {
            val session = account.createEmailPasswordSession(
                email = email,
                password = password
            )
            Result.success(session)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // GET CURRENT USER — returns the logged in user or null
    suspend fun getCurrentUser(): Result<User<Map<String, Any>>> {
        return try {
            val user = account.get()
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // LOGOUT — ends the current session
    suspend fun logout(): Result<Any> {
        return try {
            account.deleteSession(sessionId = "current")
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}