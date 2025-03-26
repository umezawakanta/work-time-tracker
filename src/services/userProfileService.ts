// src/services/userProfileService.ts
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    DocumentData,
    serverTimestamp,
  } from 'firebase/firestore';
  import { updateProfile, User } from 'firebase/auth';
  import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
  import { getCurrentUser } from './firebaseService';
  
  // ユーザープロファイル情報の型定義
  export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    createdAt: Date;
    lastLoginAt: Date;
    isPremium: boolean;
    premiumExpiresAt?: Date;
    currency: string;
    language: string;
    notificationsEnabled: boolean;
    theme: 'light' | 'dark' | 'system';
    financialGoals: {
      // 財務目標の設定
      savingsTarget?: number;
      investmentTarget?: number;
      retirementTarget?: number;
      debtReductionTarget?: number;
    };
    preferences: {
      // ユーザー設定
      defaultView: string;
      defaultTimeRange: string;
      showTips: boolean;
      emailNotifications: boolean;
      updateFrequency: 'daily' | 'weekly' | 'monthly';
    };
  }
  
  /**
   * 新規ユーザープロファイルを作成
   * @param user Firebase認証ユーザー
   */
  export const createUserProfile = async (user: User): Promise<void> => {
    if (!user.uid) return;
  
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    
    // ユーザードキュメントが存在するか確認
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      // 新規ユーザーの初期プロファイル
      const newUserData = {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        isPremium: false,
        currency: 'JPY',
        language: 'ja',
        notificationsEnabled: true,
        theme: 'system',
        financialGoals: {
          savingsTarget: 1000000,
          investmentTarget: 5000000,
          retirementTarget: 30000000,
          debtReductionTarget: 0,
        },
        preferences: {
          defaultView: 'overview',
          defaultTimeRange: 'year',
          showTips: true,
          emailNotifications: true,
          updateFrequency: 'weekly',
        },
      };
      
      // DocumentData 型を使用してデータを設定
      const profileData: DocumentData = newUserData;
      await setDoc(userRef, profileData);
    } else {
      // 既存ユーザーの場合は最終ログイン日時のみ更新
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
      });
    }
  };
  
  /**
   * ユーザープロファイルを取得
   */
  export const getUserProfile = async (): Promise<UserProfile | null> => {
    const user = await getCurrentUser();
    if (!user) return null;
    
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    // DocumentData 型のデータをUserProfile型に変換
    const data: DocumentData = docSnap.data();
    
    return {
      uid: data.uid,
      displayName: data.displayName || '',
      email: data.email || '',
      photoURL: data.photoURL || '',
      createdAt: data.createdAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
      isPremium: data.isPremium || false,
      premiumExpiresAt: data.premiumExpiresAt?.toDate() || undefined,
      currency: data.currency || 'JPY',
      language: data.language || 'ja',
      notificationsEnabled: data.notificationsEnabled !== false,
      theme: data.theme || 'system',
      financialGoals: {
        savingsTarget: data.financialGoals?.savingsTarget || 0,
        investmentTarget: data.financialGoals?.investmentTarget || 0,
        retirementTarget: data.financialGoals?.retirementTarget || 0,
        debtReductionTarget: data.financialGoals?.debtReductionTarget || 0,
      },
      preferences: {
        defaultView: data.preferences?.defaultView || 'overview',
        defaultTimeRange: data.preferences?.defaultTimeRange || 'year',
        showTips: data.preferences?.showTips !== false,
        emailNotifications: data.preferences?.emailNotifications !== false,
        updateFrequency: data.preferences?.updateFrequency || 'weekly',
      },
    };
  };
  
  /**
   * ユーザープロファイルを更新
   * @param profileData 更新するプロファイルデータ
   */
  export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('認証が必要です');
    
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    
    // 更新するフィールドを用意
    const updateData: DocumentData = {
      ...profileData,
      updatedAt: serverTimestamp(),
    };
    
    // プロファイル更新
    await updateDoc(userRef, updateData);
    
    // Firebase Auth のプロファイルも更新
    if (profileData.displayName || profileData.photoURL) {
      await updateProfile(user, {
        displayName: profileData.displayName || user.displayName,
        photoURL: profileData.photoURL || user.photoURL,
      });
    }
  };
  
  /**
   * プロファイル画像をアップロード
   * @param file 画像ファイル
   */
  export const uploadProfileImage = async (file: File): Promise<string> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('認証が必要です');
    
    const storage = getStorage();
    const storageRef = ref(storage, `profileImages/${user.uid}/${Date.now()}-${file.name}`);
    
    // アップロード
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Promise でラップして非同期処理を実装
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // アップロード進捗
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress}%`);
        },
        (error) => {
          // エラー処理
          console.error('Error uploading image:', error);
          reject(error);
        },
        async () => {
          // 完了処理
          try {
            // ダウンロードURLを取得
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // プロフィール画像URLを更新
            await updateUserProfile({ photoURL: downloadURL });
            
            // Auth プロフィールも更新
            await updateProfile(user, { photoURL: downloadURL });
            
            resolve(downloadURL);
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(error);
          }
        }
      );
    });
  };
  
  /**
   * 財務目標を更新
   * @param goals 財務目標設定
   */
  export const updateFinancialGoals = async (goals: Partial<UserProfile['financialGoals']>): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('認証が必要です');
    
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    
    // 現在のプロファイル情報を取得
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      throw new Error('ユーザープロファイルが見つかりません');
    }
    
    const data = docSnap.data();
    const currentGoals = data.financialGoals || {};
    
    // 目標を更新
    await updateDoc(userRef, {
      'financialGoals': {
        ...currentGoals,
        ...goals,
      },
      updatedAt: serverTimestamp(),
    });
  };
  
  /**
   * ユーザー設定を更新
   * @param preferences ユーザー設定
   */
  export const updateUserPreferences = async (preferences: Partial<UserProfile['preferences']>): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('認証が必要です');
    
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    
    // 現在のプロファイル情報を取得
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      throw new Error('ユーザープロファイルが見つかりません');
    }
    
    const data = docSnap.data();
    const currentPreferences = data.preferences || {};
    
    // 設定を更新
    await updateDoc(userRef, {
      'preferences': {
        ...currentPreferences,
        ...preferences,
      },
      updatedAt: serverTimestamp(),
    });
  };
  
  /**
   * ユーザーのフィードバックを保存
   * @param feedback フィードバック内容
   */
  export const saveFeedback = async (feedback: {
    type: 'bug' | 'feature' | 'improvement' | 'other';
    content: string;
    rating?: number;
  }): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('認証が必要です');
    
    const db = getFirestore();
    const feedbackRef = doc(db, 'feedback', `${user.uid}-${Date.now()}`);
    
    // DocumentData 型を使用してフィードバックを保存
    const feedbackData: DocumentData = {
      userId: user.uid,
      userEmail: user.email,
      type: feedback.type,
      content: feedback.content,
      rating: feedback.rating || null,
      createdAt: serverTimestamp(),
      status: 'new',
    };
    
    await setDoc(feedbackRef, feedbackData);
  };
  
  /**
   * メールアドレスを変更した際のプロファイル更新
   * @param newEmail 新しいメールアドレス
   */
  export const updateEmailInProfile = async (newEmail: string): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('認証が必要です');
    
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    
    // プロファイル更新
    await updateDoc(userRef, {
      email: newEmail,
      updatedAt: serverTimestamp(),
    });
  };