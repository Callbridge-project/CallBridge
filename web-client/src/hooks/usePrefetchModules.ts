import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * usePrefetchModules
 *
 * After login or session restore, silently prefetches (downloads + caches) the lazy-loaded
 * dashboard page chunks in the background.
 *
 * This runs as a fire-and-forget in the background — it does NOT block rendering.
 * By the time the user clicks a dashboard navigation link, the JS chunk is already
 * in the browser cache, eliminating the root Suspense loading screen flash.
 */
export function usePrefetchModules() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.$id) return;

    // List of lazy-loaded dashboard chunks
    const prefetchQueue: Array<() => Promise<unknown>> = [
      () => import("@/pages/web-dashboard/DashboardPage"),
      () => import("@/pages/web-dashboard/CallsPage"),
      () => import("@/pages/web-dashboard/SmsPage"),
      () => import("@/pages/web-dashboard/DevicePage"),
      () => import("@/pages/web-dashboard/ActivityLogsPage"),
      () => import("@/pages/web-dashboard/SettingsPage"),
      () => import("@/pages/web-dashboard/SupportPage"),
    ];

    // Fire all prefetches simultaneously in the background.
    // Using requestIdleCallback so we don't compete with critical initial rendering.
    const prefetch = () => {
      prefetchQueue.forEach((loader) => {
        // Intentionally NOT awaited — pure fire-and-forget cache warming
        loader().catch(() => {
          // Silently ignore prefetch failures (offline, slow connection, etc.)
        });
      });
    };

    if ("requestIdleCallback" in window) {
      const idleId = requestIdleCallback(prefetch, { timeout: 2000 });
      return () => cancelIdleCallback(idleId);
    } else {
      // Safari fallback
      const timer = setTimeout(prefetch, 300);
      return () => clearTimeout(timer);
    }
  }, [user?.$id]);
}
