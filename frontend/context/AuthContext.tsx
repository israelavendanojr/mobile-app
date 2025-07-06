import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    authenticated: boolean | null;
    loading: boolean;
    user: any | null;
}

interface AuthResponse {
    success: boolean;
    error?: string;
    errors?: {[key: string]: string};
}

interface AuthContextType {
    authState: AuthState;
    onRegister: (email: string, password: string, username?: string) => Promise<AuthResponse>;
    onLogin: (loginInput: string, password: string) => Promise<AuthResponse>;
    onLogout: () => Promise<void>;
    refreshAccessToken: () => Promise<boolean>;
    updateProfile: (data: any) => Promise<AuthResponse>;
    deleteAccount: () => Promise<AuthResponse>;
    fetchProfile: () => Promise<void>;
}

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Load API URL from environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export { API_URL };

const AuthContext = createContext<AuthContextType>({
    authState: { accessToken: null, refreshToken: null, authenticated: null, loading: true, user: null },
    onRegister: () => Promise.resolve({ success: false }),
    onLogin: () => Promise.resolve({ success: false }),
    onLogout: () => Promise.resolve(),
    refreshAccessToken: () => Promise.resolve(false),
    updateProfile: () => Promise.resolve({ success: false }),
    deleteAccount: () => Promise.resolve({ success: false }),
    fetchProfile: () => Promise.resolve(),
});

export const useAuth = () => useContext(AuthContext);

