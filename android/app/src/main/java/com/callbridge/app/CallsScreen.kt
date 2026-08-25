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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun CallsScreen() {

    val context = LocalContext.current

    // ── Colors ────────────────────────────────────────────────────
    val primaryBlue = Color(0xFF4A90D9)
    val deepBlue = Color(0xFF1A3A6B)
    val brightBlue = Color(0xFF3B82F6)
    val nearBlack = Color(0xFF0A0A1A)
    val mutedText = Color(0xFF6B7A99)
    val cardBorder = Color(0xFFE0E7F0)
    val screenBg = Color(0xFFF2F4F7)
    val white = Color.White
    val missedRed = Color(0xFFE53935)
    val answeredGreen = Color(0xFF10B981)
    val missedBg = Color(0xFFFFEBEE)
    val answeredBg = Color(0xFFF0FDF4)

    // ── State ─────────────────────────────────────────────────────
    var selectedTab by remember { mutableStateOf("all") } // "all" or "missed"
    var allCalls by remember { mutableStateOf<List<CallLogEntity>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var searchExpanded by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    val searchFocusRequester = remember { FocusRequester() }
    val focusManager = LocalFocusManager.current

    // ── Load from Room ────────────────────────────────────────────
    LaunchedEffect(Unit) {
        try {
            val prefs = context.getSharedPreferences("callbridge_prefs", Context.MODE_PRIVATE)
            val userId = prefs.getString("current_user_id", "") ?: ""
            if (userId.isNotEmpty()) {
                val repo = CallLogRepository(context)
                allCalls = repo.getLogsForUser(userId)
            }
        } catch (e: Exception) {
            android.util.Log.e("CallBridge", "CallsScreen load error: ${e.message}")
        } finally {
            isLoading = false
        }
    }

    // ── Filter based on selected tab ──────────────────────────────
    val displayedCalls = remember(selectedTab, allCalls, searchQuery) {
        val tabFiltered = when (selectedTab) {
            "missed" -> allCalls.filter { it.logType == "missed_call" }
            else -> allCalls
        }
        if (searchQuery.isBlank()) {
            tabFiltered
        } else {
            val q = searchQuery.lowercase().trim()
            tabFiltered.filter { call ->
                call.phoneNumber.contains(q) ||
                        (call.contactName?.lowercase()?.contains(q) == true)
            }
        }
    }

    // ── Group by day ──────────────────────────────────────────────
    val groupedCalls = remember(displayedCalls) {
        groupCallsByDay(displayedCalls)
    }

    // ── Counts ────────────────────────────────────────────────────
    val totalCount = displayedCalls.size
    val summaryLabel = if (selectedTab == "missed") "TOTAL MISSED CALLS" else "TOTAL CALLS TODAY"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(screenBg)
    ) {

        // ── Top App Bar with Search ───────────────────────────────────
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
                    text = "Calls",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = nearBlack,
                    modifier = Modifier.weight(1f),
                    textAlign = TextAlign.Center
                )

                // Search icon
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
                        painter = painterResource(id = R.drawable.search),
                        contentDescription = "Search",
                        tint = if (searchExpanded) primaryBlue else nearBlack,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            // Expandable search bar
            AnimatedVisibility(
                visible = searchExpanded,
                enter = expandVertically(animationSpec = tween(250)) + fadeIn(animationSpec = tween(250)),
                exit = shrinkVertically(animationSpec = tween(200)) + fadeOut(animationSpec = tween(200))
            ) {
                Column {
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = {
                            Text(
                                "Search by name or number...",
                                fontSize = 13.sp,
                                color = mutedText
                            )
                        },
                        leadingIcon = {
                            Icon(
                                painter = painterResource(id = android.R.drawable.ic_menu_search),
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
                        keyboardActions = KeyboardActions(onSearch = { focusManager.clearFocus() })
                    )
                    LaunchedEffect(searchExpanded) {
                        if (searchExpanded) searchFocusRequester.requestFocus()
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
            Spacer(modifier = Modifier.height(12.dp))

            // ── Filter Tab Row ────────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(white)
                    .border(1.dp, cardBorder, RoundedCornerShape(14.dp))
                    .padding(3.dp)
            ) {
                Row(modifier = Modifier.fillMaxWidth()) {
                    // All Calls tab
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(
                                if (selectedTab == "all") white else Color.Transparent
                            )
                            .then(
                                if (selectedTab == "all") Modifier.shadow(
                                    80.dp, RoundedCornerShape(10.dp)
                                ) else Modifier
                            )
                            .clickable { selectedTab = "all" }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "All Calls",
                            fontSize = 14.sp,
                            fontWeight = if (selectedTab == "all") FontWeight.SemiBold
                            else FontWeight.Normal,
                            color = if (selectedTab == "all") primaryBlue else mutedText
                        )
                    }

                    // Missed tab
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(
                                if (selectedTab == "missed") white else Color.Transparent
                            )
                            .then(
                                if (selectedTab == "missed") Modifier.shadow(
                                    80.dp, RoundedCornerShape(10.dp)
                                ) else Modifier
                            )
                            .clickable { selectedTab = "missed" }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Missed",
                            fontSize = 14.sp,
                            fontWeight = if (selectedTab == "missed") FontWeight.SemiBold
                            else FontWeight.Normal,
                            color = if (selectedTab == "missed") primaryBlue else mutedText
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // ── Call Summary Card ─────────────────────────────────
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
                    // Icon badge
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFEEF4FF)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.main),
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
                            text = "Call Summary",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = nearBlack
                        )
                    }

                    // Large count number on right
                    Text(
                        text = totalCount.toString(),
                        fontSize = 36.sp,
                        fontWeight = FontWeight.Bold,
                        color = nearBlack
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── Loading state ─────────────────────────────────────
            if (isLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = primaryBlue, strokeWidth = 2.dp)
                }
            } else if (displayedCalls.isEmpty()) {
                // ── Empty state ───────────────────────────────────
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
                                    id = android.R.drawable.ic_menu_call
                                ),
                                contentDescription = null,
                                tint = mutedText,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                        Text(
                            text = when {
                                searchQuery.isNotEmpty() -> "No results for \"$searchQuery\""
                                selectedTab == "missed" -> "No missed calls yet"
                                else -> "No calls recorded yet"
                            },
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = nearBlack,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Calls will appear here once detected",
                            fontSize = 13.sp,
                            color = mutedText,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            } else {
                // ── Grouped call list ─────────────────────────────
                groupedCalls.forEach { (dayLabel, calls) ->

                    // Day header row
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
                        // Blue dot indicator
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(primaryBlue)
                        )
                    }

                    // Call cards for this day
                    calls.forEach { call ->
                        val isMissed = call.logType == "missed_call"

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
                                // Call type icon circle
                                Box(
                                    modifier = Modifier
                                        .size(46.dp)
                                        .clip(CircleShape)
                                        .background(
                                            if (isMissed) missedBg else answeredBg
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        painter = painterResource(
                                            id = if (isMissed) R.drawable.missedcall else R.drawable.answeredcall
                                        ),
                                        contentDescription = if (isMissed) "Missed Call" else "Answered Call",
                                        tint = if (isMissed) missedRed else answeredGreen,
                                        modifier = Modifier.size(22.dp)
                                    )
                                }

                                Spacer(modifier = Modifier.width(12.dp))

                                // Contact name and number
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = call.contactName ?: "Unknown",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = nearBlack
                                    )
                                    Spacer(modifier = Modifier.height(3.dp))
                                    Text(
                                        text = call.phoneNumber.ifEmpty { "Hidden ID" },
                                        fontSize = 13.sp,
                                        color = mutedText
                                    )
                                }

                                // Time and status
                                Column(horizontalAlignment = Alignment.End) {
                                    Text(
                                        text = formatCallTime(call.timestamp),
                                        fontSize = 13.sp,
                                        color = nearBlack,
                                        fontWeight = FontWeight.Medium
                                    )
                                    Spacer(modifier = Modifier.height(3.dp))
                                    Text(
                                        text = if (isMissed) "Missed" else "Answered",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = if (isMissed) missedRed else answeredGreen
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

// ── Group calls by day label ──────────────────────────────────────
fun groupCallsByDay(calls: List<CallLogEntity>): List<Pair<String, List<CallLogEntity>>> {
    val today = Calendar.getInstance()
    val yesterday = Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, -1) }

    val grouped = LinkedHashMap<String, MutableList<CallLogEntity>>()

    calls.forEach { call ->
        val label = try {
            val instant = java.time.Instant.parse(call.timestamp)
            val callCal = Calendar.getInstance().apply {
                time = Date.from(instant)
            }
            when {
                isSameDay(callCal, today) -> "Today"
                isSameDay(callCal, yesterday) -> "Yesterday"
                else -> SimpleDateFormat("MMMM d, yyyy", Locale.getDefault())
                    .format(Date.from(instant))
            }
        } catch (e: Exception) {
            "Unknown"
        }

        grouped.getOrPut(label) { mutableListOf() }.add(call)
    }

    return grouped.map { (label, list) -> label to list }
}

fun isSameDay(cal1: Calendar, cal2: Calendar): Boolean {
    return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
            cal1.get(Calendar.DAY_OF_YEAR) == cal2.get(Calendar.DAY_OF_YEAR)
}

fun formatCallTime(isoTimestamp: String): String {
    return try {
        val instant = java.time.Instant.parse(isoTimestamp)
        val callCal = Calendar.getInstance().apply { time = Date.from(instant) }
        val today = Calendar.getInstance()
        val yesterday = Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, -1) }

        val timeSdf = SimpleDateFormat("hh:mm a", Locale.getDefault())
        when {
            isSameDay(callCal, today) -> timeSdf.format(Date.from(instant))
            isSameDay(callCal, yesterday) -> "Yesterday"
            else -> SimpleDateFormat("MMM d", Locale.getDefault()).format(Date.from(instant))
        }
    } catch (e: Exception) { "" }
}