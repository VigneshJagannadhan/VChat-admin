/**
 * Token management utilities
 * Handles secure storage, validation, and expiration checking of JWT tokens
 */

import { jwtDecode } from 'jwt-decode';
import { STORAGE_KEYS } from '../constants';
import type { TokenPayload } from '../types';

/**
 * Store authentication token in localStorage
 */
export const setToken = (token: string): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } catch (error) {
        console.error('Failed to store token:', error);
    }
};

/**
 * Retrieve authentication token from localStorage
 */
export const getToken = (): string | null => {
    try {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
        console.error('Failed to retrieve token:', error);
        return null;
    }
};

/**
 * Remove authentication token from localStorage
 */
export const removeToken = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
        console.error('Failed to remove token:', error);
    }
};

/**
 * Decode JWT token and extract payload
 */
export const decodeToken = (token: string): TokenPayload | null => {
    try {
        return jwtDecode<TokenPayload>(token);
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
        return true;
    }

    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
};

/**
 * Check if token is valid (exists and not expired)
 */
export const isTokenValid = (): boolean => {
    const token = getToken();
    if (!token) {
        return false;
    }

    return !isTokenExpired(token);
};

/**
 * Get time until token expiration in seconds
 * Returns 0 if token is expired or invalid
 */
export const getTokenExpirationTime = (token: string): number => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
        return 0;
    }

    const currentTime = Date.now() / 1000;
    const timeUntilExpiration = decoded.exp - currentTime;

    return Math.max(0, timeUntilExpiration);
};

/**
 * Check if token needs refresh based on threshold
 * @param threshold - Time in seconds before expiration to trigger refresh
 */
export const shouldRefreshToken = (token: string, threshold: number = 300): boolean => {
    const timeUntilExpiration = getTokenExpirationTime(token);
    return timeUntilExpiration > 0 && timeUntilExpiration < threshold;
};
