// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { firebaseConfig } from './index';

// Validate Firebase configuration
const validateFirebaseConfig = (): void => {
    const requiredFields = [
        'apiKey',
        'authDomain',
        'projectId',
        'storageBucket',
        'messagingSenderId',
        'appId'
    ];

    requiredFields.forEach(field => {
        if (!firebaseConfig[field as keyof typeof firebaseConfig]) {
            console.error(`Missing required Firebase config: ${field}`);
        }
    });
};

validateFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics conditionally (not supported in all environments)
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export default app;