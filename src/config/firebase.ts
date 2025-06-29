// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { firebaseConfig } from './index';

// Firebase設定の検証
const validateFirebaseConfig = (): boolean => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingFields = requiredFields.filter(
    (field) => !firebaseConfig[field as keyof typeof firebaseConfig]
  );

  if (missingFields.length > 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚧 Development mode: Missing Firebase config fields:', missingFields);
      return false;
    } else {
      console.error('❌ Production: Missing required Firebase config:', missingFields);
      throw new Error(`Missing Firebase configuration: ${missingFields.join(', ')}`);
    }
  }

  return true;
};

// Firebase設定の可用性をチェック
const isFirebaseConfigValid = validateFirebaseConfig();

// Firebase初期化（設定が有効な場合のみ）
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let analytics: any = null;

if (isFirebaseConfigValid) {
  try {
    console.log('🚀 Initializing Firebase with valid config');
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Analytics は本番環境でのみ有効化
    if (process.env.NODE_ENV !== 'development') {
      analytics = isSupported().then((yes) => (yes ? getAnalytics(app) : null));
    } else {
      analytics = Promise.resolve(null);
      console.log('🚧 Development: Firebase Analytics disabled');
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
} else {
  // 開発環境用のモック設定
  console.log('🎭 Development mode: Using mock Firebase services');

  // モックオブジェクトを提供
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    signOut: () => Promise.resolve(),
  };

  db = {
    collection: () => ({
      add: () => Promise.reject(new Error('Firebase not configured')),
      doc: () => ({
        get: () => Promise.reject(new Error('Firebase not configured')),
        set: () => Promise.reject(new Error('Firebase not configured')),
        update: () => Promise.reject(new Error('Firebase not configured')),
        delete: () => Promise.reject(new Error('Firebase not configured')),
      }),
    }),
  };

  storage = {
    ref: () => ({
      put: () => Promise.reject(new Error('Firebase not configured')),
      getDownloadURL: () => Promise.reject(new Error('Firebase not configured')),
    }),
  };

  analytics = Promise.resolve(null);
}

export { auth, db, storage, analytics };
export default app;

// Firebase設定状態をエクスポート
export const isFirebaseEnabled = isFirebaseConfigValid;
