// src/services/firebaseService.ts
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { AssetEntry, DebtEntry, FinancialGoal, LongTermDataPoint } from '@/types';

// Firebaseの設定（本番環境では環境変数から取得することを推奨）
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * 現在のログインユーザーを取得
 */
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * ユーザーの資産データを取得
 */
export const fetchAssets = async (): Promise<AssetEntry[]> => {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  try {
    const assetsRef = collection(db, 'users', user.uid, 'assets');
    const q = query(assetsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    const assets: AssetEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      assets.push({
        id: doc.id,
        account: data.account,
        value: data.value,
        date: data.date,
        category: data.category,
        isLiquid: data.isLiquid || false,
        interestRate: data.interestRate || 0,
        notes: data.notes || '',
      });
    });

    return assets;
  } catch (error) {
    console.error('Error fetching assets:', error);
    return [];
  }
};

/**
 * ユーザーの負債データを取得
 */
export const fetchDebts = async (): Promise<DebtEntry[]> => {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  try {
    const debtsRef = collection(db, 'users', user.uid, 'debts');
    const q = query(debtsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    const debts: DebtEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      debts.push({
        id: doc.id,
        account: data.account,
        value: data.value,
        date: data.date,
        interestRate: data.interestRate || 0,
        minimumPayment: data.minimumPayment || 0,
        dueDate: data.dueDate || '',
        notes: data.notes || '',
        description: '',
      });
    });

    return debts;
  } catch (error) {
    console.error('Error fetching debts:', error);
    return [];
  }
};

/**
 * 資産データを追加または更新
 */