// Helper function to extract meaningful error messages
const extractErrorMessage = (error: any): { error?: string; errors?: {[key: string]: string} } => {
    if (error.response?.data) {
        const data = error.response.data;
        
        // If there are field-specific errors
        if (data.errors) {
            return { errors: data.errors };
        }
        
        // If there's a general error message
        if (data.error) {
            return { error: data.error };
        }
        
        // If there's a message field
        if (data.message) {
            return { error: data.message };
        }
        
        // If there are validation errors in a different format
        if (data.detail) {
            return { error: data.detail };
        }
        
        // Handle Django REST framework validation errors
        if (typeof data === 'object' && !Array.isArray(data)) {
            const fieldErrors: {[key: string]: string} = {};
            let hasFieldErrors = false;
            
            for (const [field, messages] of Object.entries(data)) {
                if (Array.isArray(messages)) {
                    fieldErrors[field] = messages[0];
                    hasFieldErrors = true;
                } else if (typeof messages === 'string') {
                    fieldErrors[field] = messages;
                    hasFieldErrors = true;
                }
            }
            
            if (hasFieldErrors) {
                return { errors: fieldErrors };
            }
        }
    }
    
    // Default error message based on status code
    if (error.response?.status === 400) {
        return { error: "Invalid request. Please check your input." };
    } else if (error.response?.status === 401) {
        return { error: "Invalid credentials. Please check your email/username and password." };
    } else if (error.response?.status === 403) {
        return { error: "You don't have permission to perform this action." };
    } else if (error.response?.status === 404) {
        return { error: "The requested resource was not found." };
    } else if (error.response?.status === 500) {
        return { error: "Server error. Please try again later." };
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        return { error: "Network error. Please check your internet connection." };
    }
    
    return { error: error.message || "An unexpected error occurred" };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [authState, setAuthState] = useState<AuthState>({
        accessToken: null,
        refreshToken: null,
        authenticated: null,
        loading: true,
        user: null,
    });

    // Fetch user profile
    const fetchProfile = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/profile/`);
            setAuthState(prev => ({
                ...prev,
                user: response.data,
            }));
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    }, []);

    // Refresh access token using refresh token
    const refreshAccessToken = useCallback(async (): Promise<boolean> => {
        try {
            const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
            if (!refreshToken) {
                return false;
            }

            const response = await axios.post(`${API_URL}/auth/refresh/`, {
                refresh: refreshToken
            });

            const { access: accessToken, refresh: newRefreshToken } = response.data;

            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
            if (newRefreshToken) {
                await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
            }

            setAuthState(prev => ({
                ...prev,
                accessToken,
                refreshToken: newRefreshToken || prev.refreshToken,
                authenticated: true,
            }));

            return true;
        } catch (error) {
            console.error("Error refreshing token:", error);
            await onLogout();
            return false;
        }
    }, []);

    // Load tokens on app start
    useEffect(() => {
        const loadTokens = async () => {
            try {
                const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
                const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

                if (accessToken && refreshToken) {
                    setAuthState({
                        accessToken,
                        refreshToken,
                        authenticated: true,
                        loading: false,
                        user: null,
                    });
                    // Fetch user profile after setting tokens
                    setTimeout(fetchProfile, 100);
                } else {
                    setAuthState({
                        accessToken: null,
                        refreshToken: null,
                        authenticated: false,
                        loading: false,
                        user: null,
                    });
                }
            } catch (error) {
                console.error("Error loading tokens:", error);
                setAuthState({
                    accessToken: null,
                    refreshToken: null,
                    authenticated: false,
                    loading: false,
                    user: null,
                });
            }
        };
        loadTokens();
    }, [fetchProfile]);

    // Set up axios interceptors
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                if (authState.accessToken) {
                    config.headers.Authorization = `Bearer ${authState.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    const refreshSuccess = await refreshAccessToken();
                    if (refreshSuccess) {
                        originalRequest.headers.Authorization = `Bearer ${authState.accessToken}`;
                        return axios(originalRequest);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [authState.accessToken, refreshAccessToken]);

    const onRegister = async (email: string, password: string, username?: string): Promise<AuthResponse> => {
        try {
            setAuthState(prev => ({ ...prev, loading: true }));
            
            const registerData: any = { 
                email, 
                password,
                password_confirm: password
            };

            if (username) {
                registerData.username = username;
            }
            
            const response = await axios.post(`${API_URL}/auth/register/`, registerData);
            
            const { access: accessToken, refresh: refreshToken, user } = response.data;

            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

            setAuthState({
                accessToken,
                refreshToken,
                authenticated: true,
                loading: false,
                user,
            });

            return { success: true };
        } catch (error: any) {
            setAuthState(prev => ({ ...prev, loading: false }));
            console.error("Error registering:", error);
            const errorResult = extractErrorMessage(error);
            return { 
                success: false, 
                ...errorResult
            };
        }
    };

    const onLogin = async (loginInput: string, password: string): Promise<AuthResponse> => {
        try {
            setAuthState(prev => ({ ...prev, loading: true }));
            
            const response = await axios.post(`${API_URL}/auth/login/`, { 
                login: loginInput, // This supports both email and username
                password 
            });
            
            const { access: accessToken, refresh: refreshToken, user } = response.data;

            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

            setAuthState({
                accessToken,
                refreshToken,
                authenticated: true,
                loading: false,
                user,
            });

            return { success: true };
        } catch (error: any) {
            setAuthState(prev => ({ ...prev, loading: false }));
            console.error("Error logging in:", error);
            const errorResult = extractErrorMessage(error);
            return { 
                success: false, 
                ...errorResult
            };
        }
    };

    const updateProfile = async (data: any): Promise<AuthResponse> => {
        try {
            const response = await axios.put(`${API_URL}/auth/update/`, data);
            setAuthState(prev => ({
                ...prev,
                user: response.data,
            }));
            return { success: true };
        } catch (error: any) {
            console.error("Error updating profile:", error);
            const errorResult = extractErrorMessage(error);
            return { 
                success: false, 
                ...errorResult
            };
        }
    };

    const deleteAccount = async (): Promise<AuthResponse> => {
        try {
            await axios.delete(`${API_URL}/auth/delete/`);
            await onLogout();
            return { success: true };
        } catch (error: any) {
            console.error("Error deleting account:", error);
            const errorResult = extractErrorMessage(error);
            return { 
                success: false, 
                ...errorResult
            };
        }
    };

    const onLogout = async (): Promise<void> => {
        try {
            if (authState.refreshToken) {
                await axios.post(`${API_URL}/auth/logout/`, {
                    refresh: authState.refreshToken
                });
            }
        } catch (error) {
            console.error("Error during logout:", error);
        } finally {
            await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
            await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
            delete axios.defaults.headers.common['Authorization'];
            
            setAuthState({
                accessToken: null,
                refreshToken: null,
                authenticated: false,
                loading: false,
                user: null,
            });
        }
    };

    return (
        <AuthContext.Provider value={{ 
            authState, 
            onRegister, 
            onLogin, 
            onLogout, 
            refreshAccessToken,
            updateProfile,
            deleteAccount,
            fetchProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};