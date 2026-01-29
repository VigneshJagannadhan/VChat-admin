/**
 * Centralized environment configuration
 * Validates and provides type-safe access to environment variables
 */

const getEnvVariable = (key: keyof ImportMetaEnv, defaultValue?: string): string => {
    const value = import.meta.env[key];

    if (!value && !defaultValue) {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    return value || defaultValue || '';
};

export const env = {
    apiBaseUrl: getEnvVariable('VITE_API_BASE_URL'),
    tokenRefreshThreshold: parseInt(getEnvVariable('VITE_TOKEN_REFRESH_THRESHOLD', '300'), 10),
} as const;

// Validate configuration on load
if (!env.apiBaseUrl) {
    console.error('VITE_API_BASE_URL is not configured. Please check your .env file.');
}

export default env;
