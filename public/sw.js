// ADHD統合ライフハブ - サービスワーカー v1.0.0
// オフライン機能、背景同期、プッシュ通知対応

const CACHE_NAME = 'adhd-life-hub-v1.0.0';
const DATA_CACHE_NAME = 'adhd-data-v1.0.0';

// キャッシュ対象ファイル（App Shell）
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',

    // 重要なページ
    '/adhd-task-manager',
    '/adhd-cognitive-assessment',
    '/asset-liability-report',
    '/impulse-control',
    '/adhd-integrated-life',

    // オフライン画像・フォント
    '/assets/offline-illustration.svg',
    '/assets/fonts/roboto-regular.woff2',
    '/assets/fonts/roboto-medium.woff2',
];

// APIエンドポイント（データキャッシュ対象）
const DATA_ENDPOINTS = [
    '/api/cognitive-profile',
    '/api/energy-patterns',
    '/api/tasks',
    '/api/assets',
    '/api/transactions',
    '/api/budgets',
];

// ADHD特化：重要度によるキャッシュ戦略
const CACHE_STRATEGIES = {
    critical: 'cache-first',      // 認知評価、緊急機能
    important: 'network-first',   // タスク、資産データ
    normal: 'stale-while-revalidate', // 一般コンテンツ
    background: 'background-sync',     // 低優先度データ
};

// ADHD配慮：集中状態検出とキャッシュ最適化
let userFocusState = 'normal'; // normal, focused, distracted, hyperfocus
let networkQuality = 'good';   // good, slow, offline

/**
 * インストールイベント
 */
self.addEventListener('install', (event) => {
    console.log('🔧 サービスワーカー インストール開始');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 App Shell キャッシュ中...');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                console.log('✅ App Shell キャッシュ完了');
                // 即座にアクティベート
                self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ キャッシュエラー:', error);
            })
    );
});

/**
 * アクティベートイベント
 */
self.addEventListener('activate', (event) => {
    console.log('🚀 サービスワーカー アクティベート');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // 古いキャッシュを削除
                    if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                        console.log('🗑️ 古いキャッシュ削除:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // 即座にクライアントを制御
            self.clients.claim();
            console.log('✅ サービスワーカー 制御開始');

            // ADHD配慮：初期設定とユーザー状態検出開始
            initializeADHDOptimizations();
        })
    );
});

/**
 * フェッチイベント（リクエスト処理）
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // ADHD配慮：ユーザーの集中状態に応じた処理
    const strategy = determineStrategy(request, userFocusState);

    if (url.origin === location.origin) {
        if (isDataRequest(request)) {
            // データAPIリクエスト
            event.respondWith(handleDataRequest(request, strategy));
        } else {
            // App Shellリクエスト
            event.respondWith(handleAppShellRequest(request));
        }
    }
});

/**
 * ADHD最適化初期化
 */
function initializeADHDOptimizations() {
    // ユーザーの行動パターンを学習
    startUserBehaviorLearning();

    // 集中状態検出
    startFocusStateDetection();

    // ネットワーク品質監視
    startNetworkQualityMonitoring();

    // 認知負荷軽減キャッシュ
    preloadCriticalResources();
}

/**
 * キャッシュ戦略決定（ADHD特化）
 */
function determineStrategy(request, focusState) {
    const url = new URL(request.url);

    // 緊急機能（衝動制御、認知評価）は最優先
    if (url.pathname.includes('impulse-control') ||
        url.pathname.includes('emergency') ||
        url.pathname.includes('cognitive-assessment')) {
        return 'cache-first';
    }

    // ハイパーフォーカス時は中断を最小化
    if (focusState === 'hyperfocus') {
        return 'cache-first';
    }

    // 注意散漫時は高速レスポンス重視
    if (focusState === 'distracted') {
        return 'cache-first';
    }

    // 通常時はネットワーク品質に応じて
    if (networkQuality === 'slow' || networkQuality === 'offline') {
        return 'cache-first';
    }

    return 'network-first';
}

/**
 * データリクエスト判定
 */
function isDataRequest(request) {
    return DATA_ENDPOINTS.some(endpoint =>
        request.url.includes(endpoint)
    ) || request.url.includes('/api/');
}

/**
 * App Shell リクエスト処理
 */
