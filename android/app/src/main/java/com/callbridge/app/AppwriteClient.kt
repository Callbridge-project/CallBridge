package com.callbridge.app

import android.content.Context
import io.appwrite.Client
import io.appwrite.services.Account
import io.appwrite.services.Databases


object AppwriteClient {

    private lateinit var client: Client
    lateinit var databases: Databases
    lateinit var account: Account

    fun initialize(context: Context) {
        client = Client(context)
            .setEndpoint(BuildConfig.APPWRITE_ENDPOINT)
            .setProject(BuildConfig.APPWRITE_PROJECT_ID)

        databases = Databases(client)
        account = Account(client)
    }
}
