/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CallBridge · Mock Fixture Data
 * ─────────────────────────────────────────────────────────────────────────────
 * This file provides realistic mock data for all Appwrite collections.
 * It is used ONLY when VITE_USE_MOCK_DATA=true in your .env file.
 *
 * HOW TO REMOVE MOCK MODE (when Appwrite is ready):
 *   1. Delete this file (mockData.ts)
 *   2. Delete src/lib/mockDatabase.ts
 *   3. Revert the one-line branch at the bottom of src/lib/appwrite.ts
 *   4. Remove VITE_USE_MOCK_DATA from .env
 *   → Zero page-level changes needed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Stable mock user ID used across all fixtures
export const MOCK_USER_ID = "mock_user_abc123";
export const MOCK_USER_NAME = "Kwasi Appiah";
export const MOCK_USER_EMAIL = "kwasi@callbridge.io";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns an ISO timestamp N minutes ago */
const minsAgo = (n: number) => new Date(Date.now() - n * 60 * 1000).toISOString();
/** Returns an ISO timestamp N hours ago */
const hoursAgo = (n: number) => new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
/** Returns an ISO timestamp N days ago */
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

// ─── Devices ─────────────────────────────────────────────────────────────────

export const MOCK_DEVICES = [
  {
    $id: "device_001",
    $createdAt: daysAgo(30),
    $updatedAt: minsAgo(12),
    user_id: MOCK_USER_ID,
    device_name: "Samsung Galaxy S24 Ultra",
    android_version: "14",
    app_version: "2.4.1",
    monitoring_status: "active",
    notification_permission: "granted",
    battery_optimization_disabled: true,
    last_sync: minsAgo(12),
    registered_at: daysAgo(30),
  },
  {
    $id: "device_002",
    $createdAt: daysAgo(14),
    $updatedAt: hoursAgo(6),
    user_id: MOCK_USER_ID,
    device_name: "Google Pixel 8 Pro",
    android_version: "15",
    app_version: "2.4.1",
    monitoring_status: "paused",
    notification_permission: "granted",
    battery_optimization_disabled: false,
    last_sync: hoursAgo(6),
    registered_at: daysAgo(14),
  },
];

// ─── Call Logs ────────────────────────────────────────────────────────────────

const callContacts = [
  { contact_name: "Ama Owusu", phone_number: "+233 24 456 7890", device_name: "Samsung Galaxy S24 Ultra", device_id: "device_001" },
  { contact_name: "Kofi Mensah", phone_number: "+233 55 234 5678", device_name: "Google Pixel 8 Pro", device_id: "device_002" },
  { contact_name: "Abena Boateng", phone_number: "+233 20 987 6543", device_name: "Samsung Galaxy S24 Ultra", device_id: "device_001" },
  { contact_name: "Yaw Darko", phone_number: "+1 415 555 0192", device_name: "Google Pixel 8 Pro", device_id: "device_002" },
  { contact_name: "Akosua Poku", phone_number: "+44 7700 900123", device_name: "Samsung Galaxy S24 Ultra", device_id: "device_001" },
  { contact_name: "Kwame Asante", phone_number: "+233 26 345 6789", device_name: "Google Pixel 8 Pro", device_id: "device_002" },
  { contact_name: "Efua Nyarko", phone_number: "+233 50 765 4321", device_name: "Samsung Galaxy S24 Ultra", device_id: "device_001" },
  { contact_name: "Nana Ama Kusi", phone_number: "+1 650 555 0187", device_name: "Google Pixel 8 Pro", device_id: "device_002" },
  { contact_name: "Unknown", phone_number: "+233 27 000 1234", device_name: "Samsung Galaxy S24 Ultra", device_id: "device_001" },
  { contact_name: "Fiifi Ankrah", phone_number: "+233 24 888 9900", device_name: "Google Pixel 8 Pro", device_id: "device_002" },
];

const callTypes = ["incoming_call", "missed_call", "incoming_call", "incoming_call", "missed_call"];

