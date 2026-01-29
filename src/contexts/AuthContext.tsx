/**
 * Authentication Context
 * Provides centralized authentication state management
 */

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { AuthState, LoginCredentials, User } from '../types';
import * as authService from '../services/authService';
import {
    setToken as saveToken,
    getToken,
    removeToken,
    isTokenValid,
    decodeToken,
    shouldRefreshToken,
} from '../utils/tokenManager';
import { env } from '../config/env';
import { ERROR_MESSAGES } from '../constants';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshAuthToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        token: null,
    });

    /**
     * Initialize auth state from stored token
     */
    useEffect(() => {
        const initializeAuth = () => {
            const token = getToken();

            if (token && isTokenValid()) {
                const decoded = decodeToken(token);
                const user: User | null = decoded
                    ? {
                        id: decoded.userId,
                        email: decoded.email,
                    }
                    : null;

                setAuthState({
                    isAuthenticated: true,
                    isLoading: false,
                    user,
                    token,
                });

                // Check if token needs refresh
                if (shouldRefreshToken(token, env.tokenRefreshThreshold)) {
                    refreshAuthToken();
                }
            } else {
                // Token is invalid or expired
                removeToken();
                setAuthState({
                    isAuthenticated: false,
                    isLoading: false,
                    user: null,
                    token: null,
                });
            }
        };

        initializeAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Login user
     */
    const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
        try {
            setAuthState((prev) => ({ ...prev, isLoading: true }));

            const response = await authService.login(credentials);

            // Save token
            saveToken(response.token);

            // Decode token to get user info
            const decoded = decodeToken(response.token);
            const user: User | null = decoded
                ? {
                    id: decoded.userId,
                    email: decoded.email,
                }
                : response.user || null;

            setAuthState({
                isAuthenticated: true,
                isLoading: false,
                user,
                token: response.token,
            });
        } catch (error) {
            setAuthState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                token: null,
            });

            // Re-throw error for component to handle
            throw new Error(
                (error as Error).message || ERROR_MESSAGES.LOGIN_FAILED
            );
        }
    }, []);

    /**
     * Logout user
     */
    const logout = useCallback(async (): Promise<void> => {
        try {
            // Call backend logout (optional)
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local state
            removeToken();
            setAuthState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                token: null,
            });
        }
    }, []);

    /**
     * Refresh authentication token
     */
    const refreshAuthToken = useCallback(async (): Promise<void> => {
        try {
            const currentToken = getToken();
            if (!currentToken) {
                throw new Error('No token to refresh');
            }

            const response = await authService.refreshToken(currentToken);

            // Save new token
            saveToken(response.token);

            // Update state
            setAuthState((prev) => ({
                ...prev,
                token: response.token,
            }));
        } catch (error) {
            console.error('Token refresh failed:', error);
            // If refresh fails, logout user
            await logout();
        }
    }, [logout]);

    /**
     * Set up automatic token refresh
     */
    useEffect(() => {
        if (!authState.isAuthenticated || !authState.token) {
            return;
        }

        // Check token every minute
        const interval = setInterval(() => {
            const token = getToken();
            if (token && shouldRefreshToken(token, env.tokenRefreshThreshold)) {
                refreshAuthToken();
            }
        }, 60000); // Check every 60 seconds

        return () => clearInterval(interval);
    }, [authState.isAuthenticated, authState.token, refreshAuthToken]);

    const contextValue = useMemo(
        () => ({
            ...authState,
            login,
            logout,
            refreshAuthToken,
        }),
        [authState, login, logout, refreshAuthToken]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
