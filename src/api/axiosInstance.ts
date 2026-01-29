/**
 * Configured Axios instance with interceptors
 */

import axios from 'axios';
import { env } from '../config/env';
import {
    requestInterceptor,
    requestErrorInterceptor,
    responseInterceptor,
    responseErrorInterceptor,
} from './interceptors';

// Create axios instance with base configuration
export const axiosInstance = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptors
axiosInstance.interceptors.request.use(
    requestInterceptor,
    requestErrorInterceptor
);

// Add response interceptors
axiosInstance.interceptors.response.use(
    responseInterceptor,
    responseErrorInterceptor
);

export default axiosInstance;
