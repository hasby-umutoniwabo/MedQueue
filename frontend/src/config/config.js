// Application Configuration
export const CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api',
    APP_NAME: 'MedQueue',
    VERSION: '1.0.0',
    SUPPORTED_LANGUAGES: ['en', 'rw', 'fr'],
    USER_ROLES: ['patient', 'staff', 'admin'],
    PHONE_REGEX: /^(\+250|0)[0-9]{9}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 6,
    
    // Local Storage Keys
    STORAGE_KEYS: {
        TOKEN: 'medqueue_token',
        REFRESH_TOKEN: 'medqueue_refresh_token',
        USER: 'medqueue_user',
        LANGUAGE: 'medqueue_language'
    },
    
    // API Endpoints
    ENDPOINTS: {
        AUTH: {
            SIGNUP: '/auth/signup',
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            ME: '/auth/me',
            REFRESH: '/auth/refresh-token',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password',
            UPDATE_PROFILE: '/auth/update-me',
            UPDATE_PASSWORD: '/auth/update-password',
            DELETE_ACCOUNT: '/auth/delete-me',
            USERS: '/auth/users',
            USER_BY_ID: '/auth/users',
            STATS: '/auth/stats'
        }
    },
    
    // UI Constants
    UI: {
        TOAST_DURATION: 5000,
        DEBOUNCE_DELAY: 300,
        PAGINATION_LIMIT: 10
    }
};