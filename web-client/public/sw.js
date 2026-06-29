/**
 * CallBridge Service Worker
 * Handles notification click events, focuses active application tabs, 
 * and navigates routing smoothly.
 */

self.addEventListener('install', (event) => {
  // Force immediate activation
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim all clients immediately
  event.waitUntil(clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  // Close the notification bubble
  event.notification.close();

  // Retrieve the target URL from the payload
  const targetUrl = event.notification.data && event.notification.data.url 
    ? event.notification.data.url 
    : '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. If a tab is already open, focus it and navigate smoothly via postMessage
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        const clientUrl = new URL(client.url);
        
        // Check if the open window belongs to our application origin
        if (clientUrl.origin === self.location.origin && 'focus' in client) {
          client.focus();
          
          // Dispatch navigation message to SPA router listener
          if (client.postMessage) {
            client.postMessage({ 
              type: 'NAVIGATE', 
              url: targetUrl 
            }, '*');
          }
          return;
        }
      }

      // 2. If no tab is open, open a new window directly at the target URL
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
