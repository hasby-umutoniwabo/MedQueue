import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const LoginForm = ({ onBackToLanding, onSwitchToSignup }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!ApiService.utils.validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            await login(formData);
            window.showToast && window.showToast('Welcome back! Login successful.', 'success');
        } catch (error) {
            setErrors({ submit: error.message });
            window.showToast && window.showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleForgotPassword = () => {
        window.showToast && window.showToast('Forgot password feature coming soon!', 'info');
    };

    const fillDemoCredentials = (type) => {
        if (type === 'admin') {
            setFormData({
                email: 'admin@medqueue.com',
                password: 'Admin123'
            });
        } else if (type === 'patient') {
            setFormData({
                email: 'patient@example.com',
                password: 'Patient123'
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center hero-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-2xl shadow-2xl p-8 fade-in">
                    {/* Header */}
                    <div className="text-center">
                        <button 
                            onClick={onBackToLanding}
                            className="mb-4 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <i className="fas fa-arrow-left mr-2"></i>
                            Back to Home
                        </button>
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            <i className="fas fa-hospital-user text-blue-600 mr-2"></i>
                            MedQueue
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sign in to your account
                        </p>
                    </div>
                    
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
                                <i className="fas fa-exclamation-circle mr-2"></i>
                                {errors.submit}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`block w-full px-3 py-3 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                            errors.email 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        placeholder="Enter your email"
                                    />
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <i className="fas fa-envelope text-gray-400"></i>
                                    </div>
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            
                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`block w-full px-3 py-3 pl-10 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                            errors.password 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        placeholder="Enter your password"
                                    />
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <i className="fas fa-lock text-gray-400"></i>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <LoadingSpinner size="sm" color="white" />
                                        <span className="ml-2">Signing in...</span>
                                    </div>
                                ) : (
                                    <>
                                        <i className="fas fa-sign-in-alt mr-2"></i>
                                        Sign In
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Social Login (Optional) */}
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                                    onClick={() => window.showToast && window.showToast('Google sign-in coming soon!', 'info')}
                                >
                                    <i className="fab fa-google text-red-500"></i>
                                    <span className="ml-2">Google</span>
                                </button>

                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                                    onClick={() => window.showToast && window.showToast('Microsoft sign-in coming soon!', 'info')}
                                >
                                    <i className="fab fa-microsoft text-blue-500"></i>
                                    <span className="ml-2">Microsoft</span>
                                </button>
                            </div>
                        </div>

                        {/* Sign Up Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={onSwitchToSignup}
                                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                >
                                    Sign up here
                                </button>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Demo Credentials */}
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 text-white">
                    <h4 className="font-semibold mb-3 text-center">Demo Credentials</h4>
                    <div className="space-y-2">
                        <button
                            onClick={() => fillDemoCredentials('admin')}
                            className="w-full text-left p-2 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                        >
                            <div className="text-sm">
                                <strong>Admin:</strong> admin@medqueue.com / Admin123
                            </div>
                        </button>
                        <button
                            onClick={() => fillDemoCredentials('patient')}
                            className="w-full text-left p-2 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                        >
                            <div className="text-sm">
                                <strong>Patient:</strong> patient@example.com / Patient123
                            </div>
                        </button>
                    </div>
                    <p className="text-xs text-center mt-2 text-gray-200">
                        Click on any demo account to auto-fill the form
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;