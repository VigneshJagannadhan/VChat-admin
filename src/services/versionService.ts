/**
 * Version Management Service
 * Handles all app version-related API calls
 */

import { API_ENDPOINTS } from '../constants';
import type { AppVersion, UpdateVersionPayload } from '../types';
import { axiosInstance } from '../api/axiosInstance';

/**
 * Fetch current app version configuration
 */
export const getAppVersion = async (): Promise<AppVersion> => {
    const response = await axiosInstance.get<AppVersion>(API_ENDPOINTS.APP.VERSION);
    return response.data;
};

/**
 * Update app version configuration
 */
export const updateAppVersion = async (version: UpdateVersionPayload): Promise<AppVersion> => {
    const response = await axiosInstance.post<AppVersion>(
        API_ENDPOINTS.APP.VERSION,
        version
    );
    return response.data;
};
