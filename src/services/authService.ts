/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { API_ENDPOINTS } from '../constants';
import type { LoginCredentials, LoginResponse } from '../types';
import { axiosInstance } from '../api/axiosInstance';

/**
 * Login user with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
    );
    return response.data;
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (token: string): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
        API_ENDPOINTS.AUTH.REFRESH,
        { token }
    );
    return response.data;
};

/**
 * Logout user (optional backend call)
 */
export const logout = async (): Promise<void> => {
    try {
        await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
        // Logout should succeed even if backend call fails
        console.error('Logout API call failed:', error);
    }
};
