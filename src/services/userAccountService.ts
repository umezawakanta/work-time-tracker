import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  DocumentReference,
  DocumentData
} from 'firebase/firestore';

export interface Profile {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export type PremiumPlanType = 'basic' | 'pro' | 'professional' | 'enterprise';
export type PremiumPlanCycle = 'monthly' | 'yearly' | 'annual' | 'lifetime';

export interface UserAccount {
  uid: string;
  email: string;
  profile: Profile;
  subscription?: {
    planType?: PremiumPlanType;
    planCycle?: PremiumPlanCycle;
    expiresAt?: Date;
    isActive?: boolean;
    cancelledAt?: Date;
  };
  settings?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    language?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const getUserAccount = async (uid: string): Promise<UserAccount | null> => {
  try {
    const userRef = doc(db, 'users', uid) as DocumentReference<UserAccount>;
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user account:', error);
    return null;
  }
};

export const createUserAccount = async (uid: string, email: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    const newUser: UserAccount = {
      uid,
      email,
      profile: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(userRef, newUser);
  } catch (error) {
    console.error('Error creating user account:', error);
    throw error;
  }
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<Profile>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      profile: data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const inviteUser = async (email: string, referralCode: string): Promise<void> => {
  // 招待ロジックの実装
  console.log('Inviting user:', email, 'with code:', referralCode);
};