export const saveAsset = async (asset: AssetEntry): Promise<string> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('認証が必要です');
  }

  try {
    const assetsRef = collection(db, 'users', user.uid, 'assets');

    // 既存のassetを更新するか、新規作成するか
    if (asset.id) {
      const assetRef = doc(db, 'users', user.uid, 'assets', asset.id);
      await updateDoc(assetRef, {
        account: asset.account,
        value: asset.value,
        date: asset.date,
        category: asset.category,
        isLiquid: asset.isLiquid || false,
        interestRate: asset.interestRate || 0,
        notes: asset.notes || '',
        updatedAt: Timestamp.now(),
      });
      return asset.id;
    } else {
      const docRef = await addDoc(assetsRef, {
        account: asset.account,
        value: asset.value,
        date: asset.date,
        category: asset.category,
        isLiquid: asset.isLiquid || false,
        interestRate: asset.interestRate || 0,
        notes: asset.notes || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving asset:', error);
    throw error;
  }
};

/**
 * 負債データを追加または更新
 */
export const saveDebt = async (debt: DebtEntry): Promise<string> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('認証が必要です');
  }

  try {
    const debtsRef = collection(db, 'users', user.uid, 'debts');

    // 既存のdebtを更新するか、新規作成するか
    if (debt.id) {
      const debtRef = doc(db, 'users', user.uid, 'debts', debt.id);
      await updateDoc(debtRef, {
        account: debt.account,
        value: debt.value,
        date: debt.date,
        interestRate: debt.interestRate || 0,
        minimumPayment: debt.minimumPayment || 0,
        dueDate: debt.dueDate || '',
        notes: debt.notes || '',
        updatedAt: Timestamp.now(),
      });
      return debt.id;
    } else {
      const docRef = await addDoc(debtsRef, {
        account: debt.account,
        value: debt.value,
        date: debt.date,
        interestRate: debt.interestRate || 0,
        minimumPayment: debt.minimumPayment || 0,
        dueDate: debt.dueDate || '',
        notes: debt.notes || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving debt:', error);
    throw error;
  }
};

/**
 * 資産データを削除
 */
export const deleteAsset = async (assetId: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('認証が必要です');
  }

  try {
    const assetRef = doc(db, 'users', user.uid, 'assets', assetId);
    await deleteDoc(assetRef);
  } catch (error) {
    console.error('Error deleting asset:', error);
    throw error;
  }
};

/**
 * 負債データを削除
 */
export const deleteDebt = async (debtId: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('認証が必要です');
  }

  try {
    const debtRef = doc(db, 'users', user.uid, 'debts', debtId);
    await deleteDoc(debtRef);
  } catch (error) {
    console.error('Error deleting debt:', error);
    throw error;
  }
};

/**
 * ユーザーの目標データを取得
 */
export const fetchGoals = async (): Promise<FinancialGoal[]> => {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  try {
    const goalsRef = collection(db, 'users', user.uid, 'goals');
    const querySnapshot = await getDocs(goalsRef);

    const goals: FinancialGoal[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      goals.push({
        id: doc.id,
        title: data.title,
        type: data.type,
        startValue: data.startValue,
        currentValue: data.currentValue,
        targetValue: data.targetValue,
        startDate: data.startDate,
        targetDate: data.targetDate,
        period: data.period,
        autoUpdate: data.autoUpdate,
        history: data.history || [],
      });
    });

    return goals;
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
};

/**
 * 目標データを保存
 */
export const saveGoal = async (goal: FinancialGoal): Promise<string> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('認証が必要です');
  }

  try {
    const goalsRef = collection(db, 'users', user.uid, 'goals');

    if (goal.id) {
      const goalRef = doc(db, 'users', user.uid, 'goals', goal.id);
      await updateDoc(goalRef, {
        title: goal.title,
        type: goal.type,
        startValue: goal.startValue,
        currentValue: goal.currentValue,
        targetValue: goal.targetValue,
        startDate: goal.startDate,
        targetDate: goal.targetDate,
        period: goal.period,
        autoUpdate: goal.autoUpdate,
        history: goal.history || [],
        updatedAt: Timestamp.now(),
      });
      return goal.id;
    } else {
      const docRef = await addDoc(goalsRef, {
        title: goal.title,
        type: goal.type,
        startValue: goal.startValue,
        currentValue: goal.currentValue,
        targetValue: goal.targetValue,
        startDate: goal.startDate,
        targetDate: goal.targetDate,
        period: goal.period,
        autoUpdate: goal.autoUpdate,
        history: goal.history || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving goal:', error);
    throw error;
  }
};

/**
 * 最終更新日を保存
 */
export const saveLastBalanceUpdateDate = async (date: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) {
    // 非ログイン時はローカルストレージに保存
    localStorage.setItem('lastBalanceUpdateDate', date);
    return;
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      lastBalanceUpdateDate: date,
      updatedAt: Timestamp.now(),
    });

    // ローカルストレージにも保存（オフライン対応）
    localStorage.setItem('lastBalanceUpdateDate', date);
  } catch (error) {
    console.error('Error saving update date:', error);
    // エラー時もローカルに保存
    localStorage.setItem('lastBalanceUpdateDate', date);
  }
};

/**
 * 最終更新日を取得
 */
export const getLastBalanceUpdateDate = async (): Promise<string | null> => {
  const user = await getCurrentUser();
  if (!user) {
    return localStorage.getItem('lastBalanceUpdateDate');
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists() && docSnap.data().lastBalanceUpdateDate) {
      return docSnap.data().lastBalanceUpdateDate;
    } else {
      // Firestoreにデータがない場合はローカルストレージから取得
      return localStorage.getItem('lastBalanceUpdateDate');
    }
  } catch (error) {
    console.error('Error getting update date:', error);
    return localStorage.getItem('lastBalanceUpdateDate');
  }
};

/**
 * ユーザー設定を取得
 */
