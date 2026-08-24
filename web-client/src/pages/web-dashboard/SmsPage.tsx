import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { databases, client, AppwriteConfig, SMS_LOGS_COLLECTION_ID, DEVICES_COLLECTION_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Smartphone, 
  Loader2,
  Filter,
  WifiOff,
  X,
  Clock,
  Calendar,
  User,
  Check,
  CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomOnlyDateFilterComponent, DateFilterValue } from "@/components/shared/custom-only-date-filter";
import smsicon from "@/assets/smsicon.svg";

export default function SmsPage() {
  const { user } = useAuth();
  const userId = user?.$id;
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  // States
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all"); // "all" | "unread" | "read"
  const [selectedSms, setSelectedSms] = useState<any | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({
    active: "all_time",
    start_date: null,
    end_date: null,
  });

  // Logs list and pagination state
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(!navigator.onLine);

  // Stats Counters
  const [totalSMSCount, setTotalSMSCount] = useState(0);
  const [unreadSMSCount, setUnreadSMSCount] = useState(0);
  const [readSMSCount, setReadSMSCount] = useState(0);

  // Cursors & Observer refs
  const lastDocIdRef = useRef<string | null>(null);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  // Fetch linked devices list for dropdown
  const fetchDevices = useCallback(async () => {
    if (!userId) return;
    try {
      const dbId = AppwriteConfig.databaseId;
      const res = await databases.listDocuments(dbId, DEVICES_COLLECTION_ID, [
        Query.equal("user_id", userId)
      ]);
      setDevices(res.documents);
    } catch (e) {
      console.error("Error fetching devices for selector:", e);
    }
  }, [userId]);

  // Fetch stats count dynamically based on active filters
  const fetchSmsStats = useCallback(async () => {
    if (!userId) return;
    try {
      const dbId = AppwriteConfig.databaseId;
      
      // Build filter queries
      const queries = [Query.equal("user_id", userId)];
      if (selectedDevice !== "all") {
        queries.push(Query.equal("device_name", selectedDevice));
      }
      if (dateFilter.start_date) {
        queries.push(Query.greaterThanEqual("timestamp", dateFilter.start_date.toISOString()));
      }
      if (dateFilter.end_date) {
        queries.push(Query.lessThanEqual("timestamp", dateFilter.end_date.toISOString()));
      }

      // Query 1: Fetch total SMS count
      const totalRes = await databases.listDocuments(dbId, SMS_LOGS_COLLECTION_ID, [
        ...queries,
        Query.limit(1)
      ]);
      const totalCount = totalRes.total;
      setTotalSMSCount(totalCount);

      // Query 2: Fetch unread SMS count
      const unreadQueries = [...queries, Query.equal("is_read", false)];
      const unreadRes = await databases.listDocuments(dbId, SMS_LOGS_COLLECTION_ID, [
        ...unreadQueries,
        Query.limit(1)
      ]);
      const unreadCount = unreadRes.total;
      
      setUnreadSMSCount(unreadCount);
      setReadSMSCount(totalCount - unreadCount);
    } catch (e) {
      console.error("Error fetching SMS stats:", e);
    }
  }, [userId, selectedDevice, dateFilter]);

  // Fetch first page of SMS logs
  const fetchFirstPage = useCallback(async (silent = false) => {
    if (!userId) return;
    if (!silent) setIsLoading(true);
    setError(null);
    lastDocIdRef.current = null;

    try {
      const dbId = AppwriteConfig.databaseId;
      
      // Build queries
      const queries = [
        Query.equal("user_id", userId),
        Query.orderDesc("timestamp"),
        Query.limit(20)
      ];

      if (selectedDevice !== "all") {
        queries.push(Query.equal("device_name", selectedDevice));
      }

      if (selectedStatus === "unread") {
        queries.push(Query.equal("is_read", false));
      } else if (selectedStatus === "read") {
        queries.push(Query.equal("is_read", true));
      }

      if (dateFilter.start_date) {
        queries.push(Query.greaterThanEqual("timestamp", dateFilter.start_date.toISOString()));
      }
      if (dateFilter.end_date) {
        queries.push(Query.lessThanEqual("timestamp", dateFilter.end_date.toISOString()));
      }

      if (searchQuery) {
        queries.push(
          Query.or([
            Query.contains("contact_name", searchQuery),
            Query.contains("phone_number", searchQuery),
            Query.contains("message_body", searchQuery)
          ])
        );
      }

      const res = await databases.listDocuments(dbId, SMS_LOGS_COLLECTION_ID, queries);
      
      setLogs(res.documents);
      setHasMore(res.documents.length === 20);
      
      if (res.documents.length > 0) {
        lastDocIdRef.current = res.documents[res.documents.length - 1].$id;
      }
    } catch (err: any) {
      console.error("Error fetching first page of SMS:", err);
      setError(err?.message || "Failed to load SMS logs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedDevice, selectedStatus, dateFilter, searchQuery]);

  // Fetch next page (infinite scroll)
  const fetchNextPage = useCallback(async () => {
    if (!userId || isFetchingMore || !hasMore || !lastDocIdRef.current) return;
    
    setIsFetchingMore(true);
    setError(null);

    try {
      const dbId = AppwriteConfig.databaseId;
      
      // Build queries
      const queries = [
        Query.equal("user_id", userId),
        Query.orderDesc("timestamp"),
        Query.limit(20),
        Query.cursorAfter(lastDocIdRef.current)
      ];

      if (selectedDevice !== "all") {
        queries.push(Query.equal("device_name", selectedDevice));
      }

      if (selectedStatus === "unread") {
        queries.push(Query.equal("is_read", false));
      } else if (selectedStatus === "read") {
        queries.push(Query.equal("is_read", true));
      }

      if (dateFilter.start_date) {
        queries.push(Query.greaterThanEqual("timestamp", dateFilter.start_date.toISOString()));
      }
      if (dateFilter.end_date) {
        queries.push(Query.lessThanEqual("timestamp", dateFilter.end_date.toISOString()));
      }

      if (searchQuery) {
        queries.push(
          Query.or([
            Query.contains("contact_name", searchQuery),
            Query.contains("phone_number", searchQuery),
            Query.contains("message_body", searchQuery)
          ])
        );
      }

      const res = await databases.listDocuments(dbId, SMS_LOGS_COLLECTION_ID, queries);
      
      if (res.documents.length > 0) {
        setLogs(prev => {
          const combined = [...prev, ...res.documents];
          // Deduplicate
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
      console.error("Error fetching next page of SMS:", err);
      toast.error("Failed to load more logs. Tap retry at the bottom.");
      setError("Failed to load more logs.");
    } finally {
      setIsFetchingMore(false);
    }
  }, [userId, isFetchingMore, hasMore, selectedDevice, selectedStatus, dateFilter, searchQuery]);

  // ── useQuery: devices list ──────────────────────────────────────────────────
  const { data: devicesData } = useQuery({
    queryKey: ["devices", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await databases.listDocuments(AppwriteConfig.databaseId, DEVICES_COLLECTION_ID, [Query.equal("user_id", userId)]);
      return res.documents;
    },
    enabled: !!userId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  useEffect(() => { if (devicesData) setDevices(devicesData); }, [devicesData]);

  // ── useQuery: SMS stats (cached per filter combo) ────────────────────────
  const { data: statsData } = useQuery({
    queryKey: ["smsStats", userId, selectedDevice, dateFilter, searchQuery],
    queryFn: async () => {
      if (!userId) return { total: 0, unread: 0, read: 0 };
      const dbId = AppwriteConfig.databaseId;
      const baseQ = [Query.equal("user_id", userId)];
      if (selectedDevice !== "all") baseQ.push(Query.equal("device_name", selectedDevice));
      
      if (dateFilter.start_date) {
        baseQ.push(Query.greaterThanEqual("timestamp", dateFilter.start_date.toISOString()));
      }
      if (dateFilter.end_date) {
        baseQ.push(Query.lessThanEqual("timestamp", dateFilter.end_date.toISOString()));
      }

      if (searchQuery) {
        baseQ.push(
          Query.or([
            Query.contains("contact_name", searchQuery),
            Query.contains("phone_number", searchQuery),
            Query.contains("message_body", searchQuery)
          ])
        );
      }

      const [totalRes, unreadRes] = await Promise.all([
        databases.listDocuments(dbId, SMS_LOGS_COLLECTION_ID, [...baseQ, Query.limit(1)]),
        databases.listDocuments(dbId, SMS_LOGS_COLLECTION_ID, [...baseQ, Query.equal("is_read", false), Query.limit(1)]),
      ]);
      return { total: totalRes.total, unread: unreadRes.total, read: totalRes.total - unreadRes.total };
    },
    enabled: !!userId,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (statsData) {
      setTotalSMSCount(statsData.total);
      setUnreadSMSCount(statsData.unread);
      setReadSMSCount(statsData.read);
    }
  }, [statsData]);

  // Trigger paginated log re-fetch when filters change
  useEffect(() => {
    fetchFirstPage();
  }, [selectedDevice, selectedStatus, dateFilter, searchQuery, fetchFirstPage]);

  // Browser online/offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsReconnecting(false);
      fetchFirstPage();
      toast.success("Sync service reconnected!");
    };
    const handleOffline = () => {
      setIsReconnecting(true);
      toast.error("Sync is offline. Live updates are paused.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchFirstPage]);

  // Setup Appwrite real-time subscriptions to prepend SMS and update stats
  useEffect(() => {
    if (!userId) return;

    const dbId = AppwriteConfig.databaseId;
    const unsubscribe = client.subscribe(
      `databases.${dbId}.collections.${SMS_LOGS_COLLECTION_ID}.documents`,
      (response) => {
        const events = response.events;
        const payload = response.payload as any;

        // Verify user ID
        if (payload.user_id !== userId) return;

        if (events.some(e => e.endsWith(".create"))) {
          // 1. Prepend to logs if it matches filters
          const matchesDevice = selectedDevice === "all" || payload.device_name === selectedDevice;
          
          let matchesStatus = true;
          if (selectedStatus === "unread") {
            matchesStatus = !payload.is_read;
          } else if (selectedStatus === "read") {
            matchesStatus = payload.is_read;
          }

          let matchesDate = true;
          if (payload.timestamp) {
            const logTime = new Date(payload.timestamp).getTime();
            if (dateFilter.start_date && logTime < dateFilter.start_date.getTime()) {
              matchesDate = false;
            }
            if (dateFilter.end_date && logTime > dateFilter.end_date.getTime()) {
              matchesDate = false;
            }
          }

          if (matchesDevice && matchesStatus && matchesDate) {
            setLogs(prev => {
              const combined = [payload, ...prev];
              const map = new Map();
              return combined.filter(item => {
                if (map.has(item.$id)) return false;
                map.set(item.$id, true);
                return true;
              });
            });
          }

          // 2. Update Stats Counter live
          if (matchesDevice && matchesDate) {
            setTotalSMSCount(prev => prev + 1);
            if (!payload.is_read) {
              setUnreadSMSCount(prev => prev + 1);
            } else {
              setReadSMSCount(prev => prev + 1);
            }
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId, selectedDevice, selectedStatus, dateFilter]);

  // Setup IntersectionObserver for infinite scroll
  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "100px",
      threshold: 0.1
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading && !isFetchingMore) {
        fetchNextPage();
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
  }, [hasMore, isLoading, isFetchingMore, fetchNextPage]);

  // Handle optimistic is_read update on row click
  const handleRowClick = async (sms: any) => {
    // 1. Set row details and open modal
    setSelectedSms(sms);

    // 2. If already read, nothing more to do
    if (sms.is_read) return;

    // 3. Optimistic UI update: mark as read in local list and stats
    const previousLogs = [...logs];
    const previousUnread = unreadSMSCount;
    const previousRead = readSMSCount;

    // Local states optimistic update
    setLogs(prev => prev.map(log => log.$id === sms.$id ? { ...log, is_read: true } : log));
    setUnreadSMSCount(prev => Math.max(0, prev - 1));
    setReadSMSCount(prev => prev + 1);
    
    // Update the selected item inside modal to show "Read" immediately
    setSelectedSms(prev => prev ? { ...prev, is_read: true } : null);

    // 4. Update database
    try {
      const dbId = AppwriteConfig.databaseId;
      await databases.updateDocument(
        dbId, 
        SMS_LOGS_COLLECTION_ID, 
        sms.$id, 
        { is_read: true }
      );
    } catch (e) {
      console.error("Failed to update SMS read status in Appwrite:", e);
      
      // Rollback optimistic states silently on write failure
      setLogs(previousLogs);
      setUnreadSMSCount(previousUnread);
      setReadSMSCount(previousRead);
      setSelectedSms(sms); // Reverts status inside the open modal
      
      toast.error("Could not mark as read.");
    }
  };

  // Group logs by day helper
  const groupedLogs = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    
    logs.forEach(log => {
      if (!log.timestamp) return;
      
      const date = new Date(log.timestamp);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      
      let groupKey = "";
      
      if (date.toDateString() === today.toDateString()) {
        groupKey = "TODAY";
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "YESTERDAY";
      } else {
        groupKey = date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        }).toUpperCase();
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(log);
    });
    
    return groups;
  }, [logs]);

  // Format single SMS time helper
  const formatSmsTime = useCallback((timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "Unknown";
    }
  }, []);

  return (
    <PageLayout 
      title="SMS" 
      subtitle="Monitor synchronized SMS activity from your Android device."
      filterSlot={
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger className="flex items-center gap-2 rounded-lg bg-white border border-dashboard-border/60 px-4 py-2.5 h-auto text-xs font-bold text-[#1A1A2B] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:bg-slate-50 transition duration-200 focus:outline-none focus:ring-0 focus:border-dashboard-border/60 w-auto">
              <Filter className="h-3.5 w-3.5 text-[#1A1A2B]" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-xl shadow-lg">
              <SelectItem value="all">All Devices</SelectItem>
              {devices.map(d => (
                <SelectItem key={d.$id} value={d.device_name}>{d.device_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <CustomOnlyDateFilterComponent 
            value={dateFilter} 
            onChange={setDateFilter} 
            defaultDate="all_time" 
          />
        </div>
      }
    >
      {/* Offline Alert */}
      {isReconnecting && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-100/50 p-4 text-sm font-semibold text-amber-700 animate-pulse">
          <WifiOff className="h-4 w-4 shrink-0" />
          Offline. Live updates are paused.
        </div>
      )}

      <div className="space-y-6">
        {/* SUMMARY REPORT STATS ROW (Custom premium layout matching mockup) */}
        <div className="rounded-3xl border border-dashboard-border/40 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col gap-6 xl:flex-row xl:items-center">
          {/* Summary Label */}
          <div className="flex-1 xl:max-w-xs space-y-1.5 py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Summary Report</span>
            <h3 className="text-2xl font-extrabold tracking-tight text-[#1A1A2B] leading-none">Operational Insight</h3>
            {/* <p className="text-xs text-muted-foreground/70 leading-relaxed pt-1 max-w-xs">
              Live aggregated metrics of all synchronizations. Select filters above to refine stats.
            </p> */}
          </div>

          {/* Stats Cards Row */}
          <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* Total SMS Card */}
            <div className="bg-white border border-dashboard-border/40 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] w-full">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total SMS</p>
                <p className="text-2xl font-bold text-[#1A1A2B]">{totalSMSCount.toLocaleString()}</p>
                <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  <span>↗</span> +12% since logged
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-primary">
                <img src={smsicon} alt="SMS Icon" className="h-5 w-5" />
              </div>
            </div>

            {/* SMS Unread Card */}
            <div className="bg-white border border-dashboard-border/40 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] w-full font-sans">
              <div className="space-y-1 font-sans">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">SMS Unread</p>
                <p className="text-2xl font-bold text-[#1A1A2B]">{unreadSMSCount.toLocaleString()}</p>
              </div>
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-2 shrink-0 animate-pulse" />
            </div>

            {/* SMS Read Card */}
            <div className="bg-white border border-dashboard-border/40 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] w-full font-sans sm:col-span-2 md:col-span-1">
              <div className="space-y-1 font-sans">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">SMS Read</p>
                <p className="text-2xl font-bold text-[#1A1A2B]">{readSMSCount.toLocaleString()}</p>
              </div>
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
                <Check className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab filters bar */}
        <div className="flex items-center gap-1 bg-[#F5F7FA] border border-dashboard-border/40 p-1 rounded-full max-w-max">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-6 py-2 text-xs font-bold rounded-full transition duration-200 ${
              selectedStatus === "all" ? "bg-primary text-white shadow-[0_4px_12px_rgba(0,94,161,0.2)]" : "text-[#6B7A99] hover:text-[#1A1A2B]"
            }`}
          >
            All Messages
          </button>
          <button
            onClick={() => setSelectedStatus("unread")}
            className={`px-6 py-2 text-xs font-bold rounded-full transition duration-200 ${
              selectedStatus === "unread" ? "bg-primary text-white shadow-[0_4px_12px_rgba(0,94,161,0.2)]" : "text-[#6B7A99] hover:text-[#1A1A2B]"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setSelectedStatus("read")}
            className={`px-6 py-2 text-xs font-bold rounded-full transition duration-200 ${
              selectedStatus === "read" ? "bg-primary text-white shadow-[0_4px_12px_rgba(0,94,161,0.2)]" : "text-[#6B7A99] hover:text-[#1A1A2B]"
            }`}
          >
            Read
          </button>
        </div>

        {/* SMS LOGS LIST (Grouped Card List layout matching mockup) */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-slate-400 bg-white border border-dashboard-border/40 rounded-[2.25rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-sm font-semibold tracking-wide">Loading SMS logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center bg-white border border-dashboard-border/40 rounded-[2.25rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 mb-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#1A1A2B]">No messages found</h3>
            <p className="mt-1 text-xs font-medium text-slate-400 max-w-sm">
              No {selectedStatus === "all" ? "" : selectedStatus} SMS logs were recorded matching the selected filter query.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLogs).map(([day, dayLogs]) => (
              <div key={day} className="space-y-3.5">
                {/* Date group header */}
                <span className="text-[11px] font-bold text-[#6B7A99] tracking-wider uppercase block mt-6 mb-3">
                  {day}
                </span>

                {/* SMS Cards Stack */}
                <div className="space-y-3">
                  {dayLogs.map((log) => {
                    const isUnread = !log.is_read;
                    return (
                      <div
                        key={log.$id}
                        onClick={() => handleRowClick(log)}
                        className="bg-white border border-dashboard-border/60 rounded-[20px] p-5 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:border-dashboard-border/80 transition-all duration-200 cursor-pointer w-full group"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                          {/* Circular Avatar Container */}
                          <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 relative ${
                            isUnread
                              ? "bg-blue-50 text-primary border border-blue-100"
                              : "bg-slate-100/50 text-[#6B7A99] border border-slate-200/40"
                          }`}>
                            <MessageSquare className="h-4.5 w-4.5" />
                            {/* Blue dot indicator aligned on top-left of the avatar */}
                            {isUnread && (
                              <span className="absolute -top-0.5 -left-0.5 h-2.5 w-2.5 rounded-full bg-blue-500 border-2 border-white" />
                            )}
                          </div>

                          {/* Sender name and snippet */}
                          <div className="min-w-0 flex-1">
                            <span className="text-sm text-[#1A1A2B] group-hover:text-primary transition-colors block truncate">
                              {log.contact_name || log.caller_number || log.phone_number || "Unknown Sender"}
                            </span>
                            <p className="text-xs md:text-[12px] text-[#6B7A99] mt-1 truncate font-normal">
                              {log.message_body || "No message body"}
                            </p>
                          </div>
                        </div>

                        {/* Time and unread text status */}
                        <div className="text-right shrink-0 flex flex-col items-end justify-center">
                          <span className="text-xs md:text-sm text-[#1A1A2B]">
                            {formatSmsTime(log.timestamp)}
                          </span>
                          <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${
                            isUnread ? "text-[#3B82F6]" : "text-[#6B7A99]"
                          }`}>
                            {isUnread ? "Unread" : "Read"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* INFINITE SCROLL OBSERVER */}
            <div 
              ref={observerTargetRef} 
              className="w-full flex items-center justify-center py-8 border-t border-slate-100 mt-6 text-center"
            >
              {isFetchingMore ? (
                <div className="flex items-center gap-2 text-xs font-bold text-[#6B7A99]">
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-blue-500" />
                  Loading more records...
                </div>
              ) : error ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-rose-500">Failed to load more logs.</span>
                  <Button 
                    onClick={() => fetchNextPage()} 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg px-3"
                  >
                    Tap to retry
                  </Button>
                </div>
              ) : !hasMore ? (
                <span className="text-xs font-bold text-[#6B7A99]">All messages loaded</span>
              ) : (
                <div className="h-2" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modern Premium Detail Modal */}
      {selectedSms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#090d16]/45 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setSelectedSms(null)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-white border border-dashboard-border/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-lg w-full overflow-hidden z-10 p-6 transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 font-sans">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedSms(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition p-1.5 hover:bg-slate-50 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4.5 mb-5 font-sans">
              <div className={`flex h-11 w-11 items-center justify-center rounded-full shrink-0 ${
                !selectedSms.is_read 
                  ? "bg-blue-50 text-primary border border-blue-100" 
                  : "bg-slate-100 text-slate-500 border border-slate-200"
              }`}>
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A1A2B] font-sans">Message Details</h3>
                <p className="text-[10px] font-semibold text-[#6B7A99] uppercase tracking-wider mt-0.5 font-sans">Device Sync Payload</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 font-sans">
              {/* Message Content Bubble */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Message Content</span>
                <div className="bg-[#F8F9FC] border border-dashboard-border/30 rounded-2xl p-4 text-sm font-medium text-[#1A1A2B] whitespace-pre-wrap break-all max-h-[160px] overflow-y-auto scrollbar-hide font-sans">
                  {selectedSms.message_body || <span className="text-slate-400 italic">No message content</span>}
                </div>
              </div>

              {/* Profile/Contact Section */}
              <div className="bg-[#F8F9FC] border border-dashboard-border/30 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#1A1A2B] truncate font-sans">
                    {selectedSms.contact_name || "Unknown Contact"}
                  </p>
                  <p className="text-xs font-semibold text-[#6B7A99] font-mono mt-0.5 truncate">
                    {selectedSms.caller_number || selectedSms.phone_number || "No Number"}
                  </p>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Read Status</span>
                  {selectedSms.is_read ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 font-sans">
                      Read
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 font-sans">
                      Unread
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sync Status</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 uppercase font-sans">
                    Active
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1A2B]">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {(() => {
                      try {
                        return new Date(selectedSms.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                      } catch(e) {
                        return "Unknown";
                      }
                    })()}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1A2B]">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {(() => {
                      try {
                        return new Date(selectedSms.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      } catch(e) {
                        return "Unknown";
                      }
                    })()}
                  </div>
                </div>

                <div className="col-span-2 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sync Source Device</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 truncate">
                    <Smartphone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-sans">{selectedSms.device_name || "Unknown Device"}</span>
                  </div>
                </div>
              </div>

              {/* Footer Audit ID */}
              <div className="border-t border-slate-100 pt-3.5 mt-2">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider block mb-1 font-sans">Record ID</span>
                <span className="text-[10px] font-semibold text-slate-400 font-mono select-all truncate block">
                  {selectedSms.$id}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 border-t border-slate-100 pt-4">
              <Button 
                onClick={() => setSelectedSms(null)}
                variant="ghost" 
                size="sm"
                className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl px-4 py-2"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(selectedSms.message_body || "");
                  toast.success("Message copied!");
                }}
                size="sm"
                className="text-xs font-bold text-white bg-primary hover:bg-primary-600 rounded-xl px-4 py-2 shadow-sm transition"
              >
                Copy Text
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
