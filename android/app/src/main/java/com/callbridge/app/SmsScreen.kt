package com.callbridge.app

import android.content.Context
import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun SmsScreen() {

    val context = LocalContext.current
    val focusManager = LocalFocusManager.current
    val searchFocusRequester = remember { FocusRequester() }

    // ── Colors ────────────────────────────────────────────────────
    val primaryBlue = Color(0xFF4A90D9)
    val deepBlue = Color(0xFF1A3A6B)
    val brightBlue = Color(0xFF3B82F6)
    val nearBlack = Color(0xFF0A0A1A)
    val mutedText = Color(0xFF6B7A99)
    val cardBorder = Color(0xFFE0E7F0)
    val screenBg = Color(0xFFF2F4F7)
    val white = Color.White
    val unreadBlue = Color(0xFF4A90D9)
    val readGray = Color(0xFFA0AABD)

    // ── State ─────────────────────────────────────────────────────
    var selectedTab by remember { mutableStateOf("all") }
    var allSms by remember { mutableStateOf<List<SmsLogEntity>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var searchExpanded by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }

    // ── Load from Room ────────────────────────────────────────────
    LaunchedEffect(Unit) {
        try {
            val prefs = context.getSharedPreferences("callbridge_prefs", Context.MODE_PRIVATE)
            val userId = prefs.getString("current_user_id", "") ?: ""
            if (userId.isNotEmpty()) {
                val repo = SmsLogRepository(context)
                allSms = repo.getLogsForUser(userId)
            }
        } catch (e: Exception) {
            android.util.Log.e("CallBridge", "SmsScreen load error: ${e.message}")
        } finally {
            isLoading = false
        }
    }

    // ── Filter by tab then by search query ────────────────────────
    val filteredSms = remember(selectedTab, allSms, searchQuery) {
        val tabFiltered = when (selectedTab) {
            "unread" -> allSms.filter { !it.isRead }
            else -> allSms
        }
        if (searchQuery.isBlank()) {
            tabFiltered
        } else {
            val q = searchQuery.lowercase().trim()
            tabFiltered.filter { sms ->
                sms.phoneNumber.contains(q) ||
                        (sms.contactName?.lowercase()?.contains(q) == true) ||
                        (sms.messageBody?.lowercase()?.contains(q) == true)
            }
        }
    }

    // ── Group by day ──────────────────────────────────────────────
    val groupedSms = remember(filteredSms) {
        groupSmsByDay(filteredSms)
    }

    val totalCount = filteredSms.size
    val unreadCount = allSms.count { !it.isRead }
    val summaryLabel = if (selectedTab == "unread") "UNREAD MESSAGES" else "MESSAGES TODAY"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(screenBg)
    ) {

        // ── Top App Bar ───────────────────────────────────────────
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(screenBg)
                .padding(top = 16.dp, start = 16.dp, end = 16.dp, bottom = 8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {

                Text(
                    text = "SMS Messages",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = nearBlack,
                    modifier = Modifier.weight(1f),
                    textAlign = TextAlign.Center
                )

                // Search icon button
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(if (searchExpanded) Color(0xFFEEF4FF) else white)
                        .border(
                            1.dp,
                            if (searchExpanded) primaryBlue else cardBorder,
                            CircleShape
                        )
                        .clickable {
                            searchExpanded = !searchExpanded
                            if (!searchExpanded) {
                                searchQuery = ""
                                focusManager.clearFocus()
                            }
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(
                            id = R.drawable.search
                        ),
                        contentDescription = "Search",
                        tint = if (searchExpanded) primaryBlue else nearBlack,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            // ── Expandable search bar ─────────────────────────────
            AnimatedVisibility(
                visible = searchExpanded,
                enter = expandVertically(animationSpec = tween(250)) +
                        fadeIn(animationSpec = tween(250)),
                exit = shrinkVertically(animationSpec = tween(200)) +
                        fadeOut(animationSpec = tween(200))
            ) {
                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = {
                        Text(
                            text = "Search by name, number or message...",
                            fontSize = 13.sp,
                            color = mutedText
                        )
                    },
                    leadingIcon = {
                        Icon(
                            painter = painterResource(
                                id = android.R.drawable.ic_menu_search
                            ),
                            contentDescription = null,
                            tint = mutedText,
                            modifier = Modifier.size(18.dp)
                        )
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            Icon(
                                painter = painterResource(
                                    id = android.R.drawable.ic_menu_close_clear_cancel
                                ),
                                contentDescription = "Clear",
                                tint = mutedText,
                                modifier = Modifier
                                    .size(18.dp)
                                    .clickable { searchQuery = "" }
                            )
                        }
                    },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .focusRequester(searchFocusRequester),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = primaryBlue,
                        unfocusedBorderColor = cardBorder,
                        focusedContainerColor = white,
                        unfocusedContainerColor = white
                    ),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(
                        onSearch = { focusManager.clearFocus() }
                    )
                )

                // Auto-focus when search expands
                LaunchedEffect(searchExpanded) {
                    if (searchExpanded) {
                        searchFocusRequester.requestFocus()
                    }
                }
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp)
        ) {

            Spacer(modifier = Modifier.height(8.dp))

            // ── Filter Tabs ───────────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(white)
                    .border(1.dp, cardBorder, RoundedCornerShape(14.dp))
                    .padding(3.dp)
            ) {
                Row(modifier = Modifier.fillMaxWidth()) {
                    listOf("all" to "All Messages", "unread" to "Unread").forEach { (tab, label) ->
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(
                                    if (selectedTab == tab) white else Color.Transparent
                                )
                                .then(
                                    if (selectedTab == tab) Modifier.shadow(
                                        80.dp, RoundedCornerShape(10.dp)
                                    ) else Modifier
                                )
                                .clickable { selectedTab = tab }
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = label,
                                    fontSize = 14.sp,
                                    fontWeight = if (selectedTab == tab) FontWeight.SemiBold
                                    else FontWeight.Normal,
                                    color = if (selectedTab == tab) primaryBlue else mutedText
                                )
                                // Unread badge count
                                if (tab == "unread" && unreadCount > 0) {
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Box(
                                        modifier = Modifier
                                            .clip(CircleShape)
                                            .background(primaryBlue)
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = unreadCount.toString(),
                                            fontSize = 10.sp,
                                            color = white,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // ── SMS Summary Card ──────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(white)
                    .border(1.dp, cardBorder, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFEEF4FF)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(
                                id = R.drawable.unreadsms
                            ),
                            contentDescription = null,
                            tint = brightBlue,
                            modifier = Modifier.size(22.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = summaryLabel,
                            fontSize = 11.sp,
                            color = mutedText,
                            letterSpacing = 0.5.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "SMS Summary",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = nearBlack
                        )
                    }

                    Text(
                        text = totalCount.toString(),
                        fontSize = 36.sp,
                        fontWeight = FontWeight.Bold,
                        color = nearBlack
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── Content ───────────────────────────────────────────
            if (isLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = primaryBlue, strokeWidth = 2.dp)
                }
            } else if (filteredSms.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFEEF4FF)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(
                                    id = R.drawable.unreadsms
                                ),
                                contentDescription = null,
                                tint = mutedText,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = when {
                                searchQuery.isNotEmpty() -> "No results for \"$searchQuery\""
                                selectedTab == "unread" -> "No unread messages"
                                else -> "No messages recorded yet"
                            },
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = nearBlack,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = if (searchQuery.isNotEmpty())
                                "Try a different name, number or keyword"
                            else
                                "SMS messages will appear here once detected",
                            fontSize = 13.sp,
                            color = mutedText,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            } else {
                groupedSms.forEach { (dayLabel, messages) ->

                    // Day header
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = dayLabel.uppercase(),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = nearBlack,
                            letterSpacing = 0.8.sp
                        )
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(primaryBlue)
                        )
                    }

                    // SMS cards
                    messages.forEach { sms ->
                        val isUnread = !sms.isRead
                        val isSent = sms.logType == "sms_sent"

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 10.dp)
                                .shadow(
                                    elevation = 2.dp,
                                    shape = RoundedCornerShape(16.dp),
                                    ambientColor = Color.Black.copy(alpha = 0.06f),
                                    spotColor = Color.Black.copy(alpha = 0.04f)
                                )
                                .clip(RoundedCornerShape(16.dp))
                                .background(white)
                                .padding(14.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // SMS icon badge with unread dot
                                Box(modifier = Modifier.size(48.dp)) {
                                    Box(
                                        modifier = Modifier
                                            .size(46.dp)
                                            .clip(CircleShape)
                                            .background(
                                                if (isUnread) Color(0xFFEEF4FF)
                                                else Color(0xFFF5F7FA)
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            painter = painterResource(
                                                id = R.drawable.readsms
                                            ),
                                            contentDescription = null,
                                            tint = if (isUnread) brightBlue else mutedText,
                                            modifier = Modifier.size(22.dp)
                                        )
                                    }
                                    // Unread indicator dot
                                    if (isUnread) {
                                        Box(
                                            modifier = Modifier
                                                .size(10.dp)
                                                .clip(CircleShape)
                                                .background(primaryBlue)
                                                .border(2.dp, white, CircleShape)
                                                .align(Alignment.TopEnd)
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.width(12.dp))

                                // Name and preview
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = sms.contactName ?: sms.phoneNumber,
                                        fontSize = 15.sp,
                                        fontWeight = if (isUnread) FontWeight.Bold
                                        else FontWeight.SemiBold,
                                        color = nearBlack,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Spacer(modifier = Modifier.height(3.dp))
                                    Text(
                                        text = if (isSent) "You: ${sms.messageBody ?: ""}"
                                        else sms.messageBody ?: "",
                                        fontSize = 13.sp,
                                        color = mutedText,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }

                                Spacer(modifier = Modifier.width(8.dp))

                                // Time and read status
                                Column(horizontalAlignment = Alignment.End) {
                                    Text(
                                        text = formatSmsTime(sms.timestamp),
                                        fontSize = 12.sp,
                                        color = if (isUnread) primaryBlue else nearBlack,
                                        fontWeight = if (isUnread) FontWeight.Medium
                                        else FontWeight.Normal
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = if (isUnread) "UNREAD" else "READ",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isUnread) unreadBlue else readGray,
                                        letterSpacing = 0.5.sp
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

// ── Group SMS by day ──────────────────────────────────────────────
fun groupSmsByDay(smsList: List<SmsLogEntity>): List<Pair<String, List<SmsLogEntity>>> {
    val today = Calendar.getInstance()
    val yesterday = Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, -1) }
    val grouped = LinkedHashMap<String, MutableList<SmsLogEntity>>()

    smsList.forEach { sms ->
        val label = try {
            val instant = java.time.Instant.parse(sms.timestamp)
            val cal = Calendar.getInstance().apply { time = Date.from(instant) }
            when {
                isSameDay(cal, today) -> "Today"
                isSameDay(cal, yesterday) -> "Yesterday"
                else -> SimpleDateFormat("MMMM d, yyyy", Locale.getDefault())
                    .format(Date.from(instant))
            }
        } catch (e: Exception) { "Unknown" }

        grouped.getOrPut(label) { mutableListOf() }.add(sms)
    }

    return grouped.map { (label, list) -> label to list }
}

fun formatSmsTime(isoTimestamp: String): String {
    return try {
        val instant = java.time.Instant.parse(isoTimestamp)
        val cal = Calendar.getInstance().apply { time = Date.from(instant) }
        val today = Calendar.getInstance()
        val yesterday = Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, -1) }
        when {
            isSameDay(cal, today) ->
                SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date.from(instant))
            isSameDay(cal, yesterday) -> "Yesterday"
            else -> SimpleDateFormat("MMM d", Locale.getDefault()).format(Date.from(instant))
        }
    } catch (e: Exception) { "" }
}