/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDEx-sUHYz6ir6RtwR75s09BGnLccWhnGM",
  authDomain: "chocolate-mine.firebaseapp.com",
  projectId: "chocolate-mine",
  storageBucket: "chocolate-mine.firebasestorage.app",
  messagingSenderId: "667672016435",
  appId: "1:667672016435:web:8831bf4580d85ec39d1546"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Handle background messages (when tab is closed or app not focused)
  messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received:', payload);

    // Prioritize data attributes for data-only payloads
    const title = payload.data?.title || payload.notification?.title || 'The Chocolate Mine';
    const body = payload.data?.message || payload.notification?.body || 'You have a new notification';
    const data = payload.data || {};

    const notificationOptions = {
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: data.type || data.orderId || 'general',
      renotify: true,
      requireInteraction: false,
      vibrate: [200, 100, 200],
      data: {
        url: data.url || (data.orderId ? `/track/${data.orderId}` : '/'),
        type: data.type || 'general',
        orderId: data.orderId || null,
        productId: data.productId || null
      },
      actions: []
    };

    // Add contextual actions based on type
    if (data.type && data.type.includes('order')) {
      notificationOptions.actions = [
        { action: 'view', title: '👀 View Order' }
      ];
    } else if (data.type && (data.type.includes('product') || data.type.includes('stock') || data.type.includes('offer'))) {
      notificationOptions.actions = [
        { action: 'view', title: '🛍️ View Product' }
      ];
    }

    // CRITICAL MOBILE FIX: Return the promise so the OS doesn't kill the worker early
    return self.registration.showNotification(title, notificationOptions);
  });

  // Native Push Fallback Listener for Mobile Background Lock Screen
  self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
      const payload = event.data.json();
      const title = payload.data?.title || payload.notification?.title || 'The Chocolate Mine';
      const body = payload.data?.message || payload.notification?.body || 'You have a new update!';
      const data = payload.data || {};

      event.waitUntil(
        self.registration.showNotification(title, {
          body,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: data.type || data.orderId || 'general',
          renotify: true,
          vibrate: [200, 100, 200],
          data: {
            url: data.url || (data.orderId ? `/track/${data.orderId}` : '/'),
            type: data.type || 'general'
          }
        })
      );
    } catch (err) {
      console.warn('[SW] Push event fallback processing skipped:', err);
    }
  });

  // Handle notification click
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data || {};

    // URL CLEANUP FIX: Safe construction preventing double slashes (//)
    const targetUrl = new URL(data.url || '/', self.location.origin).href;

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        // Try to focus an existing window matching the exact URL
        for (const client of windowClients) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        // Try to navigate an existing open window to the target URL
        for (const client of windowClients) {
          if ('navigate' in client) {
            return client.navigate(targetUrl).then((c) => c?.focus());
          }
        }
        // Open a completely new window/tab if none are available
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
    );
  });

  // Handle notification close
  self.addEventListener('notificationclose', (event) => {
    console.log('[SW] Notification closed:', event.notification.tag);
  });

} catch (e) {
  console.warn('[SW] Firebase initialization failed:', e);
}
