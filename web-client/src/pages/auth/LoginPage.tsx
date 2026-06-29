import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { databases, AppwriteConfig, DEVICES_COLLECTION_ID, CALL_LOGS_COLLECTION_ID, SMS_LOGS_COLLECTION_ID, ACTIVITY_LOGS_COLLECTION_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  EyeOff, 
  Shield, 
  RefreshCw, 
  Activity, 
  Smartphone, 
  Lock,
  Share2,
  HelpCircle,
  Phone,
  MessageSquare,
  BarChart2
} from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "@/components/layout/AuthLayout";

// Import Logo and Mockup assets
import logoImg from "@/assets/images/logo.png";
import footerLogoImg from "@/assets/images/footer-logo.png";
import phoneMockupImg from "@/assets/images/CallBridge Android Mockup.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field errors
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const validateForm = () => {
    const tempErrors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      tempErrors.email = "Email address is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!password) {
      tempErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Logging you in...");

    try {
      const session = await login(email, password);
      toast.success("Welcome back!", { id: toastId });

      // ── Prefetch critical data in the background ────────────────────────
      const uid = session.userId;
      const dbId = AppwriteConfig.databaseId;

      // Prefetch devices (shared key used across all pages)
      queryClient.prefetchQuery({
        queryKey: ["devices", uid],
        queryFn: () => databases.listDocuments(dbId, DEVICES_COLLECTION_ID, [Query.equal("user_id", uid)]).then(r => r.documents),
        staleTime: 60000,
      });

      // Prefetch dashboard compound query
      queryClient.prefetchQuery({
        queryKey: ["dashboard", uid],
        queryFn: async () => {
          const devicesRes = await databases.listDocuments(dbId, DEVICES_COLLECTION_ID, [Query.equal("user_id", uid)]);
          const linkedDevices = devicesRes.documents;
          if (linkedDevices.length === 0) return { devices: [], totalCalls: 0, missedCalls: 0, answeredCalls: 0, totalSMS: 0, unreadSMS: 0, readSMS: 0, recentCalls: [], recentSMS: [], recentActivity: [], lastSyncTime: null };
          const [callsTotalRes, missedCallsRes, smsTotalRes, unreadSMSRes, recentCallsRes, recentSMSRes, recentActivityRes] = await Promise.all([
            databases.listDocuments(dbId, CALL_LOGS_COLLECTION_ID, [Query.equal("user_id", uid), Query.limit(1)]),
            databases.listDocuments(dbId, CALL_LOGS_COLLECTION_ID, [Query.equal("user_id", uid), Query.equal("log_type", "missed_call"), Query.limit(1)]),
            databases.listDocuments(dbId, SMS_LOGS_COLLECTION_ID, [Query.equal("user_id", uid), Query.limit(1)]),
            databases.listDocuments(dbId, SMS_LOGS_COLLECTION_ID, [Query.equal("user_id", uid), Query.equal("is_read", false), Query.limit(1)]),
            databases.listDocuments(dbId, CALL_LOGS_COLLECTION_ID, [Query.equal("user_id", uid), Query.orderDesc("timestamp"), Query.limit(5)]),
            databases.listDocuments(dbId, SMS_LOGS_COLLECTION_ID, [Query.equal("user_id", uid), Query.orderDesc("timestamp"), Query.limit(5)]),
            databases.listDocuments(dbId, ACTIVITY_LOGS_COLLECTION_ID, [Query.equal("user_id", uid), Query.orderDesc("timestamp"), Query.limit(10)]),
          ]);
          const syncTimes = linkedDevices.map(d => d.last_sync).filter(Boolean).map(t => new Date(t).getTime());
          return {
            devices: linkedDevices,
            totalCalls: callsTotalRes.total, missedCalls: missedCallsRes.total, answeredCalls: callsTotalRes.total - missedCallsRes.total,
            totalSMS: smsTotalRes.total, unreadSMS: unreadSMSRes.total, readSMS: smsTotalRes.total - unreadSMSRes.total,
            recentCalls: recentCallsRes.documents, recentSMS: recentSMSRes.documents, recentActivity: recentActivityRes.documents,
            lastSyncTime: syncTimes.length > 0 ? new Date(Math.max(...syncTimes)).toISOString() : null,
          };
        },
        staleTime: 30000,
      });
      // ────────────────────────────────────────────────────────

      // Handle redirect logic
      const redirectParam = searchParams.get("redirect");
      if (redirectParam) {
        const decodedRedirect = decodeURIComponent(redirectParam);
        if (decodedRedirect.startsWith("callbridge://")) {
          // Android app deep link redirect
          const delimiter = decodedRedirect.includes("?") ? "&" : "?";
          const deepLinkUrl = `${decodedRedirect}${delimiter}userId=${session.userId}&sessionToken=${session.$id}`;
          
          toast.success("Redirecting back to CallBridge app...");
          setTimeout(() => {
            window.location.href = deepLinkUrl;
          }, 800);
        } else {
          // Standard web redirect
          navigate(decodedRedirect);
        }
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      
      const appwriteErrorCode = error?.code;
      if (appwriteErrorCode === 401) {
        setErrors({ form: "Invalid email or password. Please try again." });
        toast.error("Invalid credentials.", { id: toastId });
      } else if (error?.message?.toLowerCase().includes("network") || error?.message?.toLowerCase().includes("fetch")) {
        toast.error("Connection failed. Please check your internet.", { id: toastId });
      } else {
        setErrors({ form: error?.message || "An unexpected error occurred." });
        toast.error(error?.message || "Login failed.", { id: toastId });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AuthLayout
        heroSlot={
          <>
            <div className="inline-flex max-w-max items-center gap-1.5 rounded-full bg-white/70 shadow-badge-blue border border-white/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Secure Real-Time Monitoring
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] leading-[1.1]">
              Welcome Back to <br />
              <span className="text-primary">
                CallBridge
              </span>
            </h1>

            <p className="mt-6 text-base text-slate-500 sm:text-lg font-normal leading-relaxed max-w-md">
              Access your synchronized dashboard to monitor call logs, SMS activity, and Android device status securely in real time.
            </p>

            {/* HIGH-FIDELITY SMARTPHONE ILLUSTRATION & BADGES */}
            <div className="relative mt-12 hidden w-full lg:block max-w-[460px]">
              <div className="relative w-full aspect-square rounded-[2rem] flex items-center justify-center p-0">
                
                {/* Floating smartphone image */}
                <img 
                  src={phoneMockupImg} 
                  alt="CallBridge Android Mockup" 
                  className="h-[90%] w-[98%] object-contain pointer-events-none animate-float-slow"
                />
                
                {/* Badge 1: Dashboard Secure (top center) */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm border border-white/20 px-4 py-2 shadow-badge-blue z-10">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-slate-700">Dashboard Secure</span>
                </div>

                {/* Badge 2: Calls Synced (left top) */}
                <div className="absolute top-[32%] -left-10 flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm border border-white/20 px-4 py-2 shadow-badge-blue z-10">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-slate-700">Calls Synced</span>
                </div>

                {/* Badge 3: Device Connected (left bottom) */}
                <div className="absolute bottom-[20%] -left-12 flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm border border-white/20 px-4 py-2 shadow-badge-blue z-10">
                  <Smartphone className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-slate-700">Device Connected</span>
                </div>

                {/* Badge 4: SMS Monitored (right top) */}
                <div className="absolute top-[38%] -right-8 flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm border border-white/20 px-4 py-2 shadow-badge-blue z-10">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-slate-700">SMS Monitored</span>
                </div>

                {/* Badge 5: Call Activity Updated (right bottom) */}
                <div className="absolute bottom-[28%] -right-10 flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm border border-white/20 px-4 py-2 shadow-badge-blue z-10">
                  <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" style={{ animationDuration: "10s" }} />
                  <span className="text-xs font-semibold text-slate-700">Call Activity Updated</span>
                </div>

                {/* Badge 6: Monitoring Active (bottom center) */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm border border-white/20 px-4 py-2 shadow-badge-blue z-10">
                  <BarChart2 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-slate-700">Monitoring Active</span>
                </div>
              </div>
            </div>
          </>
        }
        cardSlot={
          <>
            {/* Form Card */}
            <div className="w-full rounded-[2.25rem] bg-white/70 backdrop-blur-md border border-white/20 p-8 shadow-badge-blue sm:p-10">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Login</h2>
                <p className="mt-2.5 text-sm font-normal text-slate-400">Sign in to continue to your dashboard</p>
              </div>

              {/* Global Error Banner */}
              {errors.form && (
                <div className="mt-6 rounded-2xl bg-red-50 p-4 border border-red-100/50">
                  <p className="text-sm font-semibold text-red-600">{errors.form}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                
                {/* Email Address */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold capitalize text-[#0B1B35]">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className={`h-12 rounded-full border-global-border px-4 focus-visible:ring-blue-500 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-xs font-semibold text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold capitalize text-[#0B1B35]">Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`h-12 rounded-full border-global-border px-4 focus-visible:ring-blue-500 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    disabled={isSubmitting}
                    endContent={
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-600 transition focus:outline-none mr-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    }
                  />
                  {errors.password && (
                    <p className="text-xs font-semibold text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Remember me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(!!checked)}
                      disabled={isSubmitting}
                      className="h-4 w-4 border-slate-350 rounded focus-visible:ring-blue-500"
                    />
                    <label htmlFor="remember" className="text-sm font-normal text-slate-500 cursor-pointer select-none">
                      Remember me
                    </label>
                  </div>
                  <a
                    href="/forgot-password"
                    className="text-sm font-semibold text-primary hover:underline transition"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/forgot-password");
                    }}
                  >
                    Forgot Password?
                  </a>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="h-12 w-full bg-btn-primary-gradient shadow-btn-primary text-white rounded-full font-semibold hover:opacity-95 active:opacity-90 transition-all duration-200 mt-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing in...
                    </div>
                  ) : (
                    "Login to Dashboard"
                  )}
                </Button>
              </form>

              <div className="relative my-7">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="bg-global-border/30" />
                </div>
                <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <span className="bg-white px-3">Or</span>
                </div>
              </div>

              {/* Google Login Button */}
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full border border-global-border hover:bg-slate-50 hover:text-slate-900 rounded-full font-semibold flex items-center justify-center gap-2.5 transition bg-white"
                disabled={isSubmitting}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>

              <p className="mt-8 text-center text-sm font-normal text-slate-500">
                Don't have an account?{" "}
                <a href="/register" className=" text-primary hover:underline transition" onClick={(e) => { e.preventDefault(); navigate("/register"); }}>
                  Sign Up
                </a>
              </p>
            </div>

            {/* Feature Highlights Section */}
            <div className="mt-8 w-full space-y-4">
              
              {/* Feature 1 */}
              <div className="flex items-center gap-4 rounded-full bg-white/70 backdrop-blur-sm border border-white/20 px-5 py-3.5 shadow-badge-blue w-full">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100/50">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900">Secure Authentication</h4>
                  <p className="text-xs font-normal text-slate-400 mt-0.5">256-bit AES protection</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-4 rounded-full bg-white/70 backdrop-blur-sm border border-white/20 px-5 py-3.5 shadow-badge-blue w-full">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100/50">
                  <RefreshCw className="h-5 w-5 text-primary animate-spin" style={{ animationDuration: "10s" }} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900">Encrypted Synchronization</h4>
                  <p className="text-xs font-normal text-slate-400 mt-0.5">End-to-end data tunnel</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-4 rounded-full bg-white/70 backdrop-blur-sm border border-white/20 px-5 py-3.5 shadow-badge-blue w-full">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100/50">
                  <Activity className="h-5 w-5 text-primary animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900">Real-Time Monitoring Access</h4>
                  <p className="text-xs font-normal text-slate-400 mt-0.5">Instant low-latency logs</p>
                </div>
              </div>
            </div>
          </>
        }
      />

      {/* Embedded CSS for animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

