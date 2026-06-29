import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { account, databases, AppwriteConfig, DEVICES_COLLECTION_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Lock, 
  Smartphone, 
  Bell, 
  ShieldAlert, 
  Loader2, 
  AlertCircle,
  X,
  Info,
  Sliders,
  Check,
  Phone,
  LogOut,
  Eye,
  EyeOff
} from "lucide-react";
import toast from "react-hot-toast";

// Helper to check password strength
const getPasswordStrength = (password: string) => {
  if (!password) return { score: 0, label: "", color: "bg-slate-200" };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 1:
      return { score: 1, label: "Weak Password", color: "bg-rose-500" };
    case 2:
      return { score: 2, label: "Fair Password", color: "bg-amber-505" };
    case 3:
      return { score: 3, label: "Strong Password", color: "bg-blue-500" };
    case 4:
      return { score: 4, label: "Very Strong Password", color: "bg-emerald-500" };
    default:
      return { score: 0, label: "", color: "bg-slate-200" };
  }
};

export default function SettingsPage() {
  const { user, logout, checkSession } = useAuth();
  const userId = user?.$id;

  // Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail] = useState(user?.email || "");
  const [primaryDeviceName, setPrimaryDeviceName] = useState("No devices connected");
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordValidationError, setPasswordValidationError] = useState<string | null>(null);

  // Notification States
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const [isNotificationSupported, setIsNotificationSupported] = useState(false);
  
  // Modals
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Password Strength Hook
  const passwordStrength = getPasswordStrength(newPassword);

  // Fetch linked device name for Profile card
  useEffect(() => {
    const fetchPrimaryDevice = async () => {
      if (!userId) return;
      try {
        const dbId = AppwriteConfig.databaseId;
        const res = await databases.listDocuments(dbId, DEVICES_COLLECTION_ID, [
          Query.equal("user_id", userId),
          Query.limit(1)
        ]);
        if (res.documents.length > 0) {
          setPrimaryDeviceName(res.documents[0].device_name);
        }
      } catch (e) {
        console.error("Error loading device info for settings:", e);
      }
    };
    fetchPrimaryDevice();
  }, [userId]);

  // Read initial notification permission status
  useEffect(() => {
    const supported = 'Notification' in window;
    setIsNotificationSupported(supported);
    if (supported) {
      setPermissionStatus(Notification.permission);
      
      // Revocation edge case: if permission is denied, force toggle to off in localStorage
      if (Notification.permission === "denied") {
        localStorage.setItem("cb_notifications_enabled", "false");
        setNotificationsEnabled(false);
      } else {
        const isEnabled = localStorage.getItem("cb_notifications_enabled") === "true";
        setNotificationsEnabled(Notification.permission === "granted" && isEnabled);
      }
    }
  }, []);

  // Handle Profile Name Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setProfileError("Full name cannot be empty.");
      return;
    }

    setIsProfileSaving(true);
    setProfileError(null);
    const toastId = toast.loading("Updating profile...");

    try {
      // Update name in Appwrite Account
      await account.updateName(profileName);
      // Refresh context user session
      await checkSession();
      setIsEditingProfile(false);
      
      toast.success("Profile updated", { id: toastId });
    } catch (err: any) {
      console.error("Failed to update profile name:", err);
      setProfileError("Failed to update profile. Please try again.");
      toast.error("Profile update failed", { id: toastId });
    } finally {
      setIsProfileSaving(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordValidationError(null);

    // 1. Client-side validations
    if (!currentPassword) {
      setPasswordValidationError("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordValidationError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordValidationError("New password and confirm password do not match.");
      return;
    }

    setIsPasswordSaving(true);
    const toastId = toast.loading("Updating password...");

    try {
      // 2. Write to Appwrite Account Password update
      await account.updatePassword(newPassword, currentPassword);
      
      // Reset password fields on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast.success("Password updated", { id: toastId });
    } catch (err: any) {
      console.error("Failed to update password:", err);
      
      // 3. Catch wrong current password (401)
      if (err?.code === 401 || err?.message?.toLowerCase().includes("invalid credentials") || err?.message?.toLowerCase().includes("unauthorized")) {
        setPasswordError("Current password is incorrect.");
      } else {
        setPasswordError(err?.message || "Failed to update password. Please try again.");
      }
      
      toast.error("Password update failed", { id: toastId });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  // Handle Notifications Toggle Switch
  const handleToggleNotifications = async () => {
    if (!isNotificationSupported) {
      toast.error("Your browser does not support push notifications.");
      return;
    }

    if (Notification.permission === "denied") {
      toast.error("Please enable notifications in your browser settings.");
      return;
    }

    if (Notification.permission === "default") {
      const { requestNotificationPermission, registerServiceWorker } = await import("@/lib/notificationService");
      const permission = await requestNotificationPermission();
      setPermissionStatus(permission);

      if (permission === "granted") {
        await registerServiceWorker();
        localStorage.setItem("cb_notifications_enabled", "true");
        setNotificationsEnabled(true);
        toast.success("Push alerts enabled successfully!");
      } else {
        localStorage.setItem("cb_notifications_enabled", "false");
        setNotificationsEnabled(false);
        toast.error("Please enable notifications in your browser settings.");
      }
      return;
    }

    // If already granted, simply toggle local settings state
    const nextState = !notificationsEnabled;
    localStorage.setItem("cb_notifications_enabled", nextState ? "true" : "false");
    setNotificationsEnabled(nextState);
    
    if (nextState) {
      const { registerServiceWorker } = await import("@/lib/notificationService");
      await registerServiceWorker();
      toast.success("Push alerts activated!");
    } else {
      toast.success("Push alerts suspended.");
    }
  };

  // Handle Destructive Sign Out
  const handleSignOutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (e) {
      console.error("Logout failed:", e);
      toast.error("Logout failed. Please try again.");
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  return (
    <PageLayout title="Settings" subtitle="Manage your account preferences and alert configurations." className="max-w-4xl mx-auto">
      <div className="max-w-4xl mx-auto">
        {/* Unified Settings Card (styled like mockup) */}
        <div className="relative bg-white border border-dashboard-border/60 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden pt-1 w-full">
          {/* Blue Highlight Line at the Top */}
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#005EA1]" />

          <div className="p-8 sm:p-10 space-y-8">
            {/* SECTION 1: PROFILE INFORMATION */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-[#005EA1]" />
                  Profile Information
                </h3>
                <span 
                  onClick={() => {
                    if (isEditingProfile) {
                      setProfileName(user?.name || "");
                      setProfileError(null);
                    }
                    setIsEditingProfile(!isEditingProfile);
                  }}
                  className="text-xs font-bold text-[#005EA1] hover:underline cursor-pointer flex items-center gap-1 select-none"
                >
                  {isEditingProfile ? "Cancel" : "Edit Profile"}
                </span>
              </div>

              {profileError && (
                <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-100/50 p-4 text-xs font-semibold text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {profileError}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="flex flex-col md:flex-row items-start gap-8 mt-4">
                {/* Profile Initials Avatar bubble */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-100 font-bold text-[#005EA1] text-2xl shadow-inner select-none mt-1">
                  {profileName ? profileName.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase() : "US"}
                </div>

                {/* Form fields grid layout */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#005EA1]">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Enter your name"
                      className={`h-12 w-full rounded-xl px-4 text-sm font-semibold border transition-all duration-200 ${
                        isEditingProfile 
                          ? "bg-white text-slate-900 border-dashboard-border/60 focus:outline-none focus:border-[#005EA1]" 
                          : "bg-[#F5F7FA] text-slate-400 border-transparent cursor-not-allowed"
                      }`}
                      disabled={!isEditingProfile || isProfileSaving}
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#005EA1]">Email Address</label>
                    <input
                      type="email"
                      value={profileEmail}
                      placeholder="email@example.com"
                      className="h-12 w-full rounded-xl bg-[#F5F7FA] px-4 text-sm font-semibold text-slate-400 border border-transparent cursor-not-allowed focus:outline-none"
                      disabled={true}
                      readOnly={true}
                    />
                  </div>

                  {/* Device Info */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#005EA1]">Device Info</label>
                    <input
                      type="text"
                      value={primaryDeviceName}
                      className="h-12 w-full rounded-xl bg-[#F5F7FA] px-4 text-sm font-semibold text-slate-400 border border-transparent cursor-not-allowed focus:outline-none"
                      disabled={true}
                      readOnly={true}
                    />
                  </div>

                  {/* Save Changes Button */}
                  {isEditingProfile && (
                    <div className="flex items-end justify-end pt-2 md:pt-0 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <Button
                        type="submit"
                        disabled={isProfileSaving}
                        className="h-12 w-full md:w-auto bg-btn-primary-gradient hover:opacity-95 text-white rounded-full font-bold flex items-center justify-center gap-2 transition duration-300 px-8 shadow-sm"
                      >
                        {isProfileSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        SAVE CHANGES
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="h-px bg-slate-100/60" />

            {/* SECTION 2: PASSWORD & SECURITY */}
            <div className="space-y-6">
              <div className="border-b border-slate-50 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#005EA1]" />
                  Password & Security
                </h3>
              </div>

              {passwordValidationError && (
                <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-100/50 p-4 text-xs font-semibold text-amber-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {passwordValidationError}
                </div>
              )}

              {passwordError && (
                <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-100/50 p-4 text-xs font-semibold text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-2xl">
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#005EA1]">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="h-12 w-full rounded-xl bg-[#F5F7FA] pl-4 pr-12 text-sm font-semibold text-slate-900 border border-transparent focus:outline-none focus:border-dashboard-border/60 focus:bg-white transition-all duration-200"
                      disabled={isPasswordSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showCurrentPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#005EA1]">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="h-12 w-full rounded-xl bg-[#F5F7FA] pl-4 pr-12 text-sm font-semibold text-slate-900 border border-transparent focus:outline-none focus:border-dashboard-border/60 focus:bg-white transition-all duration-200"
                      disabled={isPasswordSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showNewPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Visualizer bars */}
                  {newPassword && (
                    <div className="space-y-2 pt-2 px-1">
                      {/* Bars split into 4 segments */}
                      <div className="grid grid-cols-4 gap-2 h-1.5">
                        {[1, 2, 3, 4].map((barIndex) => (
                          <div 
                            key={barIndex}
                            className={`h-full rounded-full transition-colors duration-300 ${
                              barIndex <= passwordStrength.score ? passwordStrength.color : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold tracking-wide">
                        <span className="text-[#3b82f6] uppercase font-sans">
                          {passwordStrength.label || "Security Strength"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#005EA1]">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="h-12 w-full rounded-xl bg-[#F5F7FA] px-4 text-sm font-semibold text-slate-900 border border-transparent focus:outline-none focus:border-dashboard-border/60 focus:bg-white transition-all duration-200"
                    disabled={isPasswordSaving}
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isPasswordSaving}
                    className="h-11 bg-[#1A1A2B] hover:bg-[#2C2C3E] text-white rounded-full flex items-center justify-center gap-2 transition px-6 shadow-md text-xs"
                  >
                    {isPasswordSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </div>
              </form>
            </div>

            <div className="h-px bg-slate-100/60" />

            {/* SECTION 3: SYSTEM NOTIFICATIONS */}
            <div className="space-y-6">
              <div className="border-b border-slate-50 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[#005EA1]" />
                  System Notifications
                </h3>
              </div>

              {isNotificationSupported ? (
                <div className="flex items-center justify-between gap-6 w-full">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">App Alerts & System Notifications</h4>
                    <p className="text-xs font-semibold text-slate-450 leading-relaxed">
                      Enable or disable all application-level alerts and system warnings
                    </p>
                  </div>

                  {/* Toggle switch */}
                  <button
                    onClick={handleToggleNotifications}
                    disabled={permissionStatus === "denied"}
                    className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      notificationsEnabled ? "bg-[#005EA1]" : "bg-slate-200"
                    } ${permissionStatus === "denied" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notificationsEnabled ? "translate-x-5.5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-6 bg-slate-50 p-4 border border-slate-100 rounded-2xl w-full">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">Push Notifications Unavailable</h4>
                    <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                      Your browser does not support push notifications.
                    </p>
                  </div>
                  <div className="flex h-9 px-3.5 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold shrink-0 select-none">
                    Unsupported
                  </div>
                </div>
              )}

              {permissionStatus === "denied" && (
                <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-100/50 p-4 text-xs font-semibold text-rose-700 w-full">
                  <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold">Desktop notifications are blocked by your browser.</span>
                    <p className="mt-0.5 font-medium leading-relaxed">
                      To receive real-time sync alerts, you must manually grant permission inside your browser site settings (click the lock icon next to the URL in the address bar and set Notifications to "Allow").
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-bold text-slate-500 bg-[#F8F9FC] rounded-xl p-4 border border-slate-100 w-full">
                <span>Browser Permission Status:</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                  permissionStatus === "granted"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : permissionStatus === "denied"
                      ? "bg-rose-50 text-rose-700 border-rose-100"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                }`}>
                  {permissionStatus}
                </span>
              </div>
            </div>

            <div className="h-px bg-slate-100/60" />

            {/* SECTION 4: PRIVACY & PERMISSIONS */}
            <div className="space-y-6">
              <div className="border-b border-slate-50 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-[#005EA1]" />
                  Privacy & Permissions
                </h3>
              </div>

              {/* Advisory capsule */}
              <div className="flex gap-4 rounded-2xl bg-[#EEF0FD]/80 p-5 border border-indigo-50/50 w-full">
                <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  CallBridge requires these permissions to function correctly. Revoking access may lead to service interruption or data loss. Ensure your mobile device has "Allow Background Activity" enabled.
                </p>
              </div>

              {/* List of Permissions Capsules */}
              <div className="flex flex-col gap-3 w-full pt-2 font-serif">
                {/* Phone Log Access */}
                <div className="flex items-center justify-between rounded-xl bg-[#F8F9FC] p-4">
                  <div className="flex items-center gap-3.5 font-bold text-[#1A1A2B] text-sm">
                    <Phone className="h-5 w-5 text-[#005EA1]" />
                    <span>Phone / Call Log Access</span>
                  </div>
                  <div className="h-5.5 w-5.5 rounded-md bg-[#005EA1] text-white flex items-center justify-center shadow-sm">
                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                  </div>
                </div>

                {/* SMS Access */}
                <div className="flex items-center justify-between rounded-xl bg-[#F8F9FC] p-4">
                  <div className="flex items-center gap-3.5 font-bold text-[#1A1A2B] text-sm">
                    <Mail className="h-5 w-5 text-[#005EA1]" />
                    <span>SMS Messaging Access</span>
                  </div>
                  <div className="h-5.5 w-5.5 rounded-md bg-[#005EA1] text-white flex items-center justify-center shadow-sm">
                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between rounded-xl bg-[#F8F9FC] p-4">
                  <div className="flex items-center gap-3.5 font-bold text-[#1A1A2B] text-sm">
                    <Bell className="h-5 w-5 text-[#005EA1]" />
                    <span>Push Notifications</span>
                  </div>
                  <div className="h-5.5 w-5.5 rounded-md bg-[#005EA1] text-white flex items-center justify-center shadow-sm">
                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                  </div>
                </div>

                {/* Access Contacts */}
                <div className="flex items-center justify-between rounded-xl bg-[#F8F9FC] p-4">
                  <div className="flex items-center gap-3.5 font-bold text-[#1A1A2B] text-sm">
                    <User className="h-5 w-5 text-[#005EA1]" />
                    <span>Access Contacts</span>
                  </div>
                  <div className="h-5.5 w-5.5 rounded-md bg-[#005EA1] text-white flex items-center justify-center shadow-sm">
                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100/60" />

            {/* DANGER ZONE PANEL (Red unified card) */}
            <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-5 space-y-4 w-full">
              {/* Row 1: Stop Monitoring */}
              <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold font-serif text-rose-700">Danger Zone: Stop Monitoring</h4>
                  <p className="text-[12px] text-rose-500/80">
                    Cease all active data gathering and disconnect from nodes
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    toast.success("Simulation: Sent pause signal to background sync services.");
                  }}
                  className="border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 hover:border-rose-300 rounded-xl font-semibold h-9 transition flex items-center justify-center shrink-0 px-5 bg-white text-xs"
                >
                  Stop All Services
                </Button>
              </div>

              {/* <div className="h-px bg-rose-100/50" /> */}

              {/* Row 2: Account Logout */}
              {/* <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-800">Danger Zone: Account Logout</h4>
                  <p className="text-xs font-semibold text-slate-550">
                    Sign out of your active CallBridge session on this workstation
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold h-10 transition flex items-center justify-center shrink-0 px-6 shadow-sm text-xs"
                >
                  Log Out of Account
                </Button>
              </div> */}
            </div>

          </div>
        </div>
      </div>

      {/* CONFIRM LOGOUT DIALOG MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#090d16]/45 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => {
              if (!isLoggingOut) setIsLogoutModalOpen(false);
            }}
          />
          
          {/* Modal Card */}
          <div className="relative w-full max-w-sm rounded-[28px] border border-dashboard-border/60 bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-10">
            
            {/* Close Button */}
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              disabled={isLoggingOut}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-50 text-slate-450 hover:text-slate-600 transition focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                <LogOut className="h-5.5 w-5.5" />
              </div>
              
              <h3 className="text-lg font-bold text-slate-900">
                Confirm Sign Out
              </h3>
              
              <p className="text-xs font-semibold text-slate-450 leading-relaxed max-w-xs mx-auto">
                Are you sure you want to sign out? This will end your active session on this workstation. You will need to log back in to monitor synchronization nodes.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="mt-7 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setIsLogoutModalOpen(false)}
                disabled={isLoggingOut}
                className="h-11 border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl font-bold transition text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSignOutConfirm}
                disabled={isLoggingOut}
                className="h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm text-xs"
              >
                {isLoggingOut && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
