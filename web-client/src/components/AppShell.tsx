import React, { useState, useEffect, useRef, Suspense } from "react";
import { NavLink, Outlet, useNavigate, useLocation, useSearchParams } from "react-router-dom";
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
  ShieldAlert,
  Loader2,
  PhoneCall
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { client, databases, AppwriteConfig, CALL_LOGS_COLLECTION_ID, SMS_LOGS_COLLECTION_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import logo1 from "../assets/logo1.png";

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Search feature states
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<{ calls: any[]; sms: any[] }>({ calls: [], sms: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Global fetch indicator — shows the top loader bar whenever any React Query
  // fetch is in flight (first load, background revalidation, filter changes, etc.)
  const isFetching = useIsFetching();

  const userId = user?.$id;

  // Sync search input value when navigating onto /calls or /sms
  useEffect(() => {
    const query = searchParams.get("search") || "";
    const isContextualPage = location.pathname === "/calls" || location.pathname === "/sms";
    if (isContextualPage) {
      setSearchText(query);
    } else {
      setSearchText("");
    }
  }, [location.pathname, searchParams]);

  // Debounce URL search parameters update on contextual pages
  useEffect(() => {
    const isContextualPage = location.pathname === "/calls" || location.pathname === "/sms";
    if (!isContextualPage) return;

    const handler = setTimeout(() => {
      setSearchParams(prev => {
        if (searchText.trim()) {
          prev.set("search", searchText);
        } else {
          prev.delete("search");
        }
        return prev;
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [searchText, location.pathname, setSearchParams]);

  // Global search popover query when on other pages
  useEffect(() => {
    const isContextualPage = location.pathname === "/calls" || location.pathname === "/sms";
    if (isContextualPage || !searchText.trim() || !userId) {
      setSearchResults({ calls: [], sms: [] });
      setIsPopoverOpen(false);
      return;
    }

    setIsSearching(true);
    setIsPopoverOpen(true);

    const handler = setTimeout(async () => {
      try {
        const dbId = AppwriteConfig.databaseId;
        const cleanQuery = searchText.trim();
        
        // Fetch Call logs matching
        const [callsRes, smsRes] = await Promise.all([
          databases.listDocuments(dbId, CALL_LOGS_COLLECTION_ID, [
            Query.equal("user_id", userId),
            Query.or([
              Query.contains("contact_name", cleanQuery),
              Query.contains("phone_number", cleanQuery)
            ]),
            Query.orderDesc("timestamp"),
            Query.limit(5)
          ]),
          databases.listDocuments(dbId, SMS_LOGS_COLLECTION_ID, [
            Query.equal("user_id", userId),
            Query.or([
              Query.contains("contact_name", cleanQuery),
              Query.contains("phone_number", cleanQuery),
              Query.contains("message_body", cleanQuery)
            ]),
            Query.orderDesc("timestamp"),
            Query.limit(5)
          ])
        ]);

        setSearchResults({
          calls: callsRes.documents,
          sms: smsRes.documents
        });
      } catch (e) {
        console.error("Global search error:", e);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchText, location.pathname, userId]);

  // Dismiss search popover on clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <div ref={searchContainerRef} className="relative hidden max-w-sm w-full sm:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
              <input
                type="text"
                placeholder={
                  location.pathname === "/calls" 
                    ? "Search calls..." 
                    : location.pathname === "/sms" 
                    ? "Search SMS..." 
                    : "Search system logs..."
                }
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onFocus={() => {
                  if (searchText.trim() && location.pathname !== "/calls" && location.pathname !== "/sms") {
                    setIsPopoverOpen(true);
                  }
                }}
                className="h-10 w-full rounded-full bg-user-card pl-10 pr-10 text-sm text-foreground placeholder-foreground/50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all duration-200"
              />
              {searchText && (
                <button
                  onClick={() => {
                    setSearchText("");
                    setIsPopoverOpen(false);
                    setSearchParams(prev => {
                      prev.delete("search");
                      return prev;
                    });
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 hover:scale-105 text-slate-500 hover:text-slate-700 transition focus:outline-none"
                  title="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}

              {/* Global search results popover */}
              {isPopoverOpen && searchText.trim() && (
                <div className="absolute left-0 right-0 mt-2 max-h-[420px] overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-2xl z-50 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-xs font-semibold">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      Searching CallBridge...
                    </div>
                  ) : (
                    <>
                      {searchResults.calls.length === 0 && searchResults.sms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
                          <ShieldAlert className="h-5.5 w-5.5 mb-2 text-slate-300" />
                          <p className="text-xs font-bold text-slate-500">No search results for calls or sms</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">We couldn't find matches for "{searchText}".</p>
                        </div>
                      ) : (
                        <>
                          {/* Call Logs Section */}
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-slate-400" />
                              Call Logs
                            </h4>
                            {searchResults.calls.length === 0 ? (
                              <p className="text-xs text-slate-400 pl-4.5 italic">No matching calls found.</p>
                            ) : (
                              <div className="space-y-1">
                                {searchResults.calls.map((call) => (
                                  <div
                                    key={call.$id}
                                    onClick={() => {
                                      setIsPopoverOpen(false);
                                      navigate(`/calls?search=${encodeURIComponent(call.contact_name || call.phone_number)}`);
                                    }}
                                    className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl cursor-pointer text-xs transition duration-150 group"
                                  >
                                    <div className="min-w-0 flex-1 pr-2 text-left">
                                      <span className="font-bold text-slate-800 group-hover:text-primary transition-colors block truncate">
                                        {call.contact_name || "Unknown"}
                                      </span>
                                      <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{call.phone_number}</span>
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                                      call.log_type === "missed_call" 
                                        ? "bg-rose-50 text-rose-600 border border-rose-100/50" 
                                        : "bg-emerald-50 text-emerald-600 border border-emerald-100/50"
                                    }`}>
                                      {call.log_type === "missed_call" ? "Missed" : "Answered"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* SMS Logs Section */}
                          <div className="border-t border-slate-50 pt-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                              <MessageSquare className="h-3 w-3 text-slate-400" />
                              SMS Messages
                            </h4>
                            {searchResults.sms.length === 0 ? (
                              <p className="text-xs text-slate-400 pl-4.5 italic">No matching messages found.</p>
                            ) : (
                              <div className="space-y-1">
                                {searchResults.sms.map((sms) => (
                                  <div
                                    key={sms.$id}
                                    onClick={() => {
                                      setIsPopoverOpen(false);
                                      navigate(`/sms?search=${encodeURIComponent(sms.contact_name || sms.phone_number)}`);
                                    }}
                                    className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer text-xs transition duration-150 group block text-left"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-slate-800 group-hover:text-primary transition-colors block truncate">
                                        {sms.contact_name || "Unknown"}
                                      </span>
                                      <span className="text-[10px] text-slate-400 shrink-0">{sms.phone_number}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 truncate mt-1 font-normal italic">
                                      "{sms.message_body}"
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Quick Filters Footer */}
                      <div className="border-t border-slate-50 pt-2.5 flex flex-col gap-1.5 pl-1">
                        {searchResults.calls.length > 0 ? (
                          <button
                            onClick={() => {
                              setIsPopoverOpen(false);
                              navigate(`/calls?search=${encodeURIComponent(searchText)}`);
                            }}
                            className="text-[11px] font-bold text-primary hover:text-primary-dark hover:underline flex items-center gap-1 text-left w-full focus:outline-none"
                          >
                            Search "{searchText}" in Call Logs &rarr;
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setIsPopoverOpen(false);
                              navigate(`/calls`);
                            }}
                            className="text-[11px] font-bold text-slate-500 hover:text-primary hover:underline flex items-center gap-1 text-left w-full focus:outline-none"
                          >
                            Go to Call Logs &rarr;
                          </button>
                        )}
                        {searchResults.sms.length > 0 ? (
                          <button
                            onClick={() => {
                              setIsPopoverOpen(false);
                              navigate(`/sms?search=${encodeURIComponent(searchText)}`);
                            }}
                            className="text-[11px] font-bold text-primary hover:text-primary-dark hover:underline flex items-center gap-1 text-left w-full focus:outline-none"
                          >
                            Search "{searchText}" in SMS Messages &rarr;
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setIsPopoverOpen(false);
                              navigate(`/sms`);
                            }}
                            className="text-[11px] font-bold text-slate-500 hover:text-primary hover:underline flex items-center gap-1 text-left w-full focus:outline-none"
                          >
                            Go to SMS Messages &rarr;
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
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
