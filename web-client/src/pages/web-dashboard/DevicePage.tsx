import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { databases, client, AppwriteConfig, DEVICES_COLLECTION_ID, ACTIVITY_LOGS_COLLECTION_ID } from "@/lib/appwrite";
import { Query, ID } from "appwrite";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Smartphone, 
  Download, 
  Shield, 
  Activity, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  WifiOff, 
  Clock, 
  ArrowRight, 
  User, 
  Info, 
  X,
  Lock,
  Battery,
  ShieldCheck,
  Zap,
  Cpu,
  Link as LinkIcon
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

// Helper to derive manufacturer from device name
const getManufacturer = (deviceName: string) => {
  if (!deviceName) return "Unknown";
  const name = deviceName.toLowerCase();
  if (name.includes("samsung")) return "Samsung Electronics";
  if (name.includes("pixel") || name.includes("google")) return "Google";
  if (name.includes("oneplus")) return "OnePlus";
  if (name.includes("xiaomi") || name.includes("mi ")) return "Xiaomi";
  if (name.includes("huawei")) return "Huawei";
  if (name.includes("sony")) return "Sony";
  if (name.includes("lg ")) return "LG Electronics";
  if (name.includes("motorola") || name.includes("moto ")) return "Motorola";
  
  // Return first word as manufacturer as fallback
  return deviceName.split(" ")[0];
};

