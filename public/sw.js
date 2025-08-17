// Service Worker for Web Push Notifications

const CACHE_NAME = 'rental-app-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

// Handle push events
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
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
      vibrate: [200, 100, 200] // Add vibration pattern
    }
  ).then(() => {
    console.log('Notification shown successfully');
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
