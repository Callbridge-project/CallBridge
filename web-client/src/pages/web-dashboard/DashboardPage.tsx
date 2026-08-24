import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CustomModal from "@/components/modals/modal";
import { databases, client, AppwriteConfig, APPWRITE_DATABASE_ID, CALL_LOGS_COLLECTION_ID, SMS_LOGS_COLLECTION_ID, DEVICES_COLLECTION_ID, ACTIVITY_LOGS_COLLECTION_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import PageLayout from "@/components/layout/PageLayout";
import StatsGrid from "@/components/layout/dashboard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  PhoneOff,
  MessageSquare, 
  Smartphone, 
  Clock, 
  Shield, 
  Lock, 
  AlertCircle, 
  Play, 
  Pause, 
  RefreshCw, 
  LogOut, 
  ShieldOff, 
  Activity, 
  Download, 
  ArrowRight, 
  ChevronRight, 
  Wifi, 
  WifiOff, 
  Terminal, 
  CheckCircle2, 
  Signal, 
  Zap, 
  X,
  SmartphoneIcon
} from "lucide-react";
import toast from "react-hot-toast";
import phoneLaptopMockup from "@/assets/images/phone-laptop-mockup.png";
import syshealth from "@/assets/Syshealth.svg";
import dashAndroid from "@/assets/dash-android.png";
import subcall from "@/assets/subcall.svg";
import subsms from "@/assets/subsms.svg";
import active from "@/assets/active.svg";
import battery from "@/assets/battery.svg";
import dashcall from "@/assets/dashcall.svg";
import dashsms from "@/assets/dashsms.svg";
import missedcall from "@/assets/missed.svg";
import answeredcall from "@/assets/answered.svg";

// Helper to format date relative to today
const formatRelativeTime = (isoString: string) => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " + date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "Unknown";
  }
};