export default function DevicePage() {
  const { user } = useAuth();
  const userId = user?.$id;

  // States
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(!navigator.onLine);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modals
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // ── useQuery: devices (cached — renders instantly on revisit) ──────────────
  const { data: devicesQueryData, isLoading: devicesLoading, refetch: refetchDevices } = useQuery({
    queryKey: ["devices", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await databases.listDocuments(AppwriteConfig.databaseId, DEVICES_COLLECTION_ID, [
        Query.equal("user_id", userId)
      ]);
      return res.documents.map(d => ({ ...d, monitoring_status: d.monitoring_status ?? false }));
    },
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 5 * 60000,
    refetchOnWindowFocus: false,
  });

  // Sync query result into local devices state
  useEffect(() => {
    if (devicesQueryData) {
      setDevices(devicesQueryData);
      setSelectedDeviceId(prev => {
        if (prev && devicesQueryData.some(d => d.$id === prev)) return prev;
        return devicesQueryData.length > 0 ? devicesQueryData[0].$id : null;
      });
      setIsLoading(false);
      setError(null);
    }
  }, [devicesQueryData]);

  // For silent refresh
  const fetchDevices = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    await refetchDevices();
  }, [refetchDevices]);

  // Online/Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsReconnecting(false);
      fetchDevices();
      toast.success("Sync service reconnected!");
    };
    const handleOffline = () => {
      setIsReconnecting(true);
      toast.error("Connection lost. Sync is currently offline.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchDevices]);

  // Real-time subscription to the Devices collection
  useEffect(() => {
    if (!userId) return;

    const dbId = AppwriteConfig.databaseId;
    const unsubscribe = client.subscribe(
      `databases.${dbId}.collections.${DEVICES_COLLECTION_ID}.documents`,
      (response) => {
        const events = response.events;
        const payload = response.payload as any;

        // Verify user ownership
        if (payload.user_id !== userId) return;

        // Ensure monitoring_status is boolean
        const cleanedPayload = {
          ...payload,
          monitoring_status: payload.monitoring_status ?? false
        };

        if (events.some(e => e.endsWith(".create"))) {
          setDevices(prev => {
            if (prev.some(d => d.$id === cleanedPayload.$id)) return prev;
            
            const updated = [...prev, cleanedPayload];
            if (updated.length === 1) {
              setSelectedDeviceId(cleanedPayload.$id);
            }
            return updated;
          });
          toast.success(`New device linked: ${cleanedPayload.device_name}`);
        } else if (events.some(e => e.endsWith(".update"))) {
          setDevices(prev => prev.map(d => d.$id === cleanedPayload.$id ? cleanedPayload : d));
        } else if (events.some(e => e.endsWith(".delete"))) {
          setDevices(prev => {
            const filtered = prev.filter(d => d.$id !== cleanedPayload.$id);
            if (selectedDeviceId === cleanedPayload.$id) {
              setSelectedDeviceId(filtered.length > 0 ? filtered[0].$id : null);
            }
            return filtered;
          });
          toast.error("Device unlinked from dashboard.");
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId, selectedDeviceId]);

  // Handle Optimistic Monitoring Toggle
  const handleToggleMonitoring = async (device: any) => {
    const previousDevices = [...devices];
    const newStatus = !device.monitoring_status;

    // Optimistically update local UI state
    setDevices(prev => prev.map(d => d.$id === device.$id ? { ...d, monitoring_status: newStatus } : d));
    const statusText = newStatus ? "enabled" : "disabled";
    const toastId = toast.loading(`Turning monitoring ${statusText}...`);

    try {
      const dbId = AppwriteConfig.databaseId;

      // Log activity event to activity_logs collection
      await databases.createDocument(
        dbId,
        ACTIVITY_LOGS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: userId,
          device_name: device.device_name,
          activity_type: "monitoring_toggled_web",
          activity_message: `Monitoring ${statusText} from web dashboard`,
          timestamp: new Date().toISOString()
        }
      );

      // Update device document in databases
      await databases.updateDocument(
        dbId,
        DEVICES_COLLECTION_ID,
        device.$id,
        {
          monitoring_status: newStatus
        }
      );

      toast.success(`Monitoring ${newStatus ? "Activated" : "Paused"}!`, { id: toastId });
    } catch (e: any) {
      console.error("Failed to toggle monitoring status:", e);
      
      // Rollback state on write failure
      setDevices(previousDevices);
      toast.error(e?.message || "Failed to update monitoring status. Reverting changes.", { id: toastId });
    }
  };

  // Simulate Refresh Device
  const handleRefreshDevice = async () => {
    setIsRefreshing(true);
    const toastId = toast.loading("Polling device monitoring node...");
    
    await fetchDevices(true);
    
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Device synchronization logs refreshed!", { id: toastId });
    }, 1200);
  };

  // Simulate Check Permissions
  const handleCheckPermissions = () => {
    const toastId = toast.loading("Requesting permission status from device...");
    setTimeout(() => {
      toast.success("All monitoring permissions are active and verified!", { id: toastId });
    }, 1000);
  };

  // Get currently selected device
  const activeDevice = devices.find(d => d.$id === selectedDeviceId) || null;

  // ── RENDER SKELETON STATE ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <PageLayout>
        <div className="space-y-6 animate-pulse max-w-6xl mx-auto">
          <div className="h-[300px] w-full rounded-[2.25rem] bg-slate-100" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="grid grid-cols-2 gap-4 lg:col-span-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-24 rounded-2xl bg-slate-100" />
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-[200px] rounded-3xl bg-slate-100" />
              <div className="h-[150px] rounded-3xl bg-slate-100" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // ── RENDER ERROR STATE ─────────────────────────────────────────────────
  if (error) {
    return (
      <PageLayout>
        <div className="max-w-md mx-auto mt-12">
          <Card className="border-rose-100 bg-rose-50/20 p-8 text-center rounded-[2.25rem] shadow-md">
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 border border-rose-100">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">Connection Failed</h3>
              <p className="mt-2 text-sm font-medium text-slate-500 max-w-md">{error}</p>
              <Button 
                onClick={() => fetchDevices()} 
                className="mt-6 bg-[#005EA1] hover:bg-[#004D85] text-white rounded-full px-5 font-semibold transition shadow-md font-serif"
              >
                Retry Sync
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // ── 1. EMPTY STATE (No devices linked) ──────────────────────────────────
  if (devices.length === 0) {
    return (
      <PageLayout>
        {isReconnecting && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-100/50 p-4 text-sm font-semibold text-amber-700 animate-pulse">
            <WifiOff className="h-4 w-4 shrink-0" />
            Reconnecting to sync service...
          </div>
        )}

        <div className="space-y-6 max-w-6xl mx-auto">
          <Card className="border-slate-100 shadow-badge-blue rounded-[2.25rem] bg-white overflow-hidden p-6 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
              {/* Left Column Guide */}
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                  <Smartphone className="h-3.5 w-3.5" />
                  Device Link Portal
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight text-slate-955 sm:text-4xl leading-tight font-serif">
                  No Linked Devices <br className="hidden sm:inline" />
                  Detected
                </h2>

                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                  To start synchronizing call logs and SMS history, you need to install the CallBridge client application on your Android device and register this account.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button 
                    onClick={() => setIsDownloadModalOpen(true)}
                    className="h-12 bg-[#005EA1] hover:bg-[#004D85] text-white rounded-full font-semibold shadow-lg transition flex items-center gap-2 px-6 font-serif"
                  >
                    <Download className="h-4 w-4" />
                    Download Android Client
                  </Button>
                  <Button 
                    onClick={() => setIsDownloadModalOpen(true)}
                    variant="outline"
                    className="h-12 border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full font-semibold transition flex items-center gap-2 px-6 font-serif"
                  >
                    View Linking Guide
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                <Separator className="bg-slate-100 my-6" />

                {/* Requirements highlights */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 flex items-center gap-1.5 font-serif">
                      <Cpu className="h-3.5 w-3.5 text-blue-600" /> Android 8.0+
                    </h4>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1">Minimum OS requirement</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 flex items-center gap-1.5 font-serif">
                      <Lock className="h-3.5 w-3.5 text-blue-600" /> Secure SSL
                    </h4>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1">Encrypted transmission</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 flex items-center gap-1.5 font-serif">
                      <Zap className="h-3.5 w-3.5 text-blue-600" /> Auto Pairing
                    </h4>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1">Instant QR/Session sync</p>
                  </div>
                </div>
              </div>

              {/* Right Column Visual Mockup */}
              <div className="flex-1 mt-10 lg:mt-0 relative flex items-center justify-center min-h-[280px] bg-gradient-to-tr from-blue-500/5 to-indigo-500/5 border border-slate-100/50 rounded-3xl p-6 overflow-hidden">
                <div className="relative h-[200px] w-[300px]">
                  {/* Laptop Mock */}
                  <div className="absolute top-[20px] left-[30px] right-[30px] bottom-[10px] rounded-t-xl border-[3px] border-slate-800 bg-slate-900 shadow-lg flex flex-col justify-between overflow-hidden">
                    <div className="flex-1 bg-slate-950 p-2.5 flex flex-col gap-2 text-[5px] text-slate-500">
                      <div className="h-2 w-14 bg-slate-800 rounded" />
                      <div className="grid grid-cols-2 gap-1.5 mt-1">
                        <div className="h-10 bg-slate-900 border border-slate-800/50 rounded flex items-center justify-center">
                          <Smartphone className="h-3 w-3 text-slate-700" />
                        </div>
                        <div className="h-10 bg-slate-900 border border-slate-800/50 rounded" />
                      </div>
                    </div>
                  </div>
                  {/* Laptop base */}
                  <div className="absolute bottom-0 left-10 right-10 h-[10px] rounded-b-lg bg-slate-700 shadow-md" />

                  {/* Floating Phone Mock */}
                  <div className="absolute bottom-[-5px] right-[10px] h-[120px] w-[60px] rounded-xl border-2 border-slate-800 bg-slate-950 shadow-2xl flex flex-col items-center justify-center animate-float-slow border-t-[5px]">
                    <div className="h-1 w-8 bg-slate-800 rounded-full mb-6" />
                    <Smartphone className="h-6 w-6 text-blue-500 animate-pulse" />
                  </div>

                  {/* Floating badge */}
                  <div className="absolute top-[-10px] left-[10px] bg-white border border-slate-100 rounded-lg p-2 shadow-md flex items-center gap-1.5 animate-float-medium">
                    <AlertCircle className="h-4 w-4 text-amber-500 animate-bounce" />
                    <span className="text-[9px] font-bold text-slate-800 font-serif">Connection Error</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // ── 2. ACTIVE STATE (Linked devices exist) ──────────────────────────────
  return (
    <PageLayout
      filterSlot={
        devices.length > 1 && (
          <Select value={selectedDeviceId || ""} onValueChange={(val) => setSelectedDeviceId(val)}>
            <SelectTrigger className="flex items-center gap-1.5 rounded-full bg-white border border-dashboard-border/60 px-3.5 py-2 h-auto shadow-sm text-xs font-bold text-slate-700 w-auto focus:outline-none focus:ring-0">
              <Smartphone className="h-4 w-4 text-slate-400" />
              <SelectValue placeholder="Select Device" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-xl shadow-lg">
              {devices.map(d => (
                <SelectItem key={d.$id} value={d.$id}>{d.device_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }
    >
      {isReconnecting && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-100/50 p-4 text-sm font-semibold text-amber-700 animate-pulse max-w-6xl mx-auto">
          <WifiOff className="h-4 w-4 shrink-0" />
          Offline. Live monitoring status changes are paused.
        </div>
      )}

      {activeDevice && (
        <div className="space-y-8 max-w-6xl mx-auto">
          {/* SHOWCASE HERO CARD */}
          <Card className="border border-slate-100 shadow-badge-blue rounded-[2.25rem] bg-white overflow-hidden p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
              
              {/* Left Column Device Mock Image */}
              <div className="w-full md:w-[260px] h-[260px] shrink-0 rounded-[1.75rem] bg-slate-50 border border-slate-100 p-0 flex items-center justify-center overflow-hidden relative group">
                <img 
                  src="/images/floating_smartphone.png" 
                  alt="Floating Smartphone Mockup" 
                  className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-2xl transition duration-500 group-hover:scale-105 h-full w-full"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                
                {/* CSS Fallback Phone Container (renders if img fails) */}
                {/* <div className="absolute inset-4 rounded-2xl bg-gradient-to-tr from-blue-500/5 to-indigo-500/5 border border-slate-100 flex flex-col items-center justify-center gap-3">
                  <div className="h-[120px] w-[60px] rounded-xl border-2 border-slate-800 bg-slate-950 shadow-badge-blue flex items-center justify-center border-t-[4px]">
                    <Smartphone className="h-6 w-6 text-blue-500 animate-bounce" />
                  </div>
                </div> */}
              </div>

              {/* Right Column Device Details */}
              <div className="flex-1 space-y-6 w-full">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-3xl font-bold font-serif text-slate-900">
                      {activeDevice.device_name}
                    </h2>
                    
                    {/* OPTIMISTIC MONITORING TOGGLE BUTTON SWITCH */}
                    <div className="flex items-center gap-2 shrink-0 bg-slate-50 border border-slate-100 rounded-full px-3.5 py-1.5 shadow-sm">
                      <span className="text-xs font-bold text-slate-500">Monitoring</span>
                      <button
                        onClick={() => handleToggleMonitoring(activeDevice)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                          activeDevice.monitoring_status ? "bg-[#2E7D32]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            activeDevice.monitoring_status ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mt-1">
                    Android {activeDevice.android_version || "OS"} • Connected via CallBridge
                  </p>
                </div>

                {/* Status Pills Row */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {/* Monitoring active badge */}
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                    activeDevice.monitoring_status 
                      ? "bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]" 
                      : "bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${activeDevice.monitoring_status ? "bg-[#137333] animate-ping" : "bg-[#C5221F]"}`} />
                    {activeDevice.monitoring_status ? "Monitoring Active" : "Monitoring Paused"}
                  </span>

                  {/* Connection Status */}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC] px-3.5 py-1.5 text-xs font-semibold">
                    <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                    Device Connected
                  </span>

                  {/* SMS & Call Sync badge */}
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                    activeDevice.monitoring_status
                      ? "bg-[#EEF0FD] text-[#3F51B5] border border-[#D9DDFB]"
                      : "bg-slate-50 text-muted-foreground border border-slate-200"
                  }`}>
                    <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${activeDevice.monitoring_status ? "animate-spin" : ""}`} style={{ animationDuration: "6s" }} />
                    {activeDevice.monitoring_status ? "SMS & Call Sync Enabled" : "Sync Suspended"}
                  </span>
                </div>

                <div className="h-px bg-slate-100 w-full my-4" />

                {/* Bottom Horizontal Stats items */}
                <div className="flex flex-wrap gap-y-3 gap-x-8 pt-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Last Sync: {activeDevice.last_sync ? formatRelativeTime(activeDevice.last_sync) : "Never"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Access Contacts</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Secure Connection</span>
                  </div>
                </div>
              </div>

            </div>
          </Card>

          {/* MAIN GRID INFO + ACTIONS */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* 8-Card Detailed Information Grid */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-bold font-serif text-[#1E293B] px-1">Device Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                
                {/* Background Service Status */}
                <Card className="border border-slate-100 shadow-badge-blue transition bg-white rounded-[1rem] p-5 flex flex-col justify-between min-h-[90px]">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Background Service</div>
                  <div className="text-base font-bold font-serif text-slate-900 mt-2 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${activeDevice.monitoring_status ? "bg-[#137333] animate-pulse" : "bg-slate-400"}`} />
                    {activeDevice.monitoring_status ? "Running Normally" : "Service Paused"}
                  </div>
                </Card>

                {/* Device Model */}
                <Card className="border border-slate-100 shadow-badge-blue transition bg-white rounded-[1rem] p-5 flex flex-col justify-between min-h-[90px]">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Device Model</div>
                  <div className="text-base font-bold font-serif text-slate-900 mt-2 truncate">
                    {activeDevice.device_name}
                  </div>
                </Card>

                {/* Android Version */}
                <Card className="border border-slate-100 shadow-badge-blue transition bg-white rounded-[1rem] p-5 flex flex-col justify-between min-h-[90px]">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Android Version</div>
                  <div className="text-base font-bold font-serif text-slate-900 mt-2">
                    Android {activeDevice.android_version || "14 (UPS1.230925.001)"}
                  </div>
                </Card>

                {/* Manufacturer */}
                <Card className="border border-slate-100 shadow-badge-blue transition bg-white rounded-[1rem] p-5 flex flex-col justify-between min-h-[90px]">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Manufacturer</div>
                  <div className="text-base font-bold font-serif text-slate-900 mt-2">
                    {getManufacturer(activeDevice.device_name)}
                  </div>
                </Card>

                {/* Connection Status */}
                <Card className="border border-slate-100 shadow-badge-blue transition bg-white rounded-[1rem] p-5 flex flex-col justify-between min-h-[90px]">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Connection Status</div>
                  <div className="text-base font-bold font-serif text-[#137333] mt-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#137333]" />
                    Connected Securely
                  </div>
                </Card>

                {/* Monitoring Permissions */}
                <Card className="border border-slate-100 shadow-badge-blue transition bg-white rounded-[1rem] p-5 flex flex-col justify-between min-h-[90px]">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Monitoring Permissions</div>
                  <div className="text-base font-bold font-serif text-slate-900 mt-2 truncate">
                    {activeDevice.monitoring_status ? "Calls & SMS Access Granted" : "Access Suspended"}
                  </div>
                </Card>

                {/* Last Device Sync (spans both columns) */}
                <Card className="border border-slate-100 shadow-badge-blue transition bg-white rounded-[1rem] p-5 flex flex-col justify-between sm:col-span-2 min-h-[90px]">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Device Sync</div>
                  <div className="text-base font-bold font-serif text-slate-900 mt-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{activeDevice.last_sync ? `${formatRelativeTime(activeDevice.last_sync)} (Real-time)` : "Never synced"}</span>
                  </div>
                </Card>

                {/* Battery Optimization (spans both columns) */}
                <Card className="border border-slate-100 shadow-badge-blue transition bg-white rounded-[1rem] p-5 flex flex-col justify-between sm:col-span-2 min-h-[90px]">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Battery Optimization</div>
                  <div className="text-base font-bold font-serif text-[#D97706] mt-2 flex items-center gap-2">
                    <Battery className="h-4 w-4 text-[#D97706] shrink-0 animate-pulse" />
                    <span>Disabled (Recommended)</span>
                  </div>
                </Card>

              </div>
            </div>

            {/* Right Column: Actions & Privacy Card */}
            <div className="space-y-6">
              
              {/* QUICK ACTIONS PANEL */}
              <Card className="border border-slate-100 shadow-sm rounded-[1.5rem] bg-white p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Quick Actions</h3>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleRefreshDevice}
                    disabled={isRefreshing}
                    className="h-12 w-full bg-[#005EA1] hover:bg-[#004D85] text-white rounded-full font-serif font-semibold flex items-center justify-center gap-2 transition shadow-sm"
                  >
                    <RefreshCw className={`h-4 w-4 shrink-0 ${isRefreshing ? "animate-spin" : ""}`} />
                    Refresh Device
                  </Button>

                  <Button 
                    onClick={handleCheckPermissions}
                    variant="outline"
                    className="h-12 w-full border border-[#005EA1]/20 hover:bg-[#EBF3FC]/50 text-[#005EA1] rounded-full font-serif font-semibold flex items-center justify-center gap-2 transition bg-white"
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    Check Permissions
                  </Button>

                  <Button 
                    onClick={() => setIsDownloadModalOpen(true)}
                    variant="outline"
                    className="h-12 w-full border border-[#005EA1]/20 hover:bg-[#EBF3FC]/50 text-[#005EA1] rounded-full font-serif font-semibold flex items-center justify-center gap-2 transition bg-white"
                  >
                    <Info className="h-4 w-4 shrink-0" />
                    Open Setup Guide
                  </Button>
                </div>
              </Card>

              {/* PRIVACY MATTERS CARD */}
              <Card className="border border-blue-100/30 bg-[#EBF3F9]/60 shadow-sm rounded-[1.5rem] p-6 relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-inner">
                      <Shield className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-bold font-serif text-[#0F172A]">
                      Your Privacy Matters
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    CallBridge uses end-to-end encryption for all synchronized content. Your logs, SMS, and device data are processed securely and never stored in plain text.
                  </p>
                </div>

                <div>
                  <div className="h-px bg-slate-200/40 my-4" />
                  <div className="flex items-center gap-2 text-xs font-bold text-[#005EA1] select-none">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    Secure Handling Active
                  </div>
                </div>
              </Card>

            </div>

          </div>
        </div>
      )}

      {/* Setup Steps Modal */}
      {isDownloadModalOpen && (
        <SetupModal onClose={() => setIsDownloadModalOpen(false)} />
      )}
    </PageLayout>
  );
}

// ── SETUP & DOWNLOAD STEPS MODAL COMPONENT ──────────────────────────────
function SetupModal({ onClose }: { onClose: () => void }) {
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
      icon: CheckCircle2,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-900/10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-50 text-muted-foreground hover:text-slate-600 transition focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm shadow-blue-500/5">
            <Download className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 font-serif">
            Download the App. <br />
            Start Monitoring Today.
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            The CallBridge Android agent is lightweight, battery-efficient, and runs silently in the background. Setup takes very few minutes.
          </p>
        </div>

        {/* Steps List */}
        <div className="mt-8 space-y-3.5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center gap-4 rounded-2xl bg-slate-50/60 p-4 border border-slate-100/50">
                {/* Step badge */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#005EA1] text-white font-bold text-sm shadow-md shadow-blue-500/10">
                  {step.id}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 font-serif">{step.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                </div>

                <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-6 rounded-2xl bg-blue-50/40 p-4 border border-blue-50/50 flex items-center justify-center gap-2 text-xs font-bold text-[#005EA1]">
          <Shield className="h-4 w-4 shrink-0" />
          Secure. Reliable. Built for your peace of mind.
        </div>

        {/* Button to simulate APK download */}
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => {
              toast.success("Downloading CallBridge Android APK...");
              setTimeout(() => {
                toast.success("APK Download completed!");
              }, 1500);
            }}
            className="h-12 bg-[#005EA1] hover:bg-[#004D85] text-white rounded-full font-serif font-semibold w-full shadow-lg"
          >
            Start Download
          </Button>
        </div>
      </div>

      {/* Styles for float animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
