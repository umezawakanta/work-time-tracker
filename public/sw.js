// Service Worker for PWA Badge functionality
const CACHE_NAME = 'work-time-tracker-v2';
const STATIC_CACHE = 'work-time-tracker-static-v2';
const DYNAMIC_CACHE = 'work-time-tracker-dynamic-v2';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting(); // 新しいサービスワーカーを即座に有効化
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // 古いキャッシュを削除
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // すべてのクライアントを制御
      self.clients.claim()
    ])
  );
});

// Fetch event - Network First strategy for better Safari compatibility
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 同じオリジンのリクエストのみ処理
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(
    // ネットワークファースト戦略
    fetch(request)
      .then((response) => {
        // 成功したレスポンスをキャッシュに保存
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // ネットワークが失敗した場合のみキャッシュを使用
        return caches.match(request).then((response) => {
          if (response) {
            return response;
          }
          // キャッシュにもない場合は、オフライン用のフォールバック
          if (request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Badge API support
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_BADGE') {
    const { count } = event.data;
    
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        navigator.setAppBadge(count).catch((error) => {
          console.error('Failed to set app badge:', error);
        });
      } else {
        navigator.clearAppBadge().catch((error) => {
          console.error('Failed to clear app badge:', error);
        });
      }
    } else {
      console.log('App Badge API not supported');
    }
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url === self.location.origin && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Handle background sync here
  }
});
