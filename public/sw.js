// Service Worker for Web Push Notifications

const CACHE_NAME = 'rental-app-v1';

// Install event - force immediate activation
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - claim all clients immediately
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(
    Promise.all([
      // Clear old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients immediately
      self.clients.claim()
    ])
  );
});

// Handle push events
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  console.log('Service Worker is active and handling push event');
  
  let notificationData = {
    title: 'Task Reminder',
    body: 'You have a task due soon',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'task-reminder',
    data: {
      url: '/tasks'
    }
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        ...payload
      };
      console.log('Parsed push payload:', payload);
    }
  } catch (error) {
    console.error('Error parsing push payload:', error);
  }

  console.log('About to show notification with data:', notificationData);

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: [
        {
          action: 'view',
          title: 'View Task'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      requireInteraction: false, // Changed to false for macOS compatibility
      silent: false, // Make sure sound is enabled
      renotify: true, // Show even if same tag exists
      vibrate: [200, 100, 200], // Add vibration pattern
      // Additional options for better visibility
      dir: 'auto',
      lang: 'en-US'
    }
  ).then(() => {
    console.log('Notification shown successfully');
    // Keep service worker alive for a bit longer
    return new Promise(resolve => setTimeout(resolve, 5000));
  }).catch((error) => {
    console.error('Error showing notification:', error);
  });

  event.waitUntil(promiseChain);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Default action or 'view' action
  const urlToOpen = event.notification.data?.url || '/tasks';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus an existing window
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle background sync (for offline support if needed)
self.addEventListener('sync', (event) => {
  if (event.tag === 'task-reminder-sync') {
    event.waitUntil(
      // Here you could implement offline task reminder sync
      console.log('Background sync triggered')
    );
  }
});
