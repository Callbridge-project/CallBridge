import { lazy, useEffect, Suspense } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import { usePrefetchModules } from "@/hooks/usePrefetchModules";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import PolicyPage from "@/pages/web-dashboard/PolicyPage";
import LandingPage from "@/pages/public/LandingPage";
import AndroidPage from "@/pages/public/AndroidPage";
import DashboardPreviewPage from "@/pages/public/DashboardPreviewPage";
import ContactPage from "@/pages/public/ContactPage";

const NotFound = lazy(() => import("@/pages/not-found"));
const DashboardPage = lazy(() => import("@/pages/web-dashboard/DashboardPage"));
const CallsPage = lazy(() => import("@/pages/web-dashboard/CallsPage"));
const SmsPage = lazy(() => import("@/pages/web-dashboard/SmsPage"));
const DevicePage = lazy(() => import("@/pages/web-dashboard/DevicePage"));
const ActivityLogsPage = lazy(
  () => import("@/pages/web-dashboard/ActivityLogsPage"),
);
const SettingsPage = lazy(() => import("@/pages/web-dashboard/SettingsPage"));
const SupportPage = lazy(() => import("@/pages/web-dashboard/SupportPage"));
const ForgotPasswordPage = lazy(
  () => import("@/pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(
  () => import("@/pages/auth/ResetPasswordPage"),
);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export const AppRouter = () => {
  const { isLoading } = useAuth();

  // Prefetch all lazy-loaded dashboard pages when authenticated
  usePrefetchModules();

  // Full-page session restore spinner on mount to prevent unauthenticated layout flashes
if (isLoading) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f0c20] via-[#1a0b2e] to-[#2b0938] text-white select-none">
      
      {/* Soft Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        
        {/* Animated Dual Spinner Container */}
        <div className="relative flex items-center justify-center w-20 h-20">
          
          {/* Subtle Outer Pulsing Ring */}
          <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping opacity-75" />
          
          {/* Outer Rotating Gradient Ring */}
          <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-purple-500 border-r-fuchsia-400 animate-spin" />
          
          {/* Inner Counter-Rotating Ring */}
          <div className="absolute w-10 h-10 rounded-full border-4 border-transparent border-b-purple-300 border-l-indigo-400 animate-[spin_1.5s_linear_infinite_reverse]" />
          
          {/* Center Glowing Dot */}
          <div className="absolute w-3 h-3 rounded-full bg-fuchsia-400 shadow-[0_0_12px_#e879f9]" />
        </div>

        {/* Text Section */}
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-fuchsia-200 to-indigo-200">
            Wellcome to CallBridge.....
          </h2>
          <p className="text-xs font-medium tracking-wider text-purple-300/60 uppercase">
            Restoring session
          </p>
        </div>

      </div>
    </div>
  );
}

  return (
    <main>
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
          </div>
        }
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/android" element={<AndroidPage />} />
          <Route path="/dashboard-preview" element={<DashboardPreviewPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/policy" element={<PolicyPage />} />

          {/* Protected Routes mounted inside the global AppShell layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/calls" element={<CallsPage />} />
            <Route path="/sms" element={<SmsPage />} />
            <Route path="/device" element={<DevicePage />} />
            <Route path="/activity" element={<ActivityLogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/support" element={<SupportPage />} />
          </Route>

          {/* Fallback 404 Page (renders outside the shell for full screen focus) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </main>
  );
};
