// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { firebaseConfig } from './index';

// 開発環境での設定検証をスキップ
const validateFirebaseConfig = (): void => {
  if (import.meta.env.DEV) {
    console.warn('🚧 Development mode: Skipping Firebase config validation');
    return;
  }

  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  requiredFields.forEach((field) => {
    if (!firebaseConfig[field as keyof typeof firebaseConfig]) {
      console.error(`Missing required Firebase config: ${field}`);
    }
  });
};

validateFirebaseConfig();

// ダミー設定で初期化（開発環境のみ）
const developmentConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-project',
  storageBucket: 'demo-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456',
};

// Firebase初期化
const app = initializeApp(
  import.meta.env.DEV && !firebaseConfig.apiKey ? developmentConfig : firebaseConfig
);

// Firebase services（エラーハンドリング付き）
let auth, db, storage, analytics;

try {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  analytics = isSupported().then((yes) => (yes ? getAnalytics(app) : null));
} catch (error) {
  console.warn('🚧 Firebase services initialization failed (development mode)');
  if (import.meta.env.DEV) {
    // 開発環境ではモックオブジェクトを提供
    auth = {} as any;
    db = {} as any;
    storage = {} as any;
    analytics = Promise.resolve(null);
  } else {
    throw error;
  }
}

export { auth, db, storage, analytics };
export default app;
