import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    authenticated: boolean | null;
    loading: boolean;
}

interface AuthContextType {
    authState: AuthState;
    onRegister: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    onLogout: () => Promise<void>;
    refreshAccessToken: () => Promise<boolean>;
}

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
export const API_URL = process.env.API_URL;

const AuthContext = createContext<AuthContextType>({
    authState: { accessToken: null, refreshToken: null, authenticated: null, loading: true },
    onRegister: () => Promise.resolve({ success: false }),
    onLogin: () => Promise.resolve({ success: false }),
    onLogout: () => Promise.resolve(),
    refreshAccessToken: () => Promise.resolve(false),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [authState, setAuthState] = useState<AuthState>({
        accessToken: null,
        refreshToken: null,
        authenticated: null,
        loading: true,
    });

    // Refresh access token using refresh token
    const refreshAccessToken = useCallback(async (): Promise<boolean> => {
        try {
            const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
            if (!refreshToken) {
                return false;
            }

            const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken: refreshToken
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Store new tokens
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
            // If refresh fails, logout user
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
                    });
                } else {
                    setAuthState({
                        accessToken: null,
                        refreshToken: null,
                        authenticated: false,
                        loading: false,
                    });
                }
            } catch (error) {
                console.error("Error loading tokens:", error);
                setAuthState({
                    accessToken: null,
                    refreshToken: null,
                    authenticated: false,
                    loading: false,
                });
            }
        };
        loadTokens();
    }, []);

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

                    // Try to refresh the token
                    const refreshSuccess = await refreshAccessToken();
                    if (refreshSuccess) {
                        // Retry the original request with new token
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

    const onRegister = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setAuthState(prev => ({ ...prev, loading: true }));
            
            const response = await axios.post(`${API_URL}/auth/register`, { email, password });
            const { accessToken, refreshToken } = response.data;

            // Store tokens
            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

            setAuthState({
                accessToken,
                refreshToken,
                authenticated: true,
                loading: false,
            });

            return { success: true };
        } catch (error: any) {
            setAuthState(prev => ({ ...prev, loading: false }));
            console.error("Error registering:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Registration failed" 
            };
        }
    };

    const onLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setAuthState(prev => ({ ...prev, loading: true }));
            
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { accessToken, refreshToken } = response.data;

            // Store tokens
            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

            setAuthState({
                accessToken,
                refreshToken,
                authenticated: true,
                loading: false,
            });

            return { success: true };
        } catch (error: any) {
            setAuthState(prev => ({ ...prev, loading: false }));
            console.error("Error logging in:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Login failed" 
            };
        }
    };

    const onLogout = async (): Promise<void> => {
        try {
            // Optional: Call logout endpoint to invalidate refresh token on server
            if (authState.refreshToken) {
                await axios.post(`${API_URL}/auth/logout`, {
                    refreshToken: authState.refreshToken
                });
            }
        } catch (error) {
            console.error("Error during logout:", error);
        } finally {
            // Clear tokens regardless of server response
            await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
            await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
            delete axios.defaults.headers.common['Authorization'];
            
            setAuthState({
                accessToken: null,
                refreshToken: null,
                authenticated: false,
                loading: false,
            });
        }
    };

    return (
        <AuthContext.Provider value={{ authState, onRegister, onLogin, onLogout, refreshAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};