export const getUserSettings = async (): Promise<{
  isPremium: boolean;
  premiumExpiresAt: Date | null;
  currency: string;
  language: string;
  notificationsEnabled: boolean;
}> => {
  const user = await getCurrentUser();
  if (!user) {
    return {
      isPremium: false,
      premiumExpiresAt: null,
      currency: 'JPY',
      language: 'ja',
      notificationsEnabled: true,
    };
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        isPremium: data.isPremium || false,
        premiumExpiresAt: data.premiumExpiresAt ? data.premiumExpiresAt.toDate() : null,
        currency: data.currency || 'JPY',
        language: data.language || 'ja',
        notificationsEnabled: data.notificationsEnabled !== false,
      };
    } else {
      // デフォルト設定
      return {
        isPremium: false,
        premiumExpiresAt: null,
        currency: 'JPY',
        language: 'ja',
        notificationsEnabled: true,
      };
    }
  } catch (error) {
    console.error('Error getting user settings:', error);
    return {
      isPremium: false,
      premiumExpiresAt: null,
      currency: 'JPY',
      language: 'ja',
      notificationsEnabled: true,
    };
  }
};

/**
 * リアルタイムでデータ変更を監視（資産）
 */
export const subscribeToAssets = (callback: (assets: AssetEntry[]) => void): (() => void) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      callback([]);
      return;
    }

    const assetsRef = collection(db, 'users', user.uid, 'assets');
    const q = query(assetsRef, orderBy('date', 'desc'));

    const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
      const assets: AssetEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        assets.push({
          id: doc.id,
          account: data.account,
          value: data.value,
          date: data.date,
          category: data.category,
          isLiquid: data.isLiquid || false,
          interestRate: data.interestRate || 0,
          notes: data.notes || '',
        });
      });
      callback(assets);
    });

    return unsubscribeSnapshot;
  });

  return unsubscribe;
};

/**
 * リアルタイムでデータ変更を監視（負債）
 */
export const subscribeToDebts = (callback: (debts: DebtEntry[]) => void): (() => void) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      callback([]);
      return;
    }

    const debtsRef = collection(db, 'users', user.uid, 'debts');
    const q = query(debtsRef, orderBy('date', 'desc'));

    const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
      const debts: DebtEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        debts.push({
          id: doc.id,
          account: data.account,
          value: data.value,
          date: data.date,
          interestRate: data.interestRate || 0,
          minimumPayment: data.minimumPayment || 0,
          dueDate: data.dueDate || '',
          notes: data.notes || '',
          description: '',
        });
      });
      callback(debts);
    });

    return unsubscribeSnapshot;
  });

  return unsubscribe;
};

/**
 * 長期トレンドデータを取得
 */
export const fetchLongTermData = async (): Promise<LongTermDataPoint[]> => {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  try {
    const dataRef = collection(db, 'users', user.uid, 'longTermData');
    const q = query(dataRef, orderBy('date', 'asc'));
    const querySnapshot = await getDocs(q);

    const longTermData: LongTermDataPoint[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      longTermData.push({
        date: data.date,
        assets: data.assets,
        debts: data.debts,
        netWorth: data.netWorth,
        savingsRate: data.savingsRate,
        categories: data.categories,
      });
    });

    return longTermData;
  } catch (error) {
    console.error('Error fetching long term data:', error);
    return [];
  }
};

/**
 * 長期トレンドデータを保存
 */
export const saveLongTermDataPoint = async (dataPoint: LongTermDataPoint): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('認証が必要です');
  }

  try {
    const dataRef = collection(db, 'users', user.uid, 'longTermData');
    // 同じ日付のデータが存在するか確認
    const q = query(dataRef, where('date', '==', dataPoint.date));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // 既存データを更新
      const docId = querySnapshot.docs[0].id;
      const docRef = doc(db, 'users', user.uid, 'longTermData', docId);
      await updateDoc(docRef, {
        assets: dataPoint.assets,
        debts: dataPoint.debts,
        netWorth: dataPoint.netWorth,
        savingsRate: dataPoint.savingsRate,
        categories: dataPoint.categories,
        updatedAt: Timestamp.now(),
      });
    } else {
      // 新規データを追加
      await addDoc(dataRef, {
        date: dataPoint.date,
        assets: dataPoint.assets,
        debts: dataPoint.debts,
        netWorth: dataPoint.netWorth,
        savingsRate: dataPoint.savingsRate,
        categories: dataPoint.categories,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error saving long term data point:', error);
    throw error;
  }
};