function handleAppShellRequest(request) {
    return caches.open(CACHE_NAME)
        .then((cache) => {
            return cache.match(request)
                .then((response) => {
                    if (response) {
                        // キャッシュヒット
                        return response;
                    }

                    // ネットワークフォールバック
                    return fetch(request)
                        .then((fetchResponse) => {
                            // 成功した場合はキャッシュに保存
                            if (fetchResponse.status === 200) {
                                cache.put(request, fetchResponse.clone());
                            }
                            return fetchResponse;
                        })
                        .catch(() => {
                            // オフライン時のフォールバック
                            if (request.mode === 'navigate') {
                                return cache.match('/offline.html') ||
                                    cache.match('/index.html');
                            }
                            return new Response('オフラインです', {
                                status: 503,
                                statusText: 'Service Unavailable'
                            });
                        });
                });
        });
}

/**
 * データリクエスト処理（ADHD最適化）
 */
function handleDataRequest(request, strategy) {
    const cacheName = DATA_CACHE_NAME;

    switch (strategy) {
        case 'cache-first':
            return cacheFirst(request, cacheName);
        case 'network-first':
            return networkFirst(request, cacheName);
        case 'stale-while-revalidate':
            return staleWhileRevalidate(request, cacheName);
        default:
            return networkFirst(request, cacheName);
    }
}

/**
 * キャッシュファースト戦略
 */
function cacheFirst(request, cacheName) {
    return caches.open(cacheName)
        .then((cache) => {
            return cache.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        // ADHD配慮：キャッシュヒット時の軽量バックグラウンド更新
                        updateCacheInBackground(request, cache);
                        return cachedResponse;
                    }

                    // キャッシュミス時のネットワーク取得
                    return fetch(request)
                        .then((response) => {
                            if (response.status === 200) {
                                cache.put(request, response.clone());
                            }
                            return response;
                        })
                        .catch(() => {
                            return createOfflineResponse(request);
                        });
                });
        });
}

/**
 * ネットワークファースト戦略
 */
function networkFirst(request, cacheName) {
    return fetch(request)
        .then((response) => {
            if (response.status === 200) {
                // 成功時はキャッシュ更新
                caches.open(cacheName)
                    .then((cache) => cache.put(request, response.clone()));
            }
            return response;
        })
        .catch(() => {
            // ネットワークエラー時はキャッシュフォールバック
            return caches.open(cacheName)
                .then((cache) => cache.match(request))
                .then((cachedResponse) => {
                    return cachedResponse || createOfflineResponse(request);
                });
        });
}

/**
 * Stale While Revalidate戦略
 */
function staleWhileRevalidate(request, cacheName) {
    return caches.open(cacheName)
        .then((cache) => {
            return cache.match(request)
                .then((cachedResponse) => {
                    // バックグラウンドで更新
                    const fetchPromise = fetch(request)
                        .then((response) => {
                            if (response.status === 200) {
                                cache.put(request, response.clone());
                            }
                            return response;
                        });

                    // キャッシュがあれば即座に返す、なければ待つ
                    return cachedResponse || fetchPromise;
                });
        });
}

/**
 * バックグラウンドキャッシュ更新
 */
function updateCacheInBackground(request, cache) {
    // ADHD配慮：ユーザーの集中を妨げないように低優先度で実行
    if (userFocusState !== 'hyperfocus') {
        fetch(request)
            .then((response) => {
                if (response.status === 200) {
                    cache.put(request, response.clone());
                }
            })
            .catch(() => {
                // サイレントエラー（集中を妨げない）
            });
    }
}

/**
 * オフラインレスポンス生成
 */
