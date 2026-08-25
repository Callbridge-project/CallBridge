import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { databases, client, AppwriteConfig, CALL_LOGS_COLLECTION_ID, DEVICES_COLLECTION_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Smartphone, 
  ArrowDownLeft, 
  Loader2,
  Filter,
  WifiOff,
  X,
  Clock,
  Calendar,
  User,
  Check,
  CheckCircle2,
  Info
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
import missedcall from "@/assets/missed.svg";
import answeredcall from "@/assets/answered.svg";

export default function CallsPage() {
  const { user } = useAuth();
  const userId = user?.$id;
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  // States
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all"); // "all" | "missed_call" | "incoming_call"
  const [selectedCall, setSelectedCall] = useState<any | null>(null);
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
  const [totalCallsCount, setTotalCallsCount] = useState(0);
  const [missedCallsCount, setMissedCallsCount] = useState(0);
  const [answeredCallsCount, setAnsweredCallsCount] = useState(0);

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
  const fetchCallsStats = useCallback(async () => {
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

      // Query 1: Fetch total calls count
      const totalRes = await databases.listDocuments(dbId, CALL_LOGS_COLLECTION_ID, [
        ...queries,
        Query.limit(1)
      ]);
      const totalCount = totalRes.total;
      setTotalCallsCount(totalCount);

      // Query 2: Fetch missed calls count
      const missedQueries = [...queries, Query.equal("log_type", "missed_call")];
      const missedRes = await databases.listDocuments(dbId, CALL_LOGS_COLLECTION_ID, [
        ...missedQueries,
        Query.limit(1)
      ]);
      const missedCount = missedRes.total;
      
      setMissedCallsCount(missedCount);
      setAnsweredCallsCount(totalCount - missedCount);
    } catch (e) {
      console.error("Error fetching calls stats:", e);
    }
  }, [userId, selectedDevice, dateFilter]);

  // Fetch first page of call logs
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

      if (selectedType !== "all") {
        queries.push(Query.equal("log_type", selectedType));
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
            Query.contains("phone_number", searchQuery)
          ])
        );
      }

      const res = await databases.listDocuments(dbId, CALL_LOGS_COLLECTION_ID, queries);
      
      setLogs(res.documents);
      setHasMore(res.documents.length === 20);
      
      if (res.documents.length > 0) {
        lastDocIdRef.current = res.documents[res.documents.length - 1].$id;
      }
    } catch (err: any) {
      console.error("Error fetching first page of calls:", err);
      setError(err?.message || "Failed to load call logs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedDevice, selectedType, dateFilter, searchQuery]);

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

      if (selectedType !== "all") {
        queries.push(Query.equal("log_type", selectedType));
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
            Query.contains("phone_number", searchQuery)
          ])
        );
      }

      const res = await databases.listDocuments(dbId, CALL_LOGS_COLLECTION_ID, queries);
      
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
      console.error("Error fetching next page of calls:", err);
      toast.error("Failed to load more logs. Tap retry at the bottom.");
      setError("Failed to load more logs.");
    } finally {
      setIsFetchingMore(false);
    }
  }, [userId, isFetchingMore, hasMore, selectedDevice, selectedType, dateFilter, searchQuery]);

  // ── useQuery: devices list (cached, no re-fetch on revisit) ──────────────────
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

  // Sync devices query result into local state (dropdown needs it)
  useEffect(() => {
    if (devicesData) setDevices(devicesData);
  }, [devicesData]);

  // ── useQuery: stats (cached per filter combo) ───────────────────────────
  const { data: statsData } = useQuery({
    queryKey: ["callStats", userId, selectedDevice, dateFilter, searchQuery],
    queryFn: async () => {
      if (!userId) return { total: 0, missed: 0, answered: 0 };
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
            Query.contains("phone_number", searchQuery)
          ])
        );
      }

      const [totalRes, missedRes] = await Promise.all([
        databases.listDocuments(dbId, CALL_LOGS_COLLECTION_ID, [...baseQ, Query.limit(1)]),
        databases.listDocuments(dbId, CALL_LOGS_COLLECTION_ID, [...baseQ, Query.equal("log_type", "missed_call"), Query.limit(1)]),
      ]);
      return { total: totalRes.total, missed: missedRes.total, answered: totalRes.total - missedRes.total };
    },
    enabled: !!userId,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Sync stats into local counters
  useEffect(() => {
    if (statsData) {
      setTotalCallsCount(statsData.total);
      setMissedCallsCount(statsData.missed);
      setAnsweredCallsCount(statsData.answered);
    }
  }, [statsData]);

  // Trigger paginated log re-fetch when filters change
  useEffect(() => {
    fetchFirstPage();
  }, [selectedDevice, selectedType, dateFilter, searchQuery, fetchFirstPage]);

  // Browser online/offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsReconnecting(false);
      fetchFirstPage();
      toast.success("Connection restored!");
    };
    const handleOffline = () => {
      setIsReconnecting(true);
      toast.error("Offline. Monitoring logs are temporarily paused.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchFirstPage, fetchCallsStats]);

  // Setup Appwrite real-time subscriptions to prepend calls and update stats
  useEffect(() => {
    if (!userId) return;

    const dbId = AppwriteConfig.databaseId;
    const unsubscribe = client.subscribe(
      `databases.${dbId}.collections.${CALL_LOGS_COLLECTION_ID}.documents`,
      (response) => {
        const events = response.events;
        const payload = response.payload as any;

        // Verify user ID
        if (payload.user_id !== userId) return;

        if (events.some(e => e.endsWith(".create"))) {
          // 1. Prepend to logs if it matches filters
          const matchesDevice = selectedDevice === "all" || payload.device_name === selectedDevice;
          const matchesType = selectedType === "all" || payload.log_type === selectedType;

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

          if (matchesDevice && matchesType && matchesDate) {
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
            setTotalCallsCount(prev => prev + 1);
            if (payload.log_type === "missed_call") {
              setMissedCallsCount(prev => prev + 1);
            } else {
              setAnsweredCallsCount(prev => prev + 1);
            }
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId, selectedDevice, selectedType, dateFilter]);

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

  // Format single call time helper
  const formatCallTime = useCallback((timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "Unknown";
    }
  }, []);

  return (
    <PageLayout 
      title="Calls" 
      subtitle="Monitor synchronized call activity from your Android device."
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
          Offline. Live monitoring sync is currently paused.
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
            {/* Total Calls Card */}
            <div className="bg-white border border-dashboard-border/40 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] w-full">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">Total Calls</p>
                <p className="text-2xl font-bold text-[#1A1A2B] mt-0.5">{totalCallsCount.toLocaleString()}</p>
              </div>
            </div>

            {/* Missed Card */}
            <div className="bg-white border border-dashboard-border/40 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] w-full">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-100 text-rose-600">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">Missed</p>
                <p className="text-2xl font-bold text-[#1A1A2B] mt-0.5">{missedCallsCount.toLocaleString()}</p>
              </div>
            </div>

            {/* Answered Card */}
            <div className="bg-white border border-dashboard-border/40 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] w-full sm:col-span-2 md:col-span-1">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">Answered</p>
                <p className="text-2xl font-bold text-[#1A1A2B] mt-0.5">{answeredCallsCount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab filters bar */}
        <div className="flex items-center gap-1 bg-[#F5F7FA] border border-dashboard-border/40 p-1 rounded-full max-w-max">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-6 py-2 text-xs font-bold rounded-full transition duration-200 ${
              selectedType === "all" ? "bg-primary text-white shadow-[0_4px_12px_rgba(0,94,161,0.2)]" : "text-[#6B7A99] hover:text-[#1A1A2B]"
            }`}
          >
            All Calls
          </button>
          <button
            onClick={() => setSelectedType("missed_call")}
            className={`px-6 py-2 text-xs font-bold rounded-full transition duration-200 ${
              selectedType === "missed_call" ? "bg-primary text-white shadow-[0_4px_12px_rgba(0,94,161,0.2)]" : "text-[#6B7A99] hover:text-[#1A1A2B]"
            }`}
          >
            Missed
          </button>
          <button
            onClick={() => setSelectedType("incoming_call")}
            className={`px-6 py-2 text-xs font-bold rounded-full transition duration-200 ${
              selectedType === "incoming_call" ? "bg-primary text-white shadow-[0_4px_12px_rgba(0,94,161,0.2)]" : "text-[#6B7A99] hover:text-[#1A1A2B]"
            }`}
          >
            Answered
          </button>
        </div>

        {/* CALL LOGS LIST (Floating layout grouped by day matching mockup) */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-slate-400 bg-white border border-dashboard-border/40 rounded-[2.25rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-sm font-semibold tracking-wide">Loading call logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center bg-white border border-dashboard-border/40 rounded-[2.25rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 mb-4">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#1A1A2B]">No calls found</h3>
            <p className="mt-1 text-xs font-medium text-slate-400 max-w-sm">
              No {selectedType === "all" ? "" : selectedType === "missed_call" ? "missed" : "answered"} call logs were recorded matching the selected filter query.
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

                {/* Date group call cards list */}
                <div className="space-y-3">
                  {dayLogs.map((log) => {
                    const isMissed = log.log_type === "missed_call";
                    return (
                      <div 
                        key={log.$id} 
                        onClick={() => setSelectedCall(log)}
                        className="bg-white border border-dashboard-border/60 rounded-[20px] p-5 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:border-dashboard-border/80 transition-all duration-200 cursor-pointer w-full group"
                      >
                        <div className="flex items-center gap-4">
                          {/* Circular Phone Icon Container */}
                          <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${
                            isMissed 
                              ? "bg-rose-50 text-rose-500 border border-rose-100" 
                              : "bg-emerald-50 text-emerald-500 border border-emerald-100"
                          }`}>
                            {isMissed ? <img src={missedcall} alt="Missed Call" className="h-4 w-4" /> : <img src={answeredcall} alt="Answered Call" className="h-4 w-4" />}
                          </div>

                          {/* Caller Name and number stacked */}
                          <div className="min-w-0">
                            <span className="text-sm text-[#1A1A2B] group-hover:text-primary transition-colors block truncate">
                              {log.contact_name || log.caller_number || log.phone_number || "Unknown Contact"}
                            </span>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {(log.contact_name) && (
                                <span className="font-mono text-[12px] text-muted-foreground">
                                  {log.caller_number || log.phone_number}
                                </span>
                              )}
                              <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                Incoming
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right aligned status and time */}
                        <div className="text-right shrink-0 flex flex-col items-end justify-center">
                          <span className="text-xs md:text-sm text-[#1A1A2B]">
                            {formatCallTime(log.timestamp)}
                          </span>
                          <span className={`flex items-center gap-1 text-[11px] font-bold mt-1 uppercase tracking-wide ${
                            isMissed ? "text-rose-500" : "text-emerald-600"
                          }`}>
                            {isMissed ? (
                              <>
                                <ArrowDownLeft className="h-3.5 w-3.5" />
                                Missed
                              </>
                            ) : (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                Answered
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* INFINITE SCROLL LOADER & OBSERVER SENTINEL */}
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
                <span className="text-xs font-bold text-[#6B7A99]">All logs loaded</span>
              ) : (
                <div className="h-2" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modern Premium Detail Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#090d16]/45 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setSelectedCall(null)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-white border border-dashboard-border/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-lg w-full overflow-hidden z-10 p-6 transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedCall(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition p-1.5 hover:bg-slate-50 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4.5 mb-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-full shrink-0 ${
                selectedCall.log_type === "missed_call" 
                  ? "bg-rose-50 text-rose-500 border border-rose-100" 
                  : "bg-emerald-50 text-emerald-500 border border-emerald-100"
              }`}>
                {selectedCall.log_type === "missed_call" ? <Phone className="h-5 w-5 rotate-[135deg]" /> : <Phone className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A1A2B]">Call Details</h3>
                <p className="text-[10px] font-semibold text-[#6B7A99] uppercase tracking-wider mt-0.5">Device Record Info</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              {/* Profile/Contact Section */}
              <div className="bg-[#F8F9FC] border border-dashboard-border/30 rounded-2xl p-4 flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#1A1A2B] truncate">
                    {selectedCall.contact_name || "Unknown Contact"}
                  </p>
                  <p className="text-xs font-semibold text-[#6B7A99] font-mono mt-0.5 truncate">
                    {selectedCall.caller_number || selectedCall.phone_number || "No Number"}
                  </p>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Call Status</span>
                  {selectedCall.log_type === "missed_call" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-600">
                      <ArrowDownLeft className="h-3.5 w-3.5" /> Missed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                      <Check className="h-3.5 w-3.5" /> Answered
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Direction</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200/60 px-2.5 py-1 text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                    Incoming
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Call Time</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1A2B]">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {(() => {
                      try {
                        return new Date(selectedCall.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      } catch(e) {
                        return "Unknown";
                      }
                    })()}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Call Date</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1A2B]">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {(() => {
                      try {
                        return new Date(selectedCall.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                      } catch(e) {
                        return "Unknown";
                      }
                    })()}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sync Source</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 truncate">
                    <Smartphone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedCall.device_name || "Unknown Device"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sync Status</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 uppercase">
                    Active
                  </span>
                </div>
              </div>

              {/* Footer Audit ID */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Record ID</span>
                <span className="text-[10px] font-semibold text-slate-400 font-mono select-all truncate block">
                  {selectedCall.$id}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 border-t border-slate-100 pt-4">
              <Button 
                onClick={() => setSelectedCall(null)}
                variant="ghost" 
                size="sm"
                className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl px-4 py-2"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(selectedCall.caller_number || selectedCall.phone_number || "");
                  toast.success("Phone number copied!");
                }}
                size="sm"
                className="text-xs font-bold text-white bg-primary hover:bg-primary-600 rounded-xl px-4 py-2 shadow-sm transition"
              >
                Copy Number
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
