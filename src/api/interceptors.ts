/**
 * Axios interceptors for request and response handling
 */

import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getToken, isTokenValid, removeToken } from '../utils/tokenManager';
import { ERROR_MESSAGES } from '../constants';

/**
 * Request interceptor to add authentication token to headers
 */
export const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getToken();

    if (token && isTokenValid()) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
};

/**
 * Request error interceptor
 */
export const requestErrorInterceptor = (error: AxiosError): Promise<AxiosError> => {
    console.error('Request error:', error);
    return Promise.reject(error);
};

/**
 * Response success interceptor
 */
export const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
    return response;
};

/**
 * Response error interceptor for global error handling
 */
export const responseErrorInterceptor = (error: AxiosError): Promise<AxiosError> => {
    if (!error.response) {
        // Network error
        console.error('Network error:', error);
        return Promise.reject({
            ...error,
            message: ERROR_MESSAGES.NETWORK_ERROR,
        });
    }

    const { status } = error.response;

    switch (status) {
        case 401:
            // Unauthorized - token expired or invalid
            console.error('Unauthorized access - clearing token');
            removeToken();

            // Redirect to login if not already there
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }

            return Promise.reject({
                ...error,
                message: ERROR_MESSAGES.UNAUTHORIZED,
            });

        case 403:
            // Forbidden
            console.error('Forbidden access');
            return Promise.reject({
                ...error,
                message: ERROR_MESSAGES.FORBIDDEN,
            });

        case 500:
        case 502:
        case 503:
        case 504:
            // Server errors
            console.error('Server error:', status);
            return Promise.reject({
                ...error,
                message: ERROR_MESSAGES.SERVER_ERROR,
            });

        default:
            // Other errors
            return Promise.reject(error);
    }
};
