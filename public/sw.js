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

// バックグラウンドタイマー機能
let backgroundTimers = new Map();

// タイマーメッセージの処理
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'START_TIMER':
      startBackgroundTimer(data);
      break;
    case 'PAUSE_TIMER':
      pauseBackgroundTimer(data.timerId);
      break;
    case 'RESUME_TIMER':
      resumeBackgroundTimer(data.timerId);
      break;
    case 'STOP_TIMER':
      stopBackgroundTimer(data.timerId);
      break;
    case 'CLEAR_ALL_TIMERS':
      clearAllTimers();
      break;
  }
});

// バックグラウンドタイマーを開始
function startBackgroundTimer(timerData) {
  const { timerId, duration, type, soundType, recipeName } = timerData;
  
  // 既存のタイマーがあれば停止
  if (backgroundTimers.has(timerId)) {
    stopBackgroundTimer(timerId);
  }
  
  const startTime = Date.now();
  const endTime = startTime + (duration * 1000);
  
  const timer = {
    timerId,
    duration,
    type,
    soundType,
    recipeName,
    startTime,
    endTime,
    isPaused: false,
    pausedTime: 0,
    intervalId: null
  };
  
  // タイマーを開始
  timer.intervalId = setInterval(() => {
    const now = Date.now();
    const remainingTime = Math.max(0, Math.ceil((endTime - now) / 1000));
    
    // クライアントに残り時間を送信
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'TIMER_UPDATE',
          data: {
            timerId,
            remainingTime,
            isActive: true
          }
        });
      });
    });
    
    // タイマー終了チェック
    if (remainingTime <= 0) {
      stopBackgroundTimer(timerId);
      // タイマー終了通知
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'TIMER_COMPLETED',
            data: {
              timerId,
              type,
              recipeName,
              soundType
            }
          });
        });
      });
      
      // 通知を表示
      self.registration.showNotification(
        `🍳 ${recipeName}タイマー終了！`,
        {
          body: `${recipeName}ができあがりました！`,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: `timer-${timerId}`,
          requireInteraction: true,
          actions: [
            {
              action: 'stop-sound',
              title: '音を停止'
            },
            {
              action: 'open-app',
              title: 'アプリを開く'
            }
          ]
        }
      );
    }
  }, 1000);
  
  backgroundTimers.set(timerId, timer);
  console.log(`Background timer started: ${timerId}`);
}

// バックグラウンドタイマーを一時停止
function pauseBackgroundTimer(timerId) {
  const timer = backgroundTimers.get(timerId);
  if (timer && !timer.isPaused) {
    timer.isPaused = true;
    timer.pausedTime = Date.now();
    clearInterval(timer.intervalId);
    timer.intervalId = null;
    
    // クライアントに一時停止を通知
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'TIMER_PAUSED',
          data: { timerId }
        });
      });
    });
    
    console.log(`Background timer paused: ${timerId}`);
  }
}

// バックグラウンドタイマーを再開
function resumeBackgroundTimer(timerId) {
  const timer = backgroundTimers.get(timerId);
  if (timer && timer.isPaused) {
    const pausedDuration = Date.now() - timer.pausedTime;
    timer.endTime += pausedDuration;
    timer.isPaused = false;
    timer.pausedTime = 0;
    
    // タイマーを再開
    timer.intervalId = setInterval(() => {
      const now = Date.now();
      const remainingTime = Math.max(0, Math.ceil((timer.endTime - now) / 1000));
      
      // クライアントに残り時間を送信
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'TIMER_UPDATE',
            data: {
              timerId,
              remainingTime,
              isActive: true
            }
          });
        });
      });
      
      // タイマー終了チェック
      if (remainingTime <= 0) {
        stopBackgroundTimer(timerId);
        // タイマー終了通知
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'TIMER_COMPLETED',
              data: {
                timerId,
                type: timer.type,
                recipeName: timer.recipeName,
                soundType: timer.soundType
              }
            });
          });
        });
        
        // 通知を表示
        self.registration.showNotification(
          `🍳 ${timer.recipeName}タイマー終了！`,
          {
            body: `${timer.recipeName}ができあがりました！`,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: `timer-${timerId}`,
            requireInteraction: true,
            actions: [
              {
                action: 'stop-sound',
                title: '音を停止'
              },
              {
                action: 'open-app',
                title: 'アプリを開く'
              }
            ]
          }
        );
      }
    }, 1000);
    
    console.log(`Background timer resumed: ${timerId}`);
  }
}

// バックグラウンドタイマーを停止
function stopBackgroundTimer(timerId) {
  const timer = backgroundTimers.get(timerId);
  if (timer) {
    if (timer.intervalId) {
      clearInterval(timer.intervalId);
    }
    backgroundTimers.delete(timerId);
    
    // クライアントに停止を通知
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'TIMER_STOPPED',
          data: { timerId }
        });
      });
    });
    
    console.log(`Background timer stopped: ${timerId}`);
  }
}

// すべてのタイマーをクリア
function clearAllTimers() {
  backgroundTimers.forEach((timer, timerId) => {
    stopBackgroundTimer(timerId);
  });
  console.log('All background timers cleared');
}

// 通知アクションの処理
self.addEventListener('notificationclick', (event) => {
  const { action, notification } = event;
  
  event.notification.close();
  
  if (action === 'stop-sound') {
    // 音を停止するメッセージをクライアントに送信
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'STOP_SOUND'
        });
      });
    });
  } else if (action === 'open-app' || !action) {
    // アプリを開く
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === self.location.origin && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});