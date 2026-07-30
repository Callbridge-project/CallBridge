import React, { useState, useEffect, Suspense } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useIsFetching } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  Phone, 
  MessageSquare, 
  Smartphone, 
  Clock, 
  HelpCircle, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Menu, 
  X,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { client, AppwriteConfig, CALL_LOGS_COLLECTION_ID, SMS_LOGS_COLLECTION_ID } from "@/lib/appwrite";
import logo1 from "../assets/logo1.png";

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global fetch indicator — shows the top loader bar whenever any React Query
  // fetch is in flight (first load, background revalidation, filter changes, etc.)
  const isFetching = useIsFetching();

  // 1. Service Worker Message Listener (Navigate smoothly on notification click)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "NAVIGATE") {
        navigate(event.data.url);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  // 2. Register Service Worker on Mount if notifications are enabled
  useEffect(() => {
    const isEnabled = localStorage.getItem("cb_notifications_enabled") === "true";
    if (isEnabled && Notification.permission === "granted") {
      import("@/lib/notificationService").then(({ registerServiceWorker }) => {
        registerServiceWorker();
      });
    }
  }, []);

  // 3. Global real-time subscription for Push Notifications
  useEffect(() => {
    if (!user?.$id) return;
    const userId = user.$id;

    // Check notification permissions and settings
    const checkNotificationStatus = () => {
      const isEnabled = localStorage.getItem("cb_notifications_enabled") === "true";
      return isEnabled && Notification.permission === "granted";
    };

    const dbId = AppwriteConfig.databaseId;
    const unsubscribe = client.subscribe([
      `databases.${dbId}.collections.${CALL_LOGS_COLLECTION_ID}.documents`,
      `databases.${dbId}.collections.${SMS_LOGS_COLLECTION_ID}.documents`
    ], (response) => {
      if (!checkNotificationStatus()) return;

      const events = response.events;
      const payload = response.payload as any;
      if (payload.user_id !== userId) return;

      // Import notification service dynamically
      import("@/lib/notificationService").then(({ triggerNotification }) => {
        // Handle Call Notification
        if (events.some(e => e.includes(CALL_LOGS_COLLECTION_ID)) && events.some(e => e.endsWith(".create"))) {
          const isCallsPage = location.pathname === "/calls";
          if (document.hidden || !isCallsPage) {
            const caller = payload.contact_name || payload.caller_number || payload.phone_number || "Unknown Number";
            const title = "Incoming Call";
            const body = `${caller} called on ${payload.device_name || "linked device"}`;
            triggerNotification(title, body, "/calls");
          }
        }

        // Handle SMS Notification
        if (events.some(e => e.includes(SMS_LOGS_COLLECTION_ID)) && events.some(e => e.endsWith(".create"))) {
          const isSmsPage = location.pathname === "/sms";
          if (document.hidden || !isSmsPage) {
            const sender = payload.contact_name || payload.caller_number || payload.phone_number || "Unknown Number";
            const title = "New SMS";
            const body = `Message from ${sender} on ${payload.device_name || "linked device"}`;
            triggerNotification(title, body, "/sms");
          }
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [user?.$id, location.pathname]);

  const userName = user?.name || "User";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    const toastId = toast.loading("Signing out...");
    try {
      await logout();
      toast.success("Signed out successfully", { id: toastId });
    } catch (error) {
      toast.error("Logout failed. Please try again.", { id: toastId });
    }
  };

  const navItems = [
    { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { name: "Calls", to: "/calls", icon: Phone },
    { name: "SMS", to: "/sms", icon: MessageSquare },
    { name: "Device", to: "/device", icon: Smartphone },
  ];

  const monitoringItems = [
    { name: "Activity Logs", to: "/activity", icon: Clock },
  ];

  const systemItems = [
    { name: "Support", to: "/support", icon: HelpCircle },
    { name: "Settings", to: "/settings", icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between bg-white py-6 border-r border-slate-100 pl-4 pr-2 overflow-y-auto scrollbar-hide">
      <div className="space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center -ml-2">
          <img src={logo1} alt="CallBridge Logo" className="h-21 object-contain" />
        </div>

        {/* Menu Items */}
        <nav className="space-y-6">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 pl-3 pr-6 py-3.5 text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-primary/5 text-primary border-r-4 border-primary font-semibold"
                      : "text-foreground/70 hover:bg-slate-50/50 hover:text-foreground"
                  }`
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Monitoring Section */}
          <div className="space-y-2">
            <div className="pl-4 text-xs font-bold uppercase tracking-wider text-foreground/60">
              Monitoring
            </div>
            <div className="space-y-1">
              {monitoringItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 pl-3 pr-6 py-3.5 text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-primary/5 text-primary border-r-4 border-primary font-semibold"
                        : "text-foreground/70 hover:bg-slate-50/50 hover:text-foreground"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* System Section */}
          <div className="space-y-2">
            <div className="pl-4 text-xs font-bold uppercase tracking-wider text-foreground/60">
              System
            </div>
            <div className="space-y-1">
              {systemItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 pl-3 pr-6 py-3.5 text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-primary/5 text-primary border-r-4 border-primary font-semibold"
                        : "text-foreground/70 hover:bg-slate-50/50 hover:text-foreground"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom Profile Details */}
      <div className="space-y-4 pr-2">
        {/* User Card */}
        <div className="flex items-center gap-3.5 rounded-2xl bg-user-card p-4 border border-user-card-border">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-user-avatar font-bold text-user-avatar-text text-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-foreground">{userName}</div>
            <div className="truncate text-xs font-medium text-foreground/60 mt-0.5">Premium Plan</div>
          </div>
        </div>

        {/* Sign Out Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12 border border-logout-border bg-white hover:bg-red-50/50 rounded-xl text-logout-text flex items-center justify-center gap-2 font-bold text-sm transition-all duration-200"
        >
          <span>Sign Out</span>
          <LogOut className="h-4.5 w-4.5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-900 font-sans">

      {/* ── GLOBAL TOP LOADER BAR ──────────────────────────────────── */}
      {/* Appears whenever any React Query fetch is in-flight across any page. */}
      {/* YouTube / Linear style: slim, animated, unobtrusive.               */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "2.5px",
          zIndex: 9999,
          pointerEvents: "none",
          transition: "opacity 300ms ease",
          opacity: isFetching > 0 ? 1 : 0,
        }}
      >
        {isFetching > 0 && <div className="cb-loader-bar" />}
      </div>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden h-full w-[260px] shrink-0 lg:block">
        <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR DRAWERS */}
      {isMobileSidebarOpen && (
        <div className="relative z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 flex w-[260px] max-w-full">
            <div className="w-full">
              <SidebarContent />
            </div>
            {/* Close button inside drawer area */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-5 right-[-45px] flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-md border border-slate-100 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN WRAPPER (HEADER + CONTENT) */}
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-slate-100 bg-white/80 px-6 backdrop-blur-md lg:px-8">
          {/* Left search or hamburger */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 lg:hidden focus:outline-none"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search Input Box */}
            <div className="relative hidden max-w-sm w-full sm:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
              <input
                type="text"
                placeholder="Search system logs..."
                className="h-10 w-full rounded-full bg-user-card pl-10 pr-4 text-sm text-foreground placeholder-foreground/50 border-0 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            {/* Monitoring status pill badge */}
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary select-none">
              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
              <span className="hidden xs:inline">Monitoring Active</span>
              <span className="xs:hidden">Active</span>
            </div>

            {/* Vertical Divider 1 */}
            <span className="h-5 w-[1px] bg-slate-200/80 mx-1" />

            {/* Actions & Avatar icons */}
            <div className="flex items-center gap-1">
              {/* Notification Bell */}
              <button className="relative flex h-9 w-9 items-center justify-center text-foreground/80 hover:text-foreground hover:bg-slate-50 rounded-lg transition-all focus:outline-none">
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
              </button>

              {/* Settings Gear */}
              <button 
                onClick={() => navigate("/settings")}
                className="flex h-9 w-9 items-center justify-center text-foreground/80 hover:text-foreground hover:bg-slate-50 rounded-lg transition-all focus:outline-none"
              >
                <Settings className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Vertical Divider 2 */}
            <span className="h-5 w-[1px] bg-slate-200/80 mx-1" />

            {/* Profile Avatar initials */}
            <div 
              onClick={() => navigate("/settings")}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-user-avatar font-bold text-user-avatar-text text-sm select-none hover:bg-user-avatar/80 transition-colors"
            >
              {initials}
            </div>
          </div>
        </header>

        {/* PAGE BODY AREA */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 bg-page-gradient">
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
