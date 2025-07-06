import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

interface AuthContextType {
    authState?: { token: string | null; authenticated: boolean | null };
    onRegister: (email: string, password: string) => Promise<any>;
    onLogin: (email: string, password: string) => Promise<any>;
    onLogout: () => Promise<any>;
}

const TOKEN_KEY = "token";
export const API_URL = process.env.API_URL;
const AuthContext = createContext<AuthContextType>({
    authState: { token: null, authenticated: null },
    onRegister: () => Promise.resolve(),
    onLogin: () => Promise.resolve(),
    onLogout: () => Promise.resolve(),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [authState, setAuthState] = useState<{ token: string | null; authenticated: boolean | null } | undefined>();
    
    // Load token on app start
    useEffect(() => {
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token) {
                setAuthState({ token, authenticated: true });
            } else {
                setAuthState({ token: null, authenticated: false });
            }
        };
        loadToken();
    }, []);

    // Set up axios interceptors when authState changes
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                if (authState?.token) {
                    config.headers.Authorization = `Bearer ${authState.token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Handle token expiration
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Token expired, logout user
                    onLogout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [authState?.token]); // Remove onLogout from dependency array

    const onRegister = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, { email, password });
            const { token } = response.data;
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            setAuthState({ token, authenticated: true });
        } catch (error) {
            console.error("Error registering:", error);
        }
    };

    const onLogin = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { token } = response.data;
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            setAuthState({ token, authenticated: true });
        } catch (error) {
            console.error("Error logging in:", error);
        }
    };

    const onLogout = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        delete axios.defaults.headers.common['Authorization']; // Clean up header
        setAuthState({ token: null, authenticated: false });
    };

    return (
        <AuthContext.Provider value={{ authState, onRegister, onLogin, onLogout }}>
            {children}
        </AuthContext.Provider>
    );
};