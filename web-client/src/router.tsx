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
      <div className="flex min-h-screen w-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500" />
          <p className="text-sm font-semibold text-slate-400 tracking-wide">
            Restoring your session...
          </p>
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