export const MOCK_CALL_LOGS = Array.from({ length: 35 }, (_, i) => {
  const contact = callContacts[i % callContacts.length];
  const logType = callTypes[i % callTypes.length];
  const durationSecs = logType === "missed_call" ? 0 : Math.floor(Math.random() * 600) + 10;

  return {
    $id: `call_${String(i + 1).padStart(3, "0")}`,
    $createdAt: hoursAgo(i * 2 + 1),
    $updatedAt: hoursAgo(i * 2 + 1),
    user_id: MOCK_USER_ID,
    device_id: contact.device_id,
    device_name: contact.device_name,
    contact_name: contact.contact_name,
    phone_number: contact.phone_number,
    log_type: logType,
    duration_seconds: durationSecs,
    timestamp: hoursAgo(i * 2 + 1),
  };
});

// ─── SMS Logs ─────────────────────────────────────────────────────────────────

const smsContacts = [
  { contact_name: "Ama Owusu", phone_number: "+233 24 456 7890", device_name: "Samsung Galaxy S24 Ultra", device_id: "device_001" },
  { contact_name: "Kofi Mensah", phone_number: "+233 55 234 5678", device_name: "Google Pixel 8 Pro", device_id: "device_002" },
  { contact_name: "Abena Boateng", phone_number: "+233 20 987 6543", device_name: "Samsung Galaxy S24 Ultra", device_id: "device_001" },
  { contact_name: "Yaw Darko", phone_number: "+1 415 555 0192", device_name: "Google Pixel 8 Pro", device_id: "device_002" },
  { contact_name: "Akosua Poku", phone_number: "+44 7700 900123", device_name: "Samsung Galaxy S24 Ultra", device_id: "device_001" },
];

const smsBodies = [
  "Hey, are you coming to the office tomorrow? Please let me know as soon as possible.",
  "The deployment went through successfully. All systems are up.",
  "I'll send the report by end of day. Just finalizing the last few charts now.",
  "Can we reschedule the 3pm call? Something came up on my end unexpectedly.",
  "Your OTP code is 847291. Do not share this with anyone.",
  "Meeting notes have been shared to your email. Please review before Friday.",
  "Package delivered at your doorstep. Tracking number: GH-2024-887612.",
  "Account balance: GHS 4,512.00. Last transaction: GHS 200.00 debit on 22 Jun.",
  null, // testing null body edge case
  "CallBridge sync verified. 14 new records uploaded. Next sync in 30 minutes.",
  "Quick question — did you review the Figma designs I shared last week?",
  "Flight GH771 confirmed. Check-in opens 24 hours before departure.",
  "Reminder: Team standup at 9am WAT. Link in calendar invite.",
  "Kwasi, your subscription renews on July 1st. Update billing to avoid interruption.",
  "System alert: High CPU usage detected on node-02. Auto-scaling triggered.",
];

export const MOCK_SMS_LOGS = Array.from({ length: 28 }, (_, i) => {
  const contact = smsContacts[i % smsContacts.length];
  const body = smsBodies[i % smsBodies.length];

  return {
    $id: `sms_${String(i + 1).padStart(3, "0")}`,
    $createdAt: hoursAgo(i * 3 + 0.5),
    $updatedAt: hoursAgo(i * 3 + 0.5),
    user_id: MOCK_USER_ID,
    device_id: contact.device_id,
    device_name: contact.device_name,
    contact_name: contact.contact_name,
    phone_number: contact.phone_number,
    message_body: body,
    is_read: i > 4, // first 5 are unread
    timestamp: hoursAgo(i * 3 + 0.5),
  };
});

// ─── Activity Logs ────────────────────────────────────────────────────────────

