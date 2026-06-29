import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { databases, client, AppwriteConfig, ACTIVITY_LOGS_COLLECTION_ID, DEVICES_COLLECTION_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Pause, 
  RefreshCw, 
  AlertCircle, 
  LogOut, 
  Activity, 
  Phone, 
  MessageSquare, 
  Shield, 
  Loader2, 
  WifiOff, 
  Clock, 
  ChevronDown,
  Sliders,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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

// Activity type to Config Mapping (Icon, Color, Title, Badge, BadgeColor)
const getActivityConfig = (type: string) => {
  switch (type) {
    case "device_registered":
      return { 
        icon: Smartphone, 
        iconColor: "text-blue-500", 
        title: "Device registered", 
        badge: "NETWORK", 
        badgeColor: "bg-blue-50 text-blue-700 border border-blue-100" 
      };
    case "monitoring_started":
      return { 
        icon: Sliders, 
        iconColor: "text-blue-500", 
        title: "Monitoring enabled", 
        badge: "SYSTEM", 
        badgeColor: "bg-blue-50 text-blue-700 border border-blue-100" 
      };
    case "monitoring_stopped":
    case "monitoring_toggled_web":
      return { 
        icon: Pause, 
        iconColor: "text-rose-500", 
        title: "Monitoring paused", 
        badge: "MANUAL ACTION", 
        badgeColor: "bg-rose-50 text-rose-700 border border-rose-100" 
      };
    case "sync_completed":
      return { 
        icon: RefreshCw, 
        iconColor: "text-[#3B82F6]", 
        title: "Logs synchronized", 
        badge: "COMPLETED", 
        badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-100" 
      };
    case "sync_failed":
      return { 
        icon: AlertCircle, 
        iconColor: "text-rose-500", 
        title: "Synchronization failed", 
        badge: "WARNING", 
        badgeColor: "bg-rose-50 text-rose-700 border border-rose-100" 
      };
    case "session_ended":
      return { 
        icon: LogOut, 
        iconColor: "text-slate-500", 
        title: "Session ended", 
        badge: "SECURITY", 
        badgeColor: "bg-slate-50 text-slate-700 border border-slate-150" 
      };
    case "permission_revoked":
    case "permission_warning":
      return { 
        icon: AlertTriangle, 
        iconColor: "text-amber-555", 
        title: "Permission warning", 
        badge: "ATTENTION", 
        badgeColor: "bg-amber-50 text-amber-700 border border-amber-100" 
      };
    
    // Call & SMS specific logs
    case "incoming_call":
    case "call_logged":
      return {
        icon: Phone,
        iconColor: "text-[#3B82F6]",
        title: "Incoming call detected",
        badge: "SUCCESS",
        badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-100"
      };
    case "sms_logged":
    case "sms_synchronized":
    case "sms_synced":
      return {
        icon: MessageSquare,
        iconColor: "text-[#3B82F6]",
        title: "SMS synchronized",
        badge: "COMPLETED",
        badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-100"
      };
    case "password_updated":
      return {
        icon: Shield,
        iconColor: "text-blue-500",
        title: "Password updated",
        badge: "SECURITY",
        badgeColor: "bg-blue-50 text-blue-700 border border-blue-100"
      };
      
    // Fallback default
    default:
      return { 
        icon: Activity, 
        iconColor: "text-blue-500", 
        title: "System Event", 
        badge: "SYSTEM", 
        badgeColor: "bg-blue-50 text-blue-700 border border-blue-100" 
      };
  }
};

export default function ActivityLogsPage() {
  const { user } = useAuth();
  const userId = user?.$id;
  const queryClient = useQueryClient();

  // States
  const [logs, setLogs] = useState<any[]>([]);
  const [deviceMap, setDeviceMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(!navigator.onLine);
  const [selectedType, setSelectedType] = useState<string>("all");

  
  // Stats summary headers
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    if (selectedType === "all") return logs;
    if (selectedType === "calls") {
      return logs.filter(l => l.activity_type === "incoming_call" || l.activity_type === "call_logged");
    }
    if (selectedType === "sms") {
      return logs.filter(l => l.activity_type === "sms_logged" || l.activity_type === "sms_synchronized" || l.activity_type === "sms_synced");
    }
    if (selectedType === "system") {
      return logs.filter(l => l.activity_type === "device_registered" || l.activity_type === "monitoring_started" || l.activity_type === "monitoring_stopped" || l.activity_type === "session_ended");
    }
    if (selectedType === "warnings") {
      return logs.filter(l => l.activity_type === "sync_failed" || l.activity_type === "permission_revoked" || l.activity_type === "permission_warning");
    }
    return logs.filter(l => l.activity_type === selectedType);
  }, [logs, selectedType]);


  // References
  const lastDocIdRef = useRef<string | null>(null);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  // ── useQuery: devices (cached, shared with other pages) ────────────────────
  const { data: devicesQueryData } = useQuery({
    queryKey: ["devices", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await databases.listDocuments(AppwriteConfig.databaseId, DEVICES_COLLECTION_ID, [
        Query.equal("user_id", userId)
      ]);
      return res.documents;
    },
    enabled: !!userId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // Sync device map from query result
  useEffect(() => {
    if (devicesQueryData) {
      const map = new Map<string, string>();
      devicesQueryData.forEach(d => map.set(d.$id, d.device_name));
      setDeviceMap(map);
      if (devicesQueryData.length > 0) {
        setIsMonitoringActive(devicesQueryData.some(d => d.monitoring_status === true));
        const syncTimes = devicesQueryData.map(d => d.last_sync).filter(Boolean).map(t => new Date(t).getTime());
        if (syncTimes.length > 0) setLastSyncTime(new Date(Math.max(...syncTimes)).toISOString());
      }
    }
  }, [devicesQueryData]);

  // Fetch initial activity logs page
  const fetchInitialLogs = useCallback(async (silent = false) => {
    if (!userId) return;
    if (!silent) setIsLoading(true);
    setError(null);
    lastDocIdRef.current = null;

    try {
      const dbId = AppwriteConfig.databaseId;
      const res = await databases.listDocuments(dbId, ACTIVITY_LOGS_COLLECTION_ID, [
        Query.equal("user_id", userId),
        Query.orderDesc("timestamp"),
        Query.limit(20)
      ]);

      setLogs(res.documents);
      setHasMore(res.documents.length === 20);

      if (res.documents.length > 0) {
        lastDocIdRef.current = res.documents[res.documents.length - 1].$id;
      }
    } catch (err: any) {
      console.error("Error fetching initial activity logs:", err);
      setError(err?.message || "Failed to load activity logs.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch next page (infinite scroll)
  const fetchNextLogs = useCallback(async () => {
    if (!userId || isFetchingMore || !hasMore || !lastDocIdRef.current) return;

    setIsFetchingMore(true);
    setError(null);

    try {
      const dbId = AppwriteConfig.databaseId;
      const res = await databases.listDocuments(dbId, ACTIVITY_LOGS_COLLECTION_ID, [
        Query.equal("user_id", userId),
        Query.orderDesc("timestamp"),
        Query.limit(20),
        Query.cursorAfter(lastDocIdRef.current)
      ]);

      if (res.documents.length > 0) {
        setLogs(prev => {
          const combined = [...prev, ...res.documents];
          const map = new Map();
          return combined.filter(item => {
            if (map.has(item.$id)) return false;
            map.set(item.$id, true);
            return true;
          });
        });
        lastDocIdRef.current = res.documents[res.documents.length - 1].$id;
        setHasMore(res.documents.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      console.error("Error fetching next page of activity logs:", err);
      toast.error("Failed to load more logs. Tap retry below.");
    } finally {
      setIsFetchingMore(false);
    }
  }, [userId, isFetchingMore, hasMore]);

  // Mount logic: only fetch initial logs (devices come from useQuery)
  useEffect(() => {
    fetchInitialLogs();
  }, [fetchInitialLogs]);

  // Browser online/offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsReconnecting(false);
      fetchInitialLogs();
      toast.success("Sync connection active!");
    };
    const handleOffline = () => {
      setIsReconnecting(true);
      toast.error("Offline. Activity logs synchronization paused.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchInitialLogs]);

  // Setup Appwrite real-time subscriptions to prepend activity logs instantly
  useEffect(() => {
    if (!userId) return;

    const dbId = AppwriteConfig.databaseId;
    
    // 1. Subscribe to activity logs collection
    const unsubscribeLogs = client.subscribe(
      `databases.${dbId}.collections.${ACTIVITY_LOGS_COLLECTION_ID}.documents`,
      (response) => {
        const events = response.events;
        const payload = response.payload as any;

        if (payload.user_id !== userId) return;

        if (events.some(e => e.endsWith(".create"))) {
          setLogs(prev => {
            if (prev.some(l => l.$id === payload.$id)) return prev;
            return [payload, ...prev];
          });
        }
      }
    );

    // 2. Subscribe to devices collection to keep header statuses synced
    const unsubscribeDevices = client.subscribe(
      `databases.${dbId}.collections.${DEVICES_COLLECTION_ID}.documents`,
      (response) => {
        const payload = response.payload as any;
        if (payload.user_id !== userId) return;
        queryClient.invalidateQueries({ queryKey: ["devices", userId] });
      }
    );

    return () => {
      unsubscribeLogs();
      unsubscribeDevices();
    };
  }, [userId, queryClient]);

  // Setup IntersectionObserver for infinite scroll trigger
  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "100px",
      threshold: 0.1
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading && !isFetchingMore) {
        fetchNextLogs();
      }
    };

    const observer = new IntersectionObserver(handleIntersect, option);
    const currentTarget = observerTargetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, isFetchingMore, fetchNextLogs]);

  // Helper to join device name from map
  const getDeviceName = (log: any) => {
    if (log.device_id) {
      return deviceMap.get(log.device_id) || "Unknown Device";
    }
    return log.device_name || "Unknown Device";
  };

  return (
    <PageLayout 
      title="Activity Logs" 
      subtitle="Track important monitoring and synchronization events across your connected Android device."
      filterSlot={
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="relative flex items-center gap-2 rounded-lg bg-white border border-dashboard-border/60 px-4 py-2.5 h-auto text-xs font-bold text-[#1A1A2B] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:bg-slate-50 transition duration-200 w-auto focus:outline-none focus:ring-0">
            <SelectValue placeholder="All Activities" />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-xl shadow-lg">
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="calls">Calls Activity</SelectItem>
            <SelectItem value="sms">SMS Activity</SelectItem>
            <SelectItem value="system">System Events</SelectItem>
            <SelectItem value="warnings">Warnings & Issues</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      {/* Offline Alert Banner */}
      {isReconnecting && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-100/50 p-4 text-sm font-semibold text-amber-700 animate-pulse">
          <WifiOff className="h-4 w-4 shrink-0" />
          Offline. Activity feeds are currently paused.
        </div>
      )}

      <div className="space-y-6">
        {/* TOP STATUS CONTROL SUMMARY BAR (Styled like mockup) */}
        <div className="rounded-2xl border border-dashboard-border/40 bg-white px-6 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-wrap gap-y-2 gap-x-6 items-center select-none text-slate-500 text-[11px] uppercase tracking-wider font-secondary-sans">
          <div className="flex items-center gap-1.5">
            <span className={`relative flex h-2 w-2 ${isMonitoringActive ? "" : "hidden"}`}>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-450 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className={`h-2 w-2 rounded-full bg-slate-400 ${isMonitoringActive ? "hidden" : ""}`} />
            <span className={isMonitoringActive ? "text-emerald-700" : "text-[#1A1A2B]"}>
              {isMonitoringActive ? "Monitoring Active" : "Monitoring Paused"}
            </span>
          </div>

          <span className="text-slate-200 font-normal">|</span>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-700">Device Connected</span>
          </div>

          <span className="text-slate-200 font-normal">|</span>

          <div className="flex items-center gap-1.5 text-foreground font-sans">
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Last Sync: {lastSyncTime ? formatRelativeTime(lastSyncTime) : "Never"}</span>
          </div>
        </div>

        {/* TIMELINE VIEW CONTAINER */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-slate-400 bg-white border border-dashboard-border/40 rounded-[2.25rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-sm font-semibold tracking-wide">Loading activity timeline...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-dashboard-border/40 rounded-[2.25rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 mb-4">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#1A1A2B]">No activity recorded</h3>
            <p className="mt-1 text-xs font-medium text-slate-400 max-w-sm mx-auto leading-relaxed">
              No activity logs match the selected filter, or no events have been synchronized yet.
            </p>
          </div>
        ) : (
          /* Geometry vertical track line container */
          <div className="relative space-y-6 pl-14 pt-2">
            {/* Timeline Line */}
            <div className="absolute left-[27px] top-0 bottom-0 w-[2px] bg-slate-100/85" />
            
            {filteredLogs.map((log) => {
              const config = getActivityConfig(log.activity_type);
              const LogIcon = config.icon;
              const deviceName = getDeviceName(log);
              const isAttention = log.activity_type === "permission_revoked" || log.activity_type === "permission_warning";

              return (
                <div key={log.$id} className="relative flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {/* Circular Timeline Node Badge centered perfectly on the 2px track line */}
                  <div className="absolute -left-12 top-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-white/50 border border-dashboard-border/70 shadow-[0_2px_8px_rgba(0,0,0,0.02)] z-10">
                    <LogIcon className={`h-4.5 w-4.5 ${config.iconColor}`} />
                  </div>

                  {/* Activity log Card details */}
                  <div className="flex-1 border border-dashboard-border/60 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:border-dashboard-border/80 transition-all duration-250 bg-white rounded-[20px] p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 font-secondary-sans tracking-wide">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-bold text-[#1A1A2B] leading-snug">
                          {config.title}
                        </h4>
                        
                        <p className="text-[12px] font-semibold text-[#6B7A99] leading-relaxed">
                          {log.activity_message || "System event successfully processed."}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {/* Event type badge */}
                          <span className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold ${config.badgeColor} uppercase tracking-wider`}>
                            {config.badge}
                          </span>
                          
                          {/* Resolve Now Link for Warnings */}
                          {isAttention && (
                            <span 
                              onClick={() => {
                                toast.success("Redirecting to permission configuration wizard...");
                              }}
                              className="text-xs font-bold text-primary hover:underline cursor-pointer ml-1"
                            >
                              Resolve Now
                            </span>
                          )}

                          {/* Device Origin Label */}
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 select-none ml-1">
                            <Smartphone className="h-3 w-3 text-slate-400" />
                            {deviceName}
                          </span>
                        </div>
                      </div>

                      {/* Log Timestamp */}
                      <span className="text-xs font-semibold text-slate-400 shrink-0 select-none sm:pt-0.5 font-sans">
                        {formatRelativeTime(log.timestamp || log.$createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* INFINITE SCROLL OBSERVER SENTINEL & FOOTER BUTTON */}
            <div 
              ref={observerTargetRef} 
              className="w-full flex flex-col items-center justify-center py-8 border-t border-slate-50 mt-6 text-center select-none"
            >
              {isFetchingMore ? (
                <div className="flex items-center gap-2 text-xs font-bold text-[#6B7A99]">
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-blue-500" />
                  Loading older activities...
                </div>
              ) : !hasMore ? (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-[#6B7A99]">All activity logs loaded</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200 mt-2" />
                </div>
              ) : (
                <button
                  onClick={() => fetchNextLogs()}
                  className="bg-white border border-dashboard-border/60 hover:bg-slate-50 text-[#6B7A99] hover:text-[#1A1A2B] font-bold rounded-full px-6 py-2.5 text-xs transition duration-200 shadow-[0_2px_10px_rgba(0,0,0,0.01)]"
                >
                  Scroll for more logs
                </button>
              )}
            </div>

          </div>
        )}
      </div>
    </PageLayout>
  );
}
