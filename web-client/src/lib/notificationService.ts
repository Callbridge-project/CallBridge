/**
 * Notification Service for CallBridge
 * Manages browser notification permissions, service worker registrations, 
 * and local simulated push notifications.
 */

// Register the service worker located in the public directory
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn("Service Workers are not supported in this browser.");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log("Service Worker registered successfully with scope:", registration.scope);
    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return null;
  }
};

// Request desktop notification permission from the user
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn("This browser does not support desktop notifications.");
    return "default";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Failed to request notification permission:", error);
    return "default";
  }
};

// Check current notification permission status
export const getNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return "denied";
  }
  return Notification.permission;
};

// Trigger a native OS notification via the service worker or fallback API
export const triggerNotification = async (
  title: string, 
  body: string, 
  targetPath: string = "/dashboard"
) => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== "granted") return;

  // Check if notifications are enabled in settings (key: cb_notifications_enabled)
  const isEnabled = localStorage.getItem("cb_notifications_enabled") === "true";
  if (!isEnabled) return;

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        registration.showNotification(title, {
          body,
          icon: '/logo.png',
          badge: '/logo.png',
          data: {
            url: targetPath
          }
        });
        return;
      }
    }

    // Fallback to standard Notification API if service worker is not active
    new Notification(title, {
      body,
      icon: '/logo.png'
    });
  } catch (e) {
    console.error("Error displaying local notification:", e);
  }
};