function createOfflineResponse(request) {
    const url = new URL(request.url);

    if (url.pathname.includes('/api/')) {
        // API向けオフラインレスポンス
        return new Response(JSON.stringify({
            error: 'オフライン',
            message: 'ネットワークに接続できません。オフラインモードで動作しています。',
            offline: true,
            timestamp: new Date().toISOString(),
        }), {
            status: 503,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // HTML向けオフラインページ
    return new Response(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>オフライン - ADHDライフハブ</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          padding: 20px;
        }
        .container {
          max-width: 400px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 { margin-bottom: 20px; font-size: 2em; }
        p { margin-bottom: 15px; line-height: 1.6; }
        .icon { font-size: 4em; margin-bottom: 20px; }
        .retry-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          margin-top: 20px;
          transition: all 0.3s ease;
        }
        .retry-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        .adhd-note {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 15px;
          margin-top: 20px;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🌐</div>
        <h1>オフラインモード</h1>
        <p>現在ネットワークに接続できません。</p>
        <p>キャッシュされたデータで一部機能をご利用いただけます。</p>
        
        <div class="adhd-note">
          <strong>💡 ADHD配慮機能</strong><br>
          集中を維持するため、オフライン時も重要な機能は利用できます
        </div>
        
        <button class="retry-btn" onclick="window.location.reload()">
          再接続を試す
        </button>
      </div>
      
      <script>
        // 自動再接続試行
        window.addEventListener('online', () => {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        });
      </script>
    </body>
    </html>
  `, {
        status: 503,
        headers: {
            'Content-Type': 'text/html',
        },
    });
}

/**
 * 重要リソースのプリロード
 */
function preloadCriticalResources() {
    // ADHD特化：認知負荷軽減のため重要機能を先読み
    const criticalResources = [
        '/api/cognitive-profile',
        '/api/energy-patterns',
        '/api/current-tasks',
        '/api/emergency-contacts',
    ];

    criticalResources.forEach((resource) => {
        fetch(resource)
            .then((response) => {
                if (response.status === 200) {
                    caches.open(DATA_CACHE_NAME)
                        .then((cache) => cache.put(resource, response.clone()));
                }
            })
            .catch(() => {
                // サイレントエラー
            });
    });
}

/**
 * ユーザー行動学習開始
 */
function startUserBehaviorLearning() {
    // ページアクセスパターンを学習してプリキャッシュ最適化
    self.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'USER_BEHAVIOR') {
            const { action, page, timestamp, focusState } = event.data;

            // 行動パターンをIndexedDBに保存
            saveUserBehaviorData({
                action,
                page,
                timestamp,
                focusState,
            });

            // リアルタイムでキャッシュ戦略を調整
            adaptCacheStrategy(action, page, focusState);
        }
    });
}

/**
 * 集中状態検出開始
 */
function startFocusStateDetection() {
    self.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'FOCUS_STATE_UPDATE') {
            userFocusState = event.data.state;
            console.log('🧠 集中状態更新:', userFocusState);

            // 集中状態に応じたキャッシュ最適化
            optimizeForFocusState(userFocusState);
        }
    });
}

/**
 * ネットワーク品質監視開始
 */
function startNetworkQualityMonitoring() {
    // Connection API使用（利用可能な場合）
    if ('connection' in navigator) {
        const connection = navigator.connection;

        function updateNetworkQuality() {
            if (connection.effectiveType === '4g') {
                networkQuality = 'good';
            } else if (connection.effectiveType === '3g') {
                networkQuality = 'slow';
            } else {
                networkQuality = 'slow';
            }

            console.log('📶 ネットワーク品質:', networkQuality);
        }

        connection.addEventListener('change', updateNetworkQuality);
        updateNetworkQuality();
    }
}

/**
 * 集中状態最適化
 */
function optimizeForFocusState(focusState) {
    switch (focusState) {
        case 'hyperfocus':
            // ハイパーフォーカス時：中断最小化
            console.log('🎯 ハイパーフォーカスモード：中断最小化');
            break;

        case 'distracted':
            // 注意散漫時：高速レスポンス
            console.log('🌪️ 注意散漫モード：高速レスポンス重視');
            preloadFrequentlyUsedResources();
            break;

        case 'focused':
            // 集中時：バランス重視
            console.log('🎯 集中モード：バランス重視');
            break;

        default:
            // 通常時：標準動作
            console.log('😊 通常モード：標準動作');
            break;
    }
}

/**
 * よく使うリソースのプリロード
 */
function preloadFrequentlyUsedResources() {
    const frequentResources = [
        '/adhd-task-manager',
        '/impulse-control',
        '/api/current-energy-level',
        '/api/quick-tasks',
    ];

    frequentResources.forEach((resource) => {
        fetch(resource)
            .then((response) => {
                if (response.status === 200) {
                    caches.open(CACHE_NAME)
                        .then((cache) => cache.put(resource, response.clone()));
                }
            })
            .catch(() => {
                // サイレントエラー
            });
    });
}

/**
 * ユーザー行動データ保存
 */
function saveUserBehaviorData(data) {
    // IndexedDBに行動データを保存（簡易実装）
    const storageKey = 'user-behavior-patterns';
    const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existingData.push(data);

    // 最新1000件のみ保持
    if (existingData.length > 1000) {
        existingData.splice(0, existingData.length - 1000);
    }

    localStorage.setItem(storageKey, JSON.stringify(existingData));
}

/**
 * キャッシュ戦略適応
 */
function adaptCacheStrategy(action, page, focusState) {
    // ADHD特化：使用パターンに基づく動的最適化
    if (action === 'frequent_access' && focusState === 'focused') {
        // 集中時によくアクセスするページは積極的にキャッシュ
        preloadPage(page);
    }
}

/**
 * ページプリロード
 */
function preloadPage(page) {
    fetch(page)
        .then((response) => {
            if (response.status === 200) {
                caches.open(CACHE_NAME)
                    .then((cache) => cache.put(page, response.clone()));
            }
        })
        .catch(() => {
            // サイレントエラー
        });
}

/**
 * プッシュ通知処理
 */
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();

    // ADHD配慮：集中時間中は通知を遅延
    if (userFocusState === 'hyperfocus' && data.priority !== 'critical') {
        // 集中終了後に通知予約
        scheduleDelayedNotification(data);
        return;
    }

    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: data.urgent ? [200, 100, 200] : [100],
        data: data.data,
        actions: data.actions || [],
        requireInteraction: data.urgent || false,
        silent: userFocusState === 'focused' && !data.urgent,
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

/**
 * 通知クリック処理
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then((clientList) => {
                // 既存のウィンドウがあればフォーカス
                for (const client of clientList) {
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus();
                    }
                }

                // 新しいウィンドウを開く
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

/**
 * 背景同期処理
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'cognitive-data-sync') {
        event.waitUntil(syncCognitiveData());
    } else if (event.tag === 'energy-pattern-sync') {
        event.waitUntil(syncEnergyPatterns());
    } else if (event.tag === 'task-data-sync') {
        event.waitUntil(syncTaskData());
    }
});

/**
 * 認知データ同期
 */
function syncCognitiveData() {
    return fetch('/api/sync/cognitive-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            timestamp: new Date().toISOString(),
            source: 'service-worker-sync',
        }),
    })
        .then((response) => {
            if (response.ok) {
                console.log('✅ 認知データ同期完了');
            } else {
                throw new Error('認知データ同期失敗');
            }
        })
        .catch((error) => {
            console.error('❌ 認知データ同期エラー:', error);
            throw error; // 再試行のため
        });
}

/**
 * エネルギーパターン同期
 */
function syncEnergyPatterns() {
    return fetch('/api/sync/energy-patterns', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            timestamp: new Date().toISOString(),
            source: 'service-worker-sync',
        }),
    })
        .then((response) => {
            if (response.ok) {
                console.log('✅ エネルギーパターン同期完了');
            } else {
                throw new Error('エネルギーパターン同期失敗');
            }
        })
        .catch((error) => {
            console.error('❌ エネルギーパターン同期エラー:', error);
            throw error;
        });
}

/**
 * タスクデータ同期
 */
function syncTaskData() {
    return fetch('/api/sync/task-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            timestamp: new Date().toISOString(),
            source: 'service-worker-sync',
        }),
    })
        .then((response) => {
            if (response.ok) {
                console.log('✅ タスクデータ同期完了');
            } else {
                throw new Error('タスクデータ同期失敗');
            }
        })
        .catch((error) => {
            console.error('❌ タスクデータ同期エラー:', error);
            throw error;
        });
}

/**
 * 遅延通知スケジューリング
 */
function scheduleDelayedNotification(data) {
    // 簡易実装：5分後に通知
    setTimeout(() => {
        if (userFocusState !== 'hyperfocus') {
            self.registration.showNotification(data.title, {
                body: data.body + ' (遅延通知)',
                icon: '/icons/icon-192x192.png',
                tag: 'delayed-' + Date.now(),
            });
        }
    }, 5 * 60 * 1000);
}

console.log('🚀 ADHD統合ライフハブ サービスワーカー 起動完了'); 