// PWA Utility Functions

// Check if app is installed
export const isAppInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://');
};

// Check if PWA installation is available
export const canInstallPWA = () => {
  return 'serviceWorker' in navigator && 
         'PushManager' in window &&
         'Notification' in window;
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Show notification
export const showNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    const defaultOptions = {
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [200, 100, 200],
      ...options
    };
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options: defaultOptions
      });
    } else {
      new Notification(title, defaultOptions);
    }
  }
};

// Schedule periodic sync (for data backup)
export const schedulePeriodicSync = async () => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    if ('periodicSync' in registration) {
      try {
        await registration.periodicSync.register('data-backup', {
          minInterval: 24 * 60 * 60 * 1000 // 24 hours
        });
      } catch (error) {
        console.log('Periodic sync not supported:', error);
      }
    }
  }
};

// Export data for offline use
export const cacheDataOffline = async (data) => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('offline-data-v1');
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put('/offline-data', response);
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }
};

// Get cached data when offline
export const getCachedData = async () => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('offline-data-v1');
      const response = await cache.match('/offline-data');
      if (response) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get cached data:', error);
    }
  }
  return null;
};
