import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ProfileEdit = ({ onBackToDashboard }) => {
    const { user, fetchUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    
    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        language: user?.language || 'en'
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});

    const validateProfileForm = () => {
        const newErrors = {};

        if (!profileData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (profileData.fullName.trim().length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters';
        }

        if (!profileData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!ApiService.utils.validatePhone(profileData.phone)) {
            newErrors.phone = 'Please enter a valid Rwandan phone number (e.g., 0788123456)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePasswordForm = () => {
        const newErrors = {};

        if (!passwordData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!passwordData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (!ApiService.utils.validatePassword(passwordData.newPassword)) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        
        if (!validateProfileForm()) return;

        setLoading(true);
        setErrors({});

        try {
            await ApiService.auth.updateProfile(profileData);
            await fetchUser(); // Refresh user data in context
            window.showToast && window.showToast('Profile updated successfully!', 'success');
        } catch (error) {
            setErrors({ submit: error.message });
            window.showToast && window.showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        if (!validatePasswordForm()) return;

        setLoading(true);
        setErrors({});

        try {
            await ApiService.auth.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            
            window.showToast && window.showToast('Password updated successfully!', 'success');
        } catch (error) {
            setErrors({ submit: error.message });
            window.showToast && window.showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
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

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
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

    const renderProfileTab = () => (
        <div className="space-y-6">
            <div className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                            <i className="fas fa-exclamation-circle mr-2"></i>
                            {errors.submit}
                        </div>
                    )}

                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={profileData.fullName}
                            onChange={handleProfileChange}
                            className={`block w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                errors.fullName 
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            }`}
                            placeholder="Enter your full name"
                        />
                        {errors.fullName && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <i className="fas fa-exclamation-circle mr-1"></i>
                                {errors.fullName}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className={`block w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                errors.phone 
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            }`}
                            placeholder="0788123456"
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <i className="fas fa-exclamation-circle mr-1"></i>
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                            Language
                        </label>
                        <select
                            id="language"
                            name="language"
                            value={profileData.language}
                            onChange={handleProfileChange}
                            className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="en">English</option>
                            <option value="rw">Kinyarwanda</option>
                            <option value="fr">Français</option>
                        </select>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <LoadingSpinner size="sm" color="white" />
                                    <span className="ml-2">Updating...</span>
                                </div>
                            ) : (
                                <>
                                    <i className="fas fa-save mr-2"></i>
                                    Update Profile
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Account Information Display */}
            <div className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Account Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                        <p className="text-gray-900">{user?.email}</p>
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                        <p className="text-gray-900 capitalize">{user?.role}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
                        <p className="text-gray-900">{ApiService.utils.formatDate(user?.createdAt)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Last Login</label>
                        <p className="text-gray-900">
                            {user?.lastLogin ? ApiService.utils.formatDateTime(user.lastLogin) : 'Never'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPasswordTab = () => (
        <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                {errors.submit && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                        <i className="fas fa-exclamation-circle mr-2"></i>
                        {errors.submit}
                    </div>
                )}

                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                    </label>
                    <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`block w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                            errors.currentPassword 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="Enter your current password"
                    />
                    {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {errors.currentPassword}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                    </label>
                    <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`block w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                            errors.newPassword 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="Enter your new password"
                    />
                    {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {errors.newPassword}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`block w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                            errors.confirmPassword 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="Confirm your new password"
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <LoadingSpinner size="sm" color="white" />
                                <span className="ml-2">Updating...</span>
                            </div>
                        ) : (
                            <>
                                <i className="fas fa-key mr-2"></i>
                                Update Password
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• Mix of letters and numbers recommended</li>
                    <li>• Avoid using personal information</li>
                </ul>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <button
                                onClick={onBackToDashboard}
                                className="text-gray-500 hover:text-gray-700 mr-4"
                            >
                                <i className="fas fa-arrow-left text-lg"></i>
                            </button>
                            <h1 className="text-2xl font-bold gradient-text">
                                <i className="fas fa-hospital-user mr-2"></i>
                                MedQueue
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm text-gray-700">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                    <i className="fas fa-user text-blue-600"></i>
                                </div>
                                <div>
                                    <p className="font-medium">{user?.fullName}</p>
                                    <p className="text-xs text-gray-500">{user?.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-gray-600 mt-2">
                        Manage your account settings and preferences.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`${
                                    activeTab === 'profile'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                <i className="fas fa-user mr-2"></i>
                                Profile Information
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`${
                                    activeTab === 'password'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                <i className="fas fa-key mr-2"></i>
                                Change Password
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="fade-in">
                    {activeTab === 'profile' && renderProfileTab()}
                    {activeTab === 'password' && renderPasswordTab()}
                </div>
            </main>
        </div>
    );
};

export default ProfileEdit;