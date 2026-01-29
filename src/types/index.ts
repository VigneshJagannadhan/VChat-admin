/**
 * TypeScript type definitions for the application
 */

// ============================================================================
// Authentication Types
// ============================================================================

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    refreshToken?: string;
    user?: User;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    token: string | null;
}

export interface TokenPayload {
    exp: number;
    iat: number;
    userId: string;
    email: string;
}

// ============================================================================
// App Version Types
// ============================================================================

export interface AppVersion {
    latestVersion: string;
    minSupportedVersion: string;
    forceUpdate: boolean;
    updateMessage: string;
}

export interface UpdateVersionPayload {
    latestVersion: string;
    minSupportedVersion: string;
    forceUpdate: boolean;
    updateMessage: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiError {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

// ============================================================================
// Form Types
// ============================================================================

export interface FormFieldError {
    field: string;
    message: string;
}

export interface FormState<T> {
    values: T;
    errors: Record<keyof T, string>;
    isSubmitting: boolean;
    isValid: boolean;
}