const activityEntries = [
  { activity_type: "sync_completed", activity_message: "14 call logs and 6 SMS synced from Samsung Galaxy S24 Ultra.", device_id: "device_001" },
  { activity_type: "monitoring_started", activity_message: "Monitoring service enabled on Samsung Galaxy S24 Ultra.", device_id: "device_001" },
  { activity_type: "sync_completed", activity_message: "3 SMS synced from Google Pixel 8 Pro.", device_id: "device_002" },
  { activity_type: "monitoring_toggled_web", activity_message: "Monitoring paused via web dashboard for Google Pixel 8 Pro.", device_id: "device_002" },
  { activity_type: "session_ended", activity_message: "User session ended. Logged out from web dashboard.", device_id: null },
  { activity_type: "device_registered", activity_message: "New device registered: Google Pixel 8 Pro (Android 15).", device_id: "device_002" },
  { activity_type: "sync_failed", activity_message: "Sync attempt failed on Google Pixel 8 Pro — network timeout.", device_id: "device_002" },
  { activity_type: "monitoring_started", activity_message: "Monitoring service resumed on Google Pixel 8 Pro.", device_id: "device_002" },
  { activity_type: "sync_completed", activity_message: "22 call logs synced. Full refresh from Samsung Galaxy S24 Ultra.", device_id: "device_001" },
  { activity_type: "permission_revoked", activity_message: "Notification permission revoked on Samsung Galaxy S24 Ultra.", device_id: "device_001" },
  { activity_type: "monitoring_stopped", activity_message: "Monitoring paused on Samsung Galaxy S24 Ultra due to battery saver mode.", device_id: "device_001" },
  { activity_type: "device_registered", activity_message: "New device registered: Samsung Galaxy S24 Ultra (Android 14).", device_id: "device_001" },
  { activity_type: "sync_completed", activity_message: "Initial sync: 8 SMS and 12 calls uploaded successfully.", device_id: "device_001" },
  { activity_type: "session_ended", activity_message: "Previous web session expired and was terminated.", device_id: null },
  { activity_type: "sync_completed", activity_message: "Background sync triggered by 2 new incoming calls.", device_id: "device_002" },
];

export const MOCK_ACTIVITY_LOGS = activityEntries.map((entry, i) => ({
  $id: `activity_${String(i + 1).padStart(3, "0")}`,
  $createdAt: hoursAgo(i * 4 + 1),
  $updatedAt: hoursAgo(i * 4 + 1),
  user_id: MOCK_USER_ID,
  device_id: entry.device_id,
  activity_type: entry.activity_type,
  activity_message: entry.activity_message,
  timestamp: hoursAgo(i * 4 + 1),
}));

// ─── Support Tickets ──────────────────────────────────────────────────────────

export const MOCK_SUPPORT_TICKETS = [
  {
    $id: "ticket_001",
    $createdAt: daysAgo(5),
    $updatedAt: daysAgo(5),
    user_id: MOCK_USER_ID,
    full_name: MOCK_USER_NAME,
    email: MOCK_USER_EMAIL,
    category: "Technical Issue",
    message: "SMS sync is not updating in real time. Logs are delayed by 20–30 minutes even when monitoring shows Active.",
    attachment_image: null,
    submitted_at: daysAgo(5),
  },
  {
    $id: "ticket_002",
    $createdAt: daysAgo(12),
    $updatedAt: daysAgo(12),
    user_id: MOCK_USER_ID,
    full_name: MOCK_USER_NAME,
    email: MOCK_USER_EMAIL,
    category: "Feature Request",
    message: "Would love to be able to export call and SMS logs as a CSV file for my own records and review.",
    attachment_image: "export_request_screenshot.png",
    submitted_at: daysAgo(12),
  },
  {
    $id: "ticket_003",
    $createdAt: daysAgo(20),
    $updatedAt: daysAgo(20),
    user_id: MOCK_USER_ID,
    full_name: MOCK_USER_NAME,
    email: MOCK_USER_EMAIL,
    category: "Account Problem",
    message: "I cannot update my display name in the profile section. The save button appears to submit but the name never changes.",
    attachment_image: null,
    submitted_at: daysAgo(20),
  },
];

// ─── Derived Stats (used by Dashboard) ───────────────────────────────────────

export const MOCK_STATS = {
  totalCalls: MOCK_CALL_LOGS.length,
  missedCalls: MOCK_CALL_LOGS.filter(c => c.log_type === "missed_call").length,
  answeredCalls: MOCK_CALL_LOGS.filter(c => c.log_type === "incoming_call").length,
  totalSMS: MOCK_SMS_LOGS.length,
  unreadSMS: MOCK_SMS_LOGS.filter(s => !s.is_read).length,
  readSMS: MOCK_SMS_LOGS.filter(s => s.is_read).length,
};