// Activity type to Icon and color mapping
const getActivityConfig = (type: string) => {
  switch (type) {
    case "device_registered":
      return { icon: Smartphone, color: "text-primary bg-blue-50 border-blue-100" };
    case "monitoring_started":
      return { icon: Play, color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    case "monitoring_stopped":
    case "monitoring_toggled_web":
      return { icon: Pause, color: "text-amber-600 bg-amber-50 border-amber-100" };
    case "sync_completed":
      return { icon: RefreshCw, color: "text-indigo-600 bg-indigo-50 border-indigo-100 animate-spin-slow" };
    case "sync_failed":
      return { icon: AlertCircle, color: "text-rose-600 bg-rose-50 border-rose-100" };
    case "session_ended":
      return { icon: LogOut, color: "text-slate-600 bg-slate-50 border-slate-100" };
    case "permission_revoked":
      return { icon: ShieldOff, color: "text-red-600 bg-red-50 border-red-100" };
    default:
      return { icon: Activity, color: "text-primary bg-blue-50 border-blue-100" };
  }
};

export default function DashboardPage() {
  const { user } = useAuth();
  const userId = user?.$id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const breadcrumbs = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Overview" }
  ];

  const [isReconnecting, setIsReconnecting] = useState(!navigator.onLine);
  const [isRefreshingTerminal, setIsRefreshingTerminal] = useState(false);

  // Real-time overlay state (incremented by WS events, not refetches)
  const [rtDevices, setRtDevices] = useState<any[] | null>(null);
  const [rtCounts, setRtCounts] = useState<{
    totalCalls: number; missedCalls: number; answeredCalls: number;
    totalSMS: number; unreadSMS: number; readSMS: number;
    lastSyncTime: string | null;
  } | null>(null);
  const [rtRecentCalls, setRtRecentCalls] = useState<any[] | null>(null);
  const [rtRecentSMS, setRtRecentSMS] = useState<any[] | null>(null);
  const [rtRecentActivity, setRtRecentActivity] = useState<any[] | null>(null);

  // Setup/Download Modal State
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // ── React Query: fetch all dashboard data in one call ───────────────────────
  const fetchDashboardData = useCallback(async () => {
    if (!userId) return null;
    const dbId = AppwriteConfig.databaseId;

    // 1. Linked devices
    const devicesRes = await databases.listDocuments(dbId, DEVICES_COLLECTION_ID, [
      Query.equal("user_id", userId)
    ]);
    const linkedDevices = devicesRes.documents;

    // If no devices, return early with empty state
    if (linkedDevices.length === 0) {
      return { devices: [], totalCalls: 0, missedCalls: 0, answeredCalls: 0,
        totalSMS: 0, unreadSMS: 0, readSMS: 0, recentCalls: [], recentSMS: [],
        recentActivity: [], lastSyncTime: null };
    }

    // 2-8. Parallel fetches for everything else
    const [callsTotalRes, missedCallsRes, smsTotalRes, unreadSMSRes, recentCallsRes, recentSMSRes, recentActivityRes] = await Promise.all([
      databases.listDocuments(dbId, CALL_LOGS_COLLECTION_ID, [Query.equal("user_id", userId), Query.limit(1)]),
      databases.listDocuments(dbId, CALL_LOGS_COLLECTION_ID, [Query.equal("user_id", userId), Query.equal("log_type", "missed_call"), Query.limit(1)]),
      databases.listDocuments(dbId, SMS_LOGS_COLLECTION_ID, [Query.equal("user_id", userId), Query.limit(1)]),
      databases.listDocuments(dbId, SMS_LOGS_COLLECTION_ID, [Query.equal("user_id", userId), Query.equal("is_read", false), Query.limit(1)]),
      databases.listDocuments(dbId, CALL_LOGS_COLLECTION_ID, [Query.equal("user_id", userId), Query.orderDesc("timestamp"), Query.limit(5)]),
      databases.listDocuments(dbId, SMS_LOGS_COLLECTION_ID, [Query.equal("user_id", userId), Query.orderDesc("timestamp"), Query.limit(5)]),
      databases.listDocuments(dbId, ACTIVITY_LOGS_COLLECTION_ID, [Query.equal("user_id", userId), Query.orderDesc("timestamp"), Query.limit(10)]),
    ]);

    // 9. Derive last sync time
    const syncTimes = linkedDevices.map(d => d.last_sync).filter(Boolean).map(t => new Date(t).getTime());
    const lastSyncTime = syncTimes.length > 0 ? new Date(Math.max(...syncTimes)).toISOString() : null;

    return {
      devices: linkedDevices,
      totalCalls: callsTotalRes.total,
      missedCalls: missedCallsRes.total,
      answeredCalls: callsTotalRes.total - missedCallsRes.total,
      totalSMS: smsTotalRes.total,
      unreadSMS: unreadSMSRes.total,
      readSMS: smsTotalRes.total - unreadSMSRes.total,
      recentCalls: recentCallsRes.documents,
      recentSMS: recentSMSRes.documents,
      recentActivity: recentActivityRes.documents,
      lastSyncTime,
    };
  }, [userId]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard", userId],
    queryFn: fetchDashboardData,
    enabled: !!userId,
    staleTime: 30_000,          // treat data as fresh for 30s
    gcTime: 5 * 60_000,         // keep in cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Merge query data with real-time overlay
  const [searchParams] = useSearchParams();
  const forceEmpty = searchParams.get("empty") === "true";
  const devices        = forceEmpty ? [] : (rtDevices        ?? data?.devices        ?? []);
  const totalCalls     = rtCounts?.totalCalls     ?? data?.totalCalls     ?? 0;
  const missedCalls    = rtCounts?.missedCalls    ?? data?.missedCalls    ?? 0;
  const answeredCalls  = rtCounts?.answeredCalls  ?? data?.answeredCalls  ?? 0;
  const totalSMS       = rtCounts?.totalSMS       ?? data?.totalSMS       ?? 0;
  const unreadSMS      = rtCounts?.unreadSMS      ?? data?.unreadSMS      ?? 0;
  const readSMS        = rtCounts?.readSMS        ?? data?.readSMS        ?? 0;
  const lastSyncTime   = rtCounts?.lastSyncTime   ?? data?.lastSyncTime   ?? null;
  const recentCalls    = rtRecentCalls    ?? data?.recentCalls    ?? [];
  const recentSMS      = rtRecentSMS      ?? data?.recentSMS      ?? [];
  const recentActivity = rtRecentActivity ?? data?.recentActivity ?? [];

  // Expose a compatible error string
  const errorMsg = isError ? ((error as any)?.message ?? "Failed to load dashboard data.") : null;

  // Handle terminal card refresh
  const handleTerminalRefresh = async () => {
    setIsRefreshingTerminal(true);
    const toastId = toast.loading("Polling monitoring nodes...");
    await refetch();
    // Clear real-time overlays so fresh query data takes over
    setRtDevices(null); setRtCounts(null); setRtRecentCalls(null);
    setRtRecentSMS(null); setRtRecentActivity(null);
    setTimeout(() => {
      setIsRefreshingTerminal(false);
      toast.success("Monitoring logs refreshed!", { id: toastId });
    }, 400);
  };

  // Online/Offline listeners + real-time subscription
  useEffect(() => {
    const handleOnline = () => {
      setIsReconnecting(false);
      refetch();
      toast.success("Sync service reconnected");
    };
    const handleOffline = () => {
      setIsReconnecting(true);
      toast.error("Lost connection. Sync is currently offline.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!userId) {
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }

    const dbId = AppwriteConfig.databaseId;
    const unsubscribe = client.subscribe([
      `databases.${dbId}.collections.${CALL_LOGS_COLLECTION_ID}.documents`,
      `databases.${dbId}.collections.${SMS_LOGS_COLLECTION_ID}.documents`,
      `databases.${dbId}.collections.${ACTIVITY_LOGS_COLLECTION_ID}.documents`,
      `databases.${dbId}.collections.${DEVICES_COLLECTION_ID}.documents`
    ], (response) => {
      const events = response.events;
      const payload = response.payload as any;
      if (payload.user_id !== userId) return;

      // 1. CALLS REALTIME — update overlay counts
      if (events.some(e => e.includes(CALL_LOGS_COLLECTION_ID))) {
        if (events.some(e => e.endsWith(".create"))) {
          setRtCounts(prev => {
            const base = prev ?? { totalCalls, missedCalls, answeredCalls, totalSMS, unreadSMS, readSMS, lastSyncTime };
            return {
              ...base,
              totalCalls: base.totalCalls + 1,
              missedCalls: payload.log_type === "missed_call" ? base.missedCalls + 1 : base.missedCalls,
              answeredCalls: payload.log_type !== "missed_call" ? base.answeredCalls + 1 : base.answeredCalls,
              lastSyncTime: new Date().toISOString(),
            };
          });
          setRtRecentCalls(prev => [payload, ...(prev ?? recentCalls)].slice(0, 5));
        }
      }

      // 2. SMS REALTIME
      if (events.some(e => e.includes(SMS_LOGS_COLLECTION_ID))) {
        if (events.some(e => e.endsWith(".create"))) {
          setRtCounts(prev => {
            const base = prev ?? { totalCalls, missedCalls, answeredCalls, totalSMS, unreadSMS, readSMS, lastSyncTime };
            return {
              ...base,
              totalSMS: base.totalSMS + 1,
              unreadSMS: !payload.is_read ? base.unreadSMS + 1 : base.unreadSMS,
              readSMS: payload.is_read ? base.readSMS + 1 : base.readSMS,
              lastSyncTime: new Date().toISOString(),
            };
          });
          setRtRecentSMS(prev => [payload, ...(prev ?? recentSMS)].slice(0, 5));
        }
      }

      // 3. ACTIVITY REALTIME
      if (events.some(e => e.includes(ACTIVITY_LOGS_COLLECTION_ID))) {
        if (events.some(e => e.endsWith(".create"))) {
          setRtRecentActivity(prev => [payload, ...(prev ?? recentActivity)].slice(0, 10));
        }
      }

      // 4. DEVICES REALTIME
      if (events.some(e => e.includes(DEVICES_COLLECTION_ID))) {
        if (events.some(e => e.endsWith(".create"))) {
          setRtDevices(prev => [...(prev ?? devices), payload]);
          toast.success(`New device linked: ${payload.device_name}`);
        } else if (events.some(e => e.endsWith(".update"))) {
          setRtDevices(prev => (prev ?? devices).map(d => d.$id === payload.$id ? payload : d));
          if (payload.last_sync) setRtCounts(prev => ({ ...(prev ?? { totalCalls, missedCalls, answeredCalls, totalSMS, unreadSMS, readSMS, lastSyncTime }), lastSyncTime: payload.last_sync }));
        } else if (events.some(e => e.endsWith(".delete"))) {
          setRtDevices(prev => (prev ?? devices).filter(d => d.$id !== payload.$id));
        }
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [userId, fetchDashboardData]);

  // Helper to render contact card (handles unknown contact name)
  const renderContactItem = (contactName: string | null, number: string) => {
    if (contactName) {
      return (
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-dashboard-card-text">{contactName}</div>
          <div className="truncate text-xs text-muted-foreground mt-0.5">{number}</div>
        </div>
      );
    }
    return (
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-dashboard-card-text">{number}</div>
        <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-muted-foreground mt-1 uppercase">
          Unknown
        </span>
      </div>
    );
  };

  // ── RENDER SKELETONS: only on true first load (no cached data yet) ───────
  if (isLoading && !data) {
    return (
      <PageLayout breadcrumbs={breadcrumbs}>
        <div className="space-y-6 animate-pulse">
          {/* Status banner skeleton */}
          <div className="h-28 w-full rounded-3xl bg-slate-200" />
          {/* Quick links skeleton */}
          <div className="flex gap-3 h-12" />
          {/* Stats grid skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 rounded-3xl bg-slate-200" />
            ))}
          </div>
          {/* Double column skeleton */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-[400px] rounded-3xl bg-slate-200 lg:col-span-2" />
            <div className="h-[400px] rounded-3xl bg-slate-200" />
          </div>
        </div>
      </PageLayout>
    );
  }

  // ── RENDER ERROR STATE ─────────────────────────────────────────────────
  if (isError && !data) {
    return (
      <PageLayout breadcrumbs={breadcrumbs}>
        <Card className="border-rose-100 bg-rose-50/20 p-8 text-center rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 border border-rose-100">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Failed to load dashboard</h3>
            <p className="mt-2 text-sm font-medium text-slate-500 max-w-md">{errorMsg}</p>
            <Button 
              onClick={() => refetch()} 
              className="mt-6 bg-primary hover:bg-blue-700 text-white rounded-xl px-5 font-semibold transition shadow-md"
            >
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // ── 1. EMPTY STATE (No devices linked) ──────────────────────────────────
  if (devices.length === 0) {
    return (
      <PageLayout breadcrumbs={breadcrumbs}>
        {/* Reconnecting banner */}
        {isReconnecting && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-100/50 p-4 text-sm font-semibold text-amber-700 animate-pulse">
            <WifiOff className="h-4 w-4 shrink-0" />
            Reconnecting to sync service...
          </div>
        )}

        <div className="space-y-6 font-secondary-sans">
          {/* Main Empty state card */}
          <Card className="border border-dashboard-border/60 shadow-badge-blue rounded-[2.25rem] bg-white overflow-hidden p-6 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
              
              {/* Left Column Text & Buttons */}
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100/50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <Signal className="h-3.5 w-3.5" />
                  System Initialization
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl leading-tight font-serif">
                  Ready to Start <br className="hidden sm:inline" />
                  Monitoring?
                </h2>

                <p className="text-muted-foreground text-[15px] tracking-wide leading-relaxed max-w-md">
                  Connect your Android device to begin syncing calls, SMS, and real-time activity logs to your command center. Once linked, data will appear here automatically.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button 
                    onClick={() => setIsDownloadModalOpen(true)}
                    className="h-14 bg-btn-primary-gradient shadow-btn-primary hover:opacity-95 text-white rounded-xl transition flex items-center gap-2 px-8 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    DOWNLOAD ANDROID APK
                  </Button>
                  <Button 
                    onClick={() => setIsDownloadModalOpen(true)}
                    variant="outline"
                    className="h-14 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition flex items-center gap-2 px-6"
                  >
                    View Setup Guide
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Button>
                </div>

                <Separator className="bg-slate-100 my-6" />

                {/* Micro highlights */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-primary" /> Secure Tunnel
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-1">End-to-end encrypted</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-primary" /> Real-time
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-1">Low-latency log delivery</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 text-primary" /> Auto-Sync
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-1">Background data processing</p>
                  </div>
                </div>
              </div>

              {/* Right Column Premium Mockup Illustration */}
              <div className="flex-1 mt-10 lg:mt-0 relative flex items-center justify-center min-h-[240px] border border-slate-100/50 rounded-3xl p-6 overflow-visible">
                <div className="relative flex items-center justify-center">
                  {/* Premium local image asset */}
                  <img 
                    src={phoneLaptopMockup} 
                    alt="Laptop and Smartphone Mockup" 
                    className="object-contain max-h-[400px] w-auto relative z-10" 
                  />

                  {/* Floating Glassmorphic Badge 1: Sync Status */}
                  <div className="absolute bottom-[20%] -left-12 z-20 bg-white/70 backdrop-blur-sm border border-white/20 shadow-badge-blue rounded-2xl p-3 flex items-center gap-3 animate-float-medium max-w-[170px] select-none">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[9px] font-bold text-muted-foreground tracking-wider uppercase">SYNC STATUS</span>
                      <span className="block text-xs font-bold text-slate-800 mt-0.5 truncate">100% Complete</span>
                    </div>
                  </div>

                  {/* Floating Glassmorphic Badge 2: Recent Call */}
                  <div className="absolute top-[25%] -right-12 z-20 bg-white/70 backdrop-blur-sm border border-white/20 shadow-badge-blue rounded-2xl p-3 flex items-center gap-3 animate-float-slow max-w-[170px] select-none">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[9px] font-bold text-muted-foreground tracking-wider uppercase">RECENT CALL</span>
                      <span className="block text-xs font-bold text-slate-800 mt-0.5 truncate">Incoming...</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </Card>

          {/* Background Stability Advisory Row */}
          <div className="text-[12px] tracking-wide font-semibold text-slate-500 leading-relaxed select-none pl-4 py-1">
            <span className="text-[#1A1A2B] font-bold">Background Stability Advisory:</span> Disable battery optimization for the CallBridge Android app to ensure a smooth, uninterrupted monitoring experience.
          </div>

          {/* Sub Panels row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent Activity Skeletal Loader Card */}
            <Card className="border border-dashboard-border/60 shadow-badge-blue rounded-3xl bg-white lg:col-span-2">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900">Recent Activity</CardTitle>
                <span className="text-xs text-muted-foreground">No data yet</span>
              </CardHeader>
              <CardContent className="py-6 px-6 space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    {/* Circular Avatar Placeholder */}
                    <div className="h-11 w-11 rounded-full bg-slate-100/80 border border-slate-100 shrink-0" />
                    
                    {/* Text Lines Placeholders */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-3.5 w-1/3 bg-slate-100/80 rounded" />
                      <div className="h-3 w-1/2 bg-slate-100/50 rounded" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Device connection card */}
            <Card className="border border-dashboard-border/60 shadow-badge-blue rounded-3xl bg-white flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">Device Connection</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 border border-slate-200/50 text-muted-foreground mb-4">
                  <Smartphone className="h-5.5 w-5.5" />
                </div>
                <p className="text-sm font-bold text-slate-900">Device Connection</p>
                <p className="text-xs text-muted-foreground mt-1.5 px-6 leading-relaxed">
                  No device currently linked to this workstation
                </p>
              </CardContent>
              <CardFooter className="pt-0 pb-6 flex justify-center">
                <button 
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="text-xs font-bold text-primary hover:text-blue-700 hover:underline transition flex items-center gap-1"
                >
                  Pair a device now
                  <ChevronRight className="h-4 w-4" />
                </button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Setup Steps Modal */}
        <SetupModal 
          isOpen={isDownloadModalOpen} 
          onClose={() => setIsDownloadModalOpen(false)} 
        />
      </PageLayout>
    );
  }

  // ── 2. ACTIVE STATE (Linked devices exist) ──────────────────────────────
  const primaryDevice = devices[0];

  // Helper to format log times for calls and sms
  const formatLogTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = date.toDateString() === yesterday.toDateString();

      const timeStr = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true });

      if (isToday) {
        return { primary: timeStr, secondary: "Today" };
      }
      if (isYesterday) {
        return { primary: "Yesterday", secondary: timeStr };
      }
      
      const dateStr = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      return { primary: dateStr, secondary: timeStr };
    } catch (e) {
      return { primary: "Unknown", secondary: "" };
    }
  };

  const formatStatCount = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num.toString();
  };

  const displayCalls = recentCalls.slice(0, 3);
  const displaySMS = recentSMS.slice(0, 3);

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      {/* Reconnecting banner */}
      {isReconnecting && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-100/50 p-4 text-sm font-semibold text-amber-700 animate-pulse">
          <WifiOff className="h-4 w-4 shrink-0" />
          Reconnecting to sync service...
        </div>
      )}

      <div className="space-y-6">
        
        {/* Device Monitoring Active Banner (100% Width) */}
        <div className="w-full bg-banner-gradient border border-blue-500/10 text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
          {/* Subtle wave highlight */}
          <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
          
          <div className="flex items-center gap-4 z-10">
            <img src={active} alt="Active Monitoring" className="h-12 w-12" />
            
            <div className="min-w-0">
              <h3 className="text-lg font-bold tracking-tight">Device Monitoring Active</h3>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-white/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live pulse active
                </span>
                <span className="text-white/30 text-[11px] hidden sm:inline">|</span>
                <span className="flex items-center gap-1 text-white/85">
                  <Clock className="h-3.5 w-3.5 opacity-80" />
                  System synchronized {lastSyncTime ? formatRelativeTime(lastSyncTime) : "just now"}
                </span>
              </div>
            </div>
          </div>

          {/* Enterprise Plan Pill Card */}
          <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 flex flex-col items-start sm:items-end text-left sm:text-right shadow-sm z-10 self-stretch sm:self-auto justify-center">
            <span className="text-[9px] font-bold tracking-widest text-white/70 uppercase">COMING SOON</span>
            <span className="text-xs font-bold text-white mt-0.5">Enterprise Plan Premium</span>
          </div>
        </div>

        {/* Customized Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Calls */}
          <div className="relative overflow-hidden  bg-white border border-dashboard-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[20px] p-6 w-full flex flex-col justify-between transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.05)] h-[210px]">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-primary">
                <img src={dashcall} alt="dash call" className="h-5 w-5" />
                
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-primary border border-blue-100">+12%</span>
            </div>
            <div className="mt-auto">
              <p className="text-xs font-medium text-muted-foreground">Total Calls</p>
              <div className="text-[2.5rem] font-bold text-primary tracking-tight leading-none mt-1">{totalCalls.toLocaleString()}</div>
            </div>
            <div className="w-full mt-4">
              <div className="h-px bg-slate-50 w-full mb-3" />
              <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> {formatStatCount(answeredCalls)} Answered</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> {formatStatCount(missedCalls)} Missed</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total SMS */}
          <div className="relative overflow-hidden bg-white border border-dashboard-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[20px] p-6 w-full flex flex-col justify-between transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.05)] h-[210px]">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-primary">
                <img src={dashsms} alt="dash sms" className="h-5 w-5" />
                
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-primary border border-blue-100">
                {unreadSMS > 0 ? `New (${unreadSMS})` : "New (4)"}
              </span>
            </div>
            <div className="mt-auto">
              <p className="text-xs font-medium text-muted-foreground">Total SMS</p>
              <div className="text-[2.5rem] font-bold text-primary tracking-tight leading-none mt-1">{totalSMS.toLocaleString()}</div>
            </div>
            <div className="w-full mt-4">
              <div className="h-px bg-slate-50 w-full mb-3" />
              <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> {formatStatCount(readSMS)} Read</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#1e293b]" /> {formatStatCount(unreadSMS)} Unread</span>
              </div>
            </div>
          </div>

          {/* Card 3: Primary Active Device */}
          <div className="relative overflow-hidden bg-white border border-dashboard-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[20px] p-6 w-full flex flex-col justify-between transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.05)] h-[210px]">
            {/* Watermark smartphone */}
            <div className="absolute right-[-12px] bottom-[-12px] opacity-[0.025] text-slate-900 pointer-events-none">
              <img src={dashAndroid} alt = "Dash Android" className="h-26 w-32" />
            
            </div>
            <div className="flex items-center justify-between z-10">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100 text-amber-600">
                <Smartphone className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#090d16] border border-slate-800 px-2.5 py-1 text-[10px] font-bold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Connected
              </span>
            </div>
            <div className="mt-auto z-10">
              <p className="text-xs font-medium text-muted-foreground">Primary Active Device</p>
              <div className="text-lg font-bold text-slate-900 tracking-tight leading-tight mt-1 truncate">
                {primaryDevice?.device_name || "Samsung Galaxy S23"}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {primaryDevice?.android_version ? `Android ${primaryDevice.android_version}` : "Android 14"}
              </p>
            </div>
            <div className="w-full mt-4 z-10">
              <div className="h-px bg-slate-50 w-full mb-3" />
              <div className="text-[10px] text-muted-foreground italic">
                Last sync: {primaryDevice?.last_sync ? formatRelativeTime(primaryDevice.last_sync) : "2 mins ago"}
              </div>
            </div>
          </div>

          {/* Card 4: System Health */}
          <div className="relative overflow-hidden bg-white border border-dashboard-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[20px] p-6 w-full flex flex-col justify-between transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.05)] h-[210px]">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100 text-amber-600">
                <img src={syshealth} alt="System Health" className="h-7 w-7" />
    
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-xs font-medium text-muted-foreground">System Health</p>
              <div className="text-[2.5rem] font-bold text-slate-900 tracking-tight leading-none mt-1">99.8%</div>
            </div>
            <div className="w-full mt-4">
              <div className="h-px bg-slate-50 w-full mb-3" />
              <div className="space-y-2 w-full">
                <div className="text-[10px] text-muted-foreground">All services operational</div>
                <div className="flex gap-1 h-1.5 w-full">
                  <div className="flex-1 bg-emerald-500 rounded-full" />
                  <div className="flex-1 bg-emerald-500 rounded-full" />
                  <div className="flex-1 bg-emerald-500 rounded-full" />
                  <div className="flex-1 bg-emerald-500 rounded-full" />
                  <div className="flex-1 bg-amber-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Split Layout: Logs left, terminal phone mockup right */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
          {/* Left Column (spans 2 cols): Logs list & Advisory */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Logs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Recent Calls Card */}
              <div className="border border-dashboard-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl bg-white flex flex-col justify-between overflow-hidden p-6">
                <div className="pb-3 flex flex-row items-center justify-between mb-3">
                  <h4 className="text-sm text-foreground flex items-center gap-2">
                    <img src={subcall} alt="Subcall" className="h-4.5 w-4.5" />

                    Recent Calls
                  </h4>
                  <Link to="/calls" className="text-xs font-bold text-primary hover:underline transition flex items-center">
                    View All
                  </Link>
                </div>
                
                <div className="flex-1">
                  {displayCalls.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground text-xs font-medium">No call logs synced yet.</div>
                  ) : (
                    <div className="space-y-5">
                      {displayCalls.map((log) => {
                        const isMissed = log.log_type === "missed_call";
                        const timeInfo = formatLogTime(log.timestamp);
                        return (
                          <div key={log.$id} className="flex items-center gap-4 hover:bg-slate-55/30 transition rounded-2xl p-1 -m-1">
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                              isMissed ? "bg-rose-50 text-rose-500 border border-rose-100" : "bg-emerald-50 text-emerald-500 border border-emerald-100"
                            }`}>
                              {isMissed ? <img src={missedcall} alt="Missed Call" className="h-4 w-4" /> : <img src={answeredcall} alt="Answered Call" className="h-4 w-4" />}
                            </div>
                            
                            {renderContactItem(log.contact_name, log.caller_number || log.phone_number)}
                            
                            <div className="text-right shrink-0">
                              <div className="text-xs font-semibold text-dashboard-card-text">{timeInfo.primary}</div>
                              <div className="text-[10px] font- text-muted-foreground mt-0.5">{timeInfo.secondary}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent SMS Card */}
              <div className="border border-dashboard-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl bg-white flex flex-col justify-between overflow-hidden p-6">
                <div className="pb-3 flex flex-row items-center justify-between mb-3">
                  <h4 className="text-sm text-foreground flex items-center gap-2">
                    <img src={subsms} alt="Subsms" className="h-4.5 w-4.5" />
                    Recent SMS
                  </h4>
                  <Link to="/sms" className="text-xs font-bold text-primary hover:underline transition flex items-center">
                    View All
                  </Link>
                </div>
                
                <div className="flex-1">
                  {displaySMS.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground text-xs font-medium">No SMS logs synced yet.</div>
                  ) : (
                    <div className="">
                      {displaySMS.map((sms) => {
                        const isUnread = !sms.is_read;
                        const timeInfo = formatLogTime(sms.timestamp);
                        const cardClass = isUnread 
                          ? "border-b border-dashboard-border/60 rounded-2xl py-4 flex items-center gap-4 transition hover:bg-dashboard-unread/[0.02]"
                          : "bg-white border-b border-dashboard-border/60 rounded-2xl py-4 flex items-center gap-4 transition hover:bg-slate-55/50";
                        return (
                          <div key={sms.$id} className={cardClass}>
                            <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                              isUnread ? "text-dashboard-unread border border-dashboard-unread/20" : "bg-slate-100/50 text-dashboard-muted border border-slate-200/40"
                            }`}>
                              <MessageSquare className="h-4.5 w-4.5" />
                              {isUnread && (
                                <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-dashboard-unread border-2 border-white" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate text-sm font-semibold text-dashboard-text">
                                  {sms.contact_name || sms.caller_number || sms.phone_number}
                                </span>
                              </div>
                              <p className="truncate text-xs font-normal text-dashboard-muted mt-0.5">
                                {sms.message_body || "No message body"}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <div className={`text-xs font-semibold ${isUnread ? "text-dashboard-unread" : "text-dashboard-text"}`}>{timeInfo.primary}</div>
                              <div className={`text-[9px] font-semibold mt-0.5 uppercase tracking-wider ${isUnread ? "text-dashboard-unread" : "text-dashboard-muted"}`}>
                                {isUnread ? "Unread" : "Read"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Background Stability Advisory Card */}
            <div className="border border-dashboard-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white rounded-3xl p-6 flex flex-col gap-4 mt-auto">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-primary">
                 <img src={battery} alt="Battery" className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">Background Stability Advisory</h4>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                    Disable battery optimization for the CallBridge Android app to ensure a smooth, uninterrupted monitoring experience.
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-50/50 border border-dashboard-border/40 rounded-2xl p-4 text-[11px] font-medium text-muted-foreground italic">
                Note: Android system restrictions may silently terminate background services if battery optimization remains active.
              </div>
              
              <div className="flex">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3.5 py-1.5 text-[10px] font-bold text-primary uppercase tracking-wide">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Recommended Action Required
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Tall futuristic terminal phone mockup */}
          <div className="lg:col-span-1 flex">
            <div className="relative rounded-[32px] bg-[#030712] p-6 text-white font-mono flex flex-col justify-between shadow-2xl border border-slate-900 overflow-hidden w-full flex-1 min-h-[480px]">
              {/* Ambient glows inside card */}
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

              {/* Terminal Header */}
              <div className="z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4.5 w-4.5 text-blue-400" />
                    <span className="text-[13px] font-bold tracking-wide">MONITORING NODE v4.2</span>
                  </div>
                  <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[8px] font-bold tracking-widest text-cyan-400 uppercase">
                    Encrypted
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5">ID: B82-XCA-001 /</div>
              </div>

              {/* Main Terminal Metrics */}
              <div className="space-y-6 my-6 z-10 flex-1 flex flex-col justify-center">
                {/* Live Intercepts */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-[9px] font-bold tracking-wider text-slate-500 uppercase">
                    <span>Live Intercepts</span>
                    <span className="text-cyan-400 animate-pulse flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-cyan-400" /> Listening...
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Call Feed */}
                    <div className="rounded-2xl bg-[#090d16] border border-slate-800/60 p-3.5 flex flex-col gap-1.5">
                      <span className="text-[8px] font-bold text-slate-500 uppercase">Call Feed</span>
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ACTIVE
                      </span>
                    </div>
                    {/* SMS Sniffer */}
                    <div className="rounded-2xl bg-[#090d16] border border-slate-800/60 p-3.5 flex flex-col gap-1.5">
                      <span className="text-[8px] font-bold text-slate-500 uppercase">SMS Sniffer</span>
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        READY
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tunnel Pipeline */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-[9px] font-bold tracking-wider text-slate-500 uppercase">
                    <span>Tunnel Pipeline</span>
                    <span className="text-blue-400 font-bold">Stable Link</span>
                  </div>

                  <div className="rounded-2xl bg-[#090d16] border border-slate-800/60 p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                        <span>Signal Integrity</span>
                        <span className="text-blue-400">98.4%</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "98.4%" }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase">TX Latency</div>
                        <div className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-1">
                          <Signal className="h-3.5 w-3.5 text-blue-500 shrink-0" /> 42ms
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase">RX Latency</div>
                        <div className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-1">
                          <Signal className="h-3.5 w-3.5 text-blue-500 shrink-0" /> 12ms
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refresh action button & smartphone layout elements */}
              <div className="z-10 mt-auto">
                <Button
                  onClick={handleTerminalRefresh}
                  disabled={isRefreshingTerminal}
                  className="h-12 w-full bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-[#030712] rounded-2xl font-extrabold flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-500/10 uppercase tracking-wider text-xs"
                >
                  <RefreshCw className={`h-4 w-4 shrink-0 ${isRefreshingTerminal ? "animate-spin" : ""}`} />
                  Re-fresh
                </Button>
                <p className="text-center text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-2">
                  To Receive Latest Logs
                </p>
                
                {/* Phone Bottom Notch & Indicator */}
                <div className="flex gap-1.5 justify-center mt-5">
                  <div className="w-1 h-1 rounded-full bg-slate-800" />
                  <div className="w-1 h-1 rounded-full bg-slate-800" />
                  <div className="w-1 h-1 rounded-full bg-slate-800" />
                </div>
                <div className="w-20 h-1 bg-slate-800 rounded-full mx-auto mt-3.5" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Setup Steps Modal */}
      <SetupModal 
        isOpen={isDownloadModalOpen} 
        onClose={() => setIsDownloadModalOpen(false)} 
      />
    </PageLayout>
  );
}

// ── SETUP & DOWNLOAD STEPS MODAL COMPONENT ──────────────────────────────
function SetupModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const steps = [
    {
      id: 1,
      title: "Download the APK",
      desc: "from our secure portal.",
      icon: Download,
    },
    {
      id: 2,
      title: "Create an Account",
      desc: "to secure your command center credentials.",
      icon: user ? CheckCircle2 : Smartphone,
    },
    {
      id: 3,
      title: "Grant the necessary permissions",
      desc: "for bridging.",
      icon: Shield,
    },
    {
      id: 4,
      title: "View real-time data",
      desc: "flowing to your dashboard.",
      icon: Activity,
    }
  ];

  return (
    <CustomModal
      isOpen={isOpen}
      onOpenChange={onClose}
      onClose={onClose}
      size="lg"
      radius="lg"
      classNames={{
        base: "bg-white border-slate-100 rounded-2xl relative max-w-lg shadow-2xl font-inter overflow-hidden",
        closeButton: "top-6 right-6 h-8 w-8 rounded-full hover:bg-slate-50 text-muted-foreground hover:text-slate-600 transition flex items-center justify-center border-none p-0 z-[99] text-[16px]",
        body: "p-8 py-10 overflow-y-auto"
      }}
      body={
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-primary border border-blue-100 shadow-sm shadow-blue-500/5">
              <Download className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-950">
              Download the App. <br />
              Start Monitoring Today.
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              The CallBridge Android agent is lightweight, battery-efficient, and runs silently in the background. Setup takes very few minutes.
            </p>
          </div>

          {/* Steps List */}
          <div className="space-y-3.5">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center gap-4 rounded-2xl bg-slate-50/60 p-4 border border-slate-50">
                  {/* Far Left Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 border border-slate-200/40">
                    <Icon className={`h-5 w-5 ${step.id === 2 && user ? "text-primary" : "text-slate-500"}`} />
                  </div>

                  {/* Middle Step badge */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold text-xs shadow-sm shadow-blue-500/10">
                    {step.id}
                  </div>

                  {/* Right Title & Desc stacked */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-slate-900 leading-snug">{step.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Safety Banner */}
          <div className="rounded-2xl bg-blue-50/40 p-4 border border-blue-50/50 flex items-start gap-3">
            <Shield className="h-5 w-5 text-[#005EA1] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="block text-xs font-bold text-blue-750 leading-none">Secure. Reliable. Built for your peace of mind.</span>
              <span className="block text-[10px] font-semibold text-primary/85 mt-1 leading-normal">Your data is encrypted and always protected.</span>
            </div>
          </div>

          {/* Button to simulate APK download */}
          <div className="flex justify-center">
            <Button
              onClick={() => {
                toast.success("Downloading CallBridge Android APK...");
                setTimeout(() => {
                  toast.success("APK Download completed!");
                }, 1500);
              }}
              className="h-12 bg-btn-primary-gradient shadow-btn-primary hover:opacity-95 text-white rounded-full font-bold w-full transition uppercase tracking-wider text-xs"
            >
              Start Download
            </Button>
          </div>

          {/* Styles for animations */}
          <style>{`
            @keyframes float-slow {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            @keyframes float-medium {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-12px); }
            }
            @keyframes bounce-horizontal {
              0%, 100% { transform: translateX(0); }
              50% { transform: translateX(4px); }
            }
            .animate-float-slow {
              animation: float-slow 6s ease-in-out infinite;
            }
            .animate-float-medium {
              animation: float-medium 5s ease-in-out infinite;
            }
            .animate-bounce-horizontal {
              animation: bounce-horizontal 1s ease-in-out infinite;
            }
            .animate-spin-slow {
              animation: spin 8s linear infinite;
            }
          `}</style>
        </div>
      }
    />
  );
}
