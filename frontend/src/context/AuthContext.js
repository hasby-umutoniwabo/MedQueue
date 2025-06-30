import React, { useState, useEffect, createContext, useContext } from 'react';
import { ApiService } from '../services/api';
import { CONFIG } from '../config/config';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
        
        if (token) {
            try {
                await fetchUser();
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                clearAuth();
            }
        } else {
            setLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            const response = await ApiService.auth.getMe();
            setUser(response.data.user);
            setIsAuthenticated(true);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.data.user));
        } catch (error) {
            console.error('Failed to fetch user:', error);
            clearAuth();
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            setLoading(true);
            const response = await ApiService.auth.login(credentials);
            const { user: userData, token, refreshToken } = response.data;
            
            // Store tokens and user data
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(userData));
            
            setUser(userData);
            setIsAuthenticated(true);
            
            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (userData) => {
        try {
            setLoading(true);
            const response = await ApiService.auth.signup(userData);
            const { user: newUser, token, refreshToken } = response.data;
            
            // Store tokens and user data
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(newUser));
            
            setUser(newUser);
            setIsAuthenticated(true);
            
            return response;
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
            if (refreshToken) {
                await ApiService.auth.logout(refreshToken);
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            clearAuth();
        }
    };

    const clearAuth = () => {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    };

    const refreshToken = async () => {
        try {
            const refreshToken = localStorage.getItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await ApiService.auth.refreshToken(refreshToken);
            const { token: newToken, refreshToken: newRefreshToken } = response.data;
            
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, newToken);
            localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
            
            return response;
        } catch (error) {
            console.error('Token refresh failed:', error);
            clearAuth();
            throw error;
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        signup,
        logout,
        fetchUser,
        updateUser,
        refreshToken,
        clearAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};