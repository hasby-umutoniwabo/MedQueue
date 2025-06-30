import { CONFIG } from '../config/config';

// API Service for handling all backend communications
export const ApiService = {
    // Base request method
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 401) {
                    // Token expired or invalid - clear storage and redirect to login
                    localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
                    localStorage.removeItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
                    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
                    window.location.reload();
                }
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    },

    // Authentication endpoints
    auth: {
        signup: (userData) => ApiService.request(CONFIG.ENDPOINTS.AUTH.SIGNUP, {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

        login: (credentials) => ApiService.request(CONFIG.ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),

        logout: (refreshToken) => ApiService.request(CONFIG.ENDPOINTS.AUTH.LOGOUT, {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        }),

        getMe: () => ApiService.request(CONFIG.ENDPOINTS.AUTH.ME),

        refreshToken: (refreshToken) => ApiService.request(CONFIG.ENDPOINTS.AUTH.REFRESH, {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        }),

        forgotPassword: (email) => ApiService.request(CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),

        resetPassword: (token, password) => ApiService.request(`${CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`, {
            method: 'PATCH',
            body: JSON.stringify({ password }),
        }),

        updateProfile: (data) => ApiService.request(CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

        updatePassword: (data) => ApiService.request(CONFIG.ENDPOINTS.AUTH.UPDATE_PASSWORD, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

        deleteAccount: () => ApiService.request(CONFIG.ENDPOINTS.AUTH.DELETE_ACCOUNT, {
            method: 'DELETE',
        }),

        getAllUsers: (params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            return ApiService.request(`${CONFIG.ENDPOINTS.AUTH.USERS}?${queryString}`);
        },

        getUserById: (id) => ApiService.request(`${CONFIG.ENDPOINTS.AUTH.USER_BY_ID}/${id}`),

        getUserStats: () => ApiService.request(CONFIG.ENDPOINTS.AUTH.STATS),
    },
    
    // Utility methods
    utils: {
        validateEmail: (email) => CONFIG.EMAIL_REGEX.test(email),
        validatePhone: (phone) => CONFIG.PHONE_REGEX.test(phone),
        validatePassword: (password) => password && password.length >= CONFIG.PASSWORD_MIN_LENGTH,
        
        formatDate: (dateString) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        
        formatDateTime: (dateString) => {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
};