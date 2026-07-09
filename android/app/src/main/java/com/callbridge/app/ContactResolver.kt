package com.callbridge.app

import android.content.Context
import android.provider.ContactsContract
import android.util.Log

object ContactResolver {

    // Takes a phone number and returns the contact name if found
    // Returns null if the number is not saved in contacts
    fun getContactName(context: Context, phoneNumber: String): String? {
        if (!PermissionManager.hasContactsPermission(context)) {
            Log.d("CallBridge", "ContactResolver: READ_CONTACTS not granted")
            return null
        }

        return try {
            val uri = android.net.Uri.withAppendedPath(
                ContactsContract.PhoneLookup.CONTENT_FILTER_URI,
                android.net.Uri.encode(phoneNumber)
            )

            val cursor = context.contentResolver.query(
                uri,
                arrayOf(ContactsContract.PhoneLookup.DISPLAY_NAME),
                null, null, null
            )

            cursor?.use {
                if (it.moveToFirst()) {
                    it.getString(it.getColumnIndexOrThrow(
                        ContactsContract.PhoneLookup.DISPLAY_NAME
                    ))
                } else null
            }
        } catch (e: Exception) {
            Log.e("CallBridge", "ContactResolver: error — ${e.message}")
            null
        }
    }
}