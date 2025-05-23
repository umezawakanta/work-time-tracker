// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import AuthService from '@/services/auth/AuthService';
import { AuthUser, AuthError, AuthResponse } from '@/types/auth';

interface UseAuthReturn {
    user: AuthUser | null;
    loading: boolean;
    error: AuthError | null;
    signUp: (email: string, password: string, displayName: string) => Promise<AuthResponse>;
    signIn: (email: string, password: string) => Promise<AuthResponse>;
    signInWithGoogle: () => Promise<AuthResponse>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<AuthError | null>;
    clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AuthError | null>(null);

    useEffect(() => {
        const unsubscribe = AuthService.subscribeToAuthState((authUser) => {
            setUser(authUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signUp = useCallback(async (
        email: string,
        password: string,
        displayName: string
    ): Promise<AuthResponse> => {
        setError(null);
        const response = await AuthService.signUp(email, password, displayName);
        if (response.error) {
            setError(response.error);
        }
        return response;
    }, []);

    const signIn = useCallback(async (
        email: string,
        password: string
    ): Promise<AuthResponse> => {
        setError(null);
        const response = await AuthService.signIn(email, password);
        if (response.error) {
            setError(response.error);
        }
        return response;
    }, []);

    const signInWithGoogle = useCallback(async (): Promise<AuthResponse> => {
        setError(null);
        const response = await AuthService.signInWithGoogle();
        if (response.error) {
            setError(response.error);
        }
        return response;
    }, []);

    const signOut = useCallback(async (): Promise<void> => {
        setError(null);
        await AuthService.signOut();
    }, []);

    const resetPassword = useCallback(async (email: string): Promise<AuthError | null> => {
        setError(null);
        const resetError = await AuthService.resetPassword(email);
        if (resetError) {
            setError(resetError);
        }
        return resetError;
    }, []);

    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    return {
        user,
        loading,
        error,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        clearError,
    };
};