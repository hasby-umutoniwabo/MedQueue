import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const SignupForm = ({ onBackToLanding, onSwitchToLogin }) => {
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'patient',
        language: 'en',
        agreeToTerms: false
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        // Full Name validation
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!ApiService.utils.validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!ApiService.utils.validatePhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid Rwandan phone number (e.g., 0788123456)';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!ApiService.utils.validatePassword(formData.password)) {
            newErrors.password = `Password must be at least 6 characters`;
        }

        // Confirm Password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Terms agreement validation
        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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
            const { confirmPassword, agreeToTerms, ...signupData } = formData;
            await signup(signupData);
            window.showToast && window.showToast('Account created successfully! Welcome to MedQueue.', 'success');
        } catch (error) {
            setErrors({ submit: error.message });
            window.showToast && window.showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
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
                            Create your account
                        </p>
                    </div>
                    
                    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
                                <i className="fas fa-exclamation-circle mr-2"></i>
                                {errors.submit}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Full Name Field */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        autoComplete="name"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={`block w-full px-3 py-3 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                            errors.fullName 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        placeholder="Enter your full name"
                                    />
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <i className="fas fa-user text-gray-400"></i>
                                    </div>
                                </div>
                                {errors.fullName && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.fullName}
                                    </p>
                                )}
                            </div>

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

                            {/* Phone Field */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`block w-full px-3 py-3 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                            errors.phone 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        placeholder="0788123456"
                                    />
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <i className="fas fa-phone text-gray-400"></i>
                                    </div>
                                </div>
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            {/* Role and Language Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="patient">Patient</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                                        Language
                                    </label>
                                    <select
                                        id="language"
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="en">English</option>
                                        <option value="rw">Kinyarwanda</option>
                                        <option value="fr">Français</option>
                                    </select>
                                </div>
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
                                        autoComplete="new-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`block w-full px-3 py-3 pl-10 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                            errors.password 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        placeholder="Create a strong password"
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

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`block w-full px-3 py-3 pl-10 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                            errors.confirmPassword 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        placeholder="Confirm your password"
                                    />
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <i className="fas fa-lock text-gray-400"></i>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            {/* Terms Agreement */}
                            <div>
                                <div className="flex items-start">
                                    <input
                                        id="agreeToTerms"
                                        name="agreeToTerms"
                                        type="checkbox"
                                        checked={formData.agreeToTerms}
                                        onChange={handleChange}
                                        className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                                        I agree to the{' '}
                                        <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                                            Terms and Conditions
                                        </a>{' '}
                                        and{' '}
                                        <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                                            Privacy Policy
                                        </a>
                                    </label>
                                </div>
                                {errors.agreeToTerms && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.agreeToTerms}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <LoadingSpinner size="sm" color="white" />
                                        <span className="ml-2">Creating account...</span>
                                    </div>
                                ) : (
                                    <>
                                        <i className="fas fa-user-plus mr-2"></i>
                                        Create Account
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Sign In Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={onSwitchToLogin}
                                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                >
                                    Sign in here
                                </button>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Help Text */}
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 text-white text-center">
                    <h4 className="font-semibold mb-2">Getting Started</h4>
                    <p className="text-sm">
                        Create your account to start managing your healthcare appointments efficiently with MedQueue.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;