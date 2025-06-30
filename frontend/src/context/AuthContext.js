import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
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

    const clearAuth = useCallback(() => {
        console.log('Clearing authentication data...');
        
        // Clear all storage
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
        
        // Reset state
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        
        console.log('Authentication cleared successfully');
        
        // Navigate to home and reload to ensure clean state
        setTimeout(() => {
            window.location.href = '/';
        }, 100);
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            console.log('Fetching user data...');
            const response = await ApiService.auth.getMe();
            
            if (response?.data?.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.data.user));
                console.log('User data fetched successfully:', response.data.user.fullName);
            } else {
                throw new Error('Invalid user data received');
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            clearAuth();
            throw error;
        } finally {
            setLoading(false);
        }
    }, [clearAuth]);

    const initializeAuth = useCallback(async () => {
        console.log('Initializing authentication...');
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
        
        if (token) {
            console.log('Token found, fetching user...');
            try {
                await fetchUser();
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                clearAuth();
            }
        } else {
            console.log('No token found, setting loading to false');
            setLoading(false);
        }
    }, [fetchUser, clearAuth]);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const login = async (credentials) => {
        try {
            console.log('Starting login process...');
            setLoading(true);
            
            const response = await ApiService.auth.login(credentials);
            
            if (!response?.data) {
                throw new Error('Invalid login response');
            }
            
            const { user: userData, token, refreshToken } = response.data;
            
            if (!userData || !token || !refreshToken) {
                throw new Error('Missing required login data');
            }
            
            // Store tokens and user data
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(userData));
            
            setUser(userData);
            setIsAuthenticated(true);
            
            console.log('Login successful for:', userData.fullName);
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
            console.log('Starting signup process...');
            setLoading(true);
            
            const response = await ApiService.auth.signup(userData);
            
            if (!response?.data) {
                throw new Error('Invalid signup response');
            }
            
            const { user: newUser, token, refreshToken } = response.data;
            
            if (!newUser || !token || !refreshToken) {
                throw new Error('Missing required signup data');
            }
            
            // Store tokens and user data
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(newUser));
            
            setUser(newUser);
            setIsAuthenticated(true);
            
            console.log('Signup successful for:', newUser.fullName);
            return response;
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async (providedRefreshToken = null) => {
        try {
            console.log('Starting logout process...');
            setLoading(true);
            
            // Get refresh token from parameter or localStorage
            const refreshToken = providedRefreshToken || localStorage.getItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
            
            if (refreshToken) {
                try {
                    console.log('Calling logout API...');
                    await ApiService.auth.logout(refreshToken);
                    console.log('Logout API call successful');
                } catch (apiError) {
                    console.warn('Logout API call failed, continuing with local logout:', apiError.message);
                    // Continue with local logout even if API fails
                }
            } else {
                console.log('No refresh token found, proceeding with local logout only');
            }
            
        } catch (error) {
            console.error('Logout process error:', error);
            // Continue with local logout even if there are errors
        } finally {
            // Always clear auth state regardless of API call success
            console.log('Completing logout - clearing local state...');
            clearAuth();
        }
    };

    const updateUser = (updatedUser) => {
        console.log('Updating user data...');
        setUser(updatedUser);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    };

    const refreshToken = async () => {
        try {
            console.log('Refreshing token...');
            const currentRefreshToken = localStorage.getItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
            
            if (!currentRefreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await ApiService.auth.refreshToken(currentRefreshToken);
            
            if (!response?.data) {
                throw new Error('Invalid refresh token response');
            }
            
            const { token: newToken, refreshToken: newRefreshToken } = response.data;
            
            if (!newToken || !newRefreshToken) {
                throw new Error('Missing tokens in refresh response');
            }
            
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, newToken);
            localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
            
            console.log('Token refreshed successfully');
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