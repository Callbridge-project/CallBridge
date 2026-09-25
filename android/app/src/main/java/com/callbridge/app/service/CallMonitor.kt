package com.callbridge.app.service

import android.content.Context
import android.database.ContentObserver
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.CallLog
import android.util.Log

import com.callbridge.app.data.local.CallLogRepository
import com.callbridge.app.data.remote.AppwriteSyncService
import com.callbridge.app.utils.ContactResolver
import com.callbridge.app.utils.PermissionManager

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

import java.time.Instant

class CallMonitor(
    private val context: Context,
    private val userId: String
) {

    companion object {
        private const val TAG = "CallBridge"

        /*
         * We keep the last processed Android Call Log ID so that
         * the same call is not inserted into Room more than once.
         */
        private const val PREFS_NAME = "callbridge_call_monitor"

        /*
         * Small delay gives the Android Call Log provider time
         * to finish writing the new call entry before we query it.
         */
        private const val PROCESS_DELAY_MS = 700L
    }

    private val repository = CallLogRepository(context)

    private val scope =
        CoroutineScope(SupervisorJob() + Dispatchers.IO)

    /*
     * Android can send multiple ContentObserver callbacks for
     * one call-log change.
     *
     * Mutex guarantees that only one processing operation runs
     * at a time.
     */
    private val processingMutex = Mutex()

    private val preferences =
        context.getSharedPreferences(
            PREFS_NAME,
            Context.MODE_PRIVATE
        )

    private val lastProcessedKey =
        "last_processed_call_id_$userId"

    private val baselineKey =
        "baseline_initialized_$userId"

    private var lastProcessedCallId: Long =
        preferences.getLong(
            lastProcessedKey,
            -1L
        )

    private var isStarted = false

    private val observerHandler =
        Handler(Looper.getMainLooper())

    /**
     * Watches Android's system Call Log.
     */
    private val callLogObserver =
        object : ContentObserver(observerHandler) {

            override fun onChange(
                selfChange: Boolean,
                uri: Uri?
            ) {

                super.onChange(selfChange, uri)

                Log.d(
                    TAG,
                    "CallMonitor: Call Log changed -> $uri"
                )

                scope.launch {
                    processNewCallLogs()
                }
            }
        }

    /**
     * Start monitoring the Android Call Log.
     */
    fun startListening() {

        if (isStarted) {
            Log.d(
                TAG,
                "CallMonitor: already running"
            )
            return
        }

        /*
         * Call Log access is required because this implementation
         * reads completed call records from Android.
         */
        if (!PermissionManager.hasCallPermissions(context)) {

            Log.e(
                TAG,
                "CallMonitor: READ_PHONE_STATE / READ_CALL_LOG permission missing"
            )

            return
        }

        /*
         * IMPORTANT:
         *
         * On first installation for this user, establish a baseline.
         *
         * Otherwise, the first time CallBridge starts it could upload
         * old calls that were already present on the phone before
         * CallBridge started monitoring.
         */
        if (!preferences.getBoolean(baselineKey, false)) {

            val latestCallId = getLatestCallId()

            lastProcessedCallId =
                latestCallId ?: -1L

            preferences.edit()
                .putLong(
                    lastProcessedKey,
                    lastProcessedCallId
                )
                .putBoolean(
                    baselineKey,
                    true
                )
                .apply()

            Log.d(
                TAG,
                "CallMonitor: baseline initialized at call ID $lastProcessedCallId"
            )
        }

        try {

            context.contentResolver.registerContentObserver(
                CallLog.Calls.CONTENT_URI,
                true,
                callLogObserver
            )

            isStarted = true

            Log.d(
                TAG,
                "CallMonitor: started successfully"
            )

            Log.d(
                TAG,
                "CallMonitor: monitoring Android Call Log"
            )

            Log.d(
                TAG,
                "CallMonitor: userId=$userId"
            )

        } catch (e: SecurityException) {

            Log.e(
                TAG,
                "CallMonitor: SecurityException registering Call Log observer — ${e.message}",
                e
            )

        } catch (e: Exception) {

            Log.e(
                TAG,
                "CallMonitor: failed to start — ${e.message}",
                e
            )
        }
    }

    /**
     * Stop monitoring the Call Log.
     */
    fun stopListening() {

        if (!isStarted) {
            return
        }

        try {

            context.contentResolver.unregisterContentObserver(
                callLogObserver
            )

            isStarted = false

            Log.d(
                TAG,
                "CallMonitor: stopped successfully"
            )

        } catch (e: Exception) {

            Log.e(
                TAG,
                "CallMonitor: error stopping observer — ${e.message}",
                e
            )
        }
    }

    /**
     * Gets the most recent Call Log ID.
     *
     * This is used only to establish the initial baseline.
     */
    private fun getLatestCallId(): Long? {

        if (!PermissionManager.hasCallPermissions(context)) {
            return null
        }

        return try {

            val uri = CallLog.Calls.CONTENT_URI
                .buildUpon()
                .appendQueryParameter(
                    CallLog.Calls.LIMIT_PARAM_KEY,
                    "1"
                )
                .build()

            val cursor = context.contentResolver.query(
                uri,
                arrayOf(
                    CallLog.Calls._ID
                ),
                null,
                null,
                "${CallLog.Calls._ID} DESC"
            )

            cursor?.use {

                if (it.moveToFirst()) {

                    it.getLong(
                        it.getColumnIndexOrThrow(
                            CallLog.Calls._ID
                        )
                    )

                } else {
                    null
                }
            }

        } catch (e: Exception) {

            Log.e(
                TAG,
                "CallMonitor: error getting latest call ID — ${e.message}",
                e
            )

            null
        }
    }

    /**
     * Finds and processes new Call Log records.
     */
    private suspend fun processNewCallLogs() {

        processingMutex.withLock {

            try {

                /*
                 * Give Android a moment to finish writing
                 * the call record.
                 */
                delay(PROCESS_DELAY_MS)

                if (!PermissionManager.hasCallPermissions(context)) {

                    Log.e(
                        TAG,
                        "CallMonitor: permissions lost while processing"
                    )

                    return
                }

                /*
                 * Fetch calls newer than our last processed ID.
                 *
                 * We use the provider's LIMIT parameter rather than
                 * putting LIMIT directly into the SQL sort expression.
                 */
                val uri = CallLog.Calls.CONTENT_URI
                    .buildUpon()
                    .appendQueryParameter(
                        CallLog.Calls.LIMIT_PARAM_KEY,
                        "20"
                    )
                    .build()

                val cursor = context.contentResolver.query(
                    uri,
                    arrayOf(
                        CallLog.Calls._ID,
                        CallLog.Calls.NUMBER,
                        CallLog.Calls.TYPE,
                        CallLog.Calls.DATE,
                        CallLog.Calls.DURATION,
                        CallLog.Calls.PHONE_ACCOUNT_ID,
                        CallLog.Calls.PHONE_ACCOUNT_COMPONENT_NAME
                    ),
                    "${CallLog.Calls._ID} > ?",
                    arrayOf(
                        lastProcessedCallId.toString()
                    ),
                    "${CallLog.Calls._ID} ASC"
                )

                cursor?.use {

                    if (!it.moveToFirst()) {

                        Log.d(
                            TAG,
                            "CallMonitor: no new calls found"
                        )

                        return
                    }

                    do {

                        val callId =
                            it.getLong(
                                it.getColumnIndexOrThrow(
                                    CallLog.Calls._ID
                                )
                            )

                        val number =
                            it.getString(
                                it.getColumnIndexOrThrow(
                                    CallLog.Calls.NUMBER
                                )
                            ) ?: ""

                        val type =
                            it.getInt(
                                it.getColumnIndexOrThrow(
                                    CallLog.Calls.TYPE
                                )
                            )

                        val dateMillis =
                            it.getLong(
                                it.getColumnIndexOrThrow(
                                    CallLog.Calls.DATE
                                )
                            )

                        val duration =
                            it.getLong(
                                it.getColumnIndexOrThrow(
                                    CallLog.Calls.DURATION
                                )
                            )

                        val phoneAccountId =
                            try {
                                it.getString(
                                    it.getColumnIndexOrThrow(
                                        CallLog.Calls.PHONE_ACCOUNT_ID
                                    )
                                )
                            } catch (_: Exception) {
                                null
                            }

                        val phoneAccountComponent =
                            try {
                                it.getString(
                                    it.getColumnIndexOrThrow(
                                        CallLog.Calls.PHONE_ACCOUNT_COMPONENT_NAME
                                    )
                                )
                            } catch (_: Exception) {
                                null
                            }

                        Log.d(
                            TAG,
                            "CallMonitor: new Call Log ID=$callId"
                        )

                        Log.d(
                            TAG,
                            "CallMonitor: number=$number"
                        )

                        Log.d(
                            TAG,
                            "CallMonitor: type=$type"
                        )

                        Log.d(
                            TAG,
                            "CallMonitor: duration=${duration}s"
                        )

                        Log.d(
                            TAG,
                            "CallMonitor: phoneAccountId=$phoneAccountId"
                        )

                        Log.d(
                            TAG,
                            "CallMonitor: phoneAccountComponent=$phoneAccountComponent"
                        )

                        /*
                         * Convert Android call type into the
                         * CallBridge database value.
                         */
                        val logType = when (type) {

                            CallLog.Calls.INCOMING_TYPE -> {
                                "incoming_call"
                            }

                            CallLog.Calls.MISSED_TYPE -> {
                                "missed_call"
                            }

                            CallLog.Calls.OUTGOING_TYPE -> {
                                "outgoing_call"
                            }

                            else -> {

                                Log.d(
                                    TAG,
                                    "CallMonitor: unsupported Call Log type $type — skipping"
                                )

                                /*
                                 * We still advance the processed ID
                                 * because this is not a call type that
                                 * CallBridge currently stores.
                                 */
                                lastProcessedCallId = callId

                                preferences.edit()
                                    .putLong(
                                        lastProcessedKey,
                                        lastProcessedCallId
                                    )
                                    .apply()

                                continue
                            }
                        }

                        val timestamp =
                            try {
                                Instant
                                    .ofEpochMilli(dateMillis)
                                    .toString()
                            } catch (_: Exception) {
                                Instant.now().toString()
                            }

                        val contactName =
                            if (number.isNotBlank()) {
                                try {
                                    ContactResolver.getContactName(
                                        context,
                                        number
                                    )
                                } catch (e: Exception) {

                                    Log.e(
                                        TAG,
                                        "CallMonitor: contact lookup failed — ${e.message}"
                                    )

                                    null
                                }
                            } else {
                                null
                            }

                        Log.d(
                            TAG,
                            "CallMonitor: detected $logType"
                        )

                        Log.d(
                            TAG,
                            "CallMonitor: contact=${contactName ?: "Unknown"}"
                        )

                        /*
                         * Save locally first.
                         *
                         * This keeps Room as the local source of truth
                         * if internet/Appwrite is temporarily unavailable.
                         */
                        repository.saveCallLog(
                            userId = userId,
                            phoneNumber = number,
                            contactName = contactName,
                            logType = logType,
                            timestamp = timestamp
                        )

                        Log.d(
                            TAG,
                            "CallMonitor: $logType saved to Room"
                        )

                        /*
                         * Immediately attempt synchronization.
                         */
                        AppwriteSyncService.syncPendingCallLogs(
                            context
                        )

                        Log.d(
                            TAG,
                            "CallMonitor: sync requested"
                        )

                        /*
                         * Only mark this Call Log ID as processed
                         * after it has successfully been saved locally.
                         */
                        lastProcessedCallId = callId

                        preferences.edit()
                            .putLong(
                                lastProcessedKey,
                                lastProcessedCallId
                            )
                            .apply()

                    } while (it.moveToNext())
                }

            } catch (e: SecurityException) {

                Log.e(
                    TAG,
                    "CallMonitor: SecurityException reading Call Log — ${e.message}",
                    e
                )

            } catch (e: Exception) {

                Log.e(
                    TAG,
                    "CallMonitor: error processing Call Log — ${e.message}",
                    e
                )
            }
        }
    }
}