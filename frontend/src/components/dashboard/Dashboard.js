import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { CONFIG } from '../../config/config';
import LoadingSpinner from '../common/LoadingSpinner';

const Dashboard = ({ onNavigateToProfile }) => {
    const { user, logout } = useAuth();
    const [currentPage, setCurrentPage] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    const fetchUserStats = useCallback(async () => {
        if (user?.role !== 'admin') return;
        
        try {
            const response = await ApiService.auth.getUserStats();
            setStats(response.data.stats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            window.showToast && window.showToast('Failed to load statistics', 'error');
        }
    }, [user?.role]);

    const fetchUsers = useCallback(async () => {
        if (currentPage !== 'users' || user?.role !== 'admin') return;
        
        setLoading(true);
        try {
            const response = await ApiService.auth.getAllUsers({ limit: 20 });
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            window.showToast && window.showToast('Failed to load users. Please check your permissions.', 'error');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, user?.role]);

    useEffect(() => {
        fetchUserStats();
    }, [fetchUserStats]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showProfileDropdown) {
                const dropdown = document.getElementById('profile-dropdown-container');
                if (dropdown && !dropdown.contains(event.target)) {
                    console.log('Closing dropdown - clicked outside');
                    setShowProfileDropdown(false);
                }
            }
        };

        if (showProfileDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showProfileDropdown]);

    const handleLogout = async () => {
        try {
            console.log('🚪 Logout button clicked');
            setShowProfileDropdown(false);
            
            // Get the refresh token using the correct CONFIG key
            const refreshToken = localStorage.getItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
            console.log('🔑 Refresh token found:', refreshToken ? 'Yes' : 'No');
            
            // Show loading message if available
            window.showToast && window.showToast('Logging out...', 'info');
            
            // Call logout function
            await logout(refreshToken);
            
            // Success message will be shown after redirect
            console.log('✅ Logout completed successfully');
            
        } catch (error) {
            console.error('❌ Logout failed:', error);
            
            // Force logout even if API fails
            try {
                await logout();
                window.showToast && window.showToast('Logged out (with warnings)', 'warning');
            } catch (fallbackError) {
                console.error('❌ Fallback logout failed:', fallbackError);
                // Manual cleanup as absolute last resort
                Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
                    localStorage.removeItem(key);
                });
                window.location.href = '/';
            }
        }
    };

    const handleProfileClick = () => {
        console.log('Profile menu clicked');
        setShowProfileDropdown(false);
        if (onNavigateToProfile) {
            onNavigateToProfile();
        }
    };

    const toggleDropdown = () => {
        console.log('🎯 Toggle dropdown clicked. Current state:', showProfileDropdown);
        const newState = !showProfileDropdown;
        setShowProfileDropdown(newState);
        console.log('🎯 New dropdown state:', newState);
    };

    const StatCard = ({ icon, title, value, color = 'blue', description }) => (
        <div className="bg-white overflow-hidden shadow-lg rounded-xl p-6 card-hover">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <div className={`bg-${color}-100 p-3 rounded-lg`}>
                        <i className={`${icon} text-${color}-600 text-xl`}></i>
                    </div>
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {description && (
                        <p className="text-sm text-gray-600 mt-1">{description}</p>
                    )}
                </div>
            </div>
        </div>
    );

    const UserRow = ({ user: userData }) => (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <i className="fas fa-user text-blue-600"></i>
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{userData.fullName}</div>
                        <div className="text-sm text-gray-500">{userData.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    userData.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    userData.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                }`}>
                    {userData.role}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {userData.phone}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    userData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {userData.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {ApiService.utils.formatDate(userData.createdAt)}
            </td>
        </tr>
    );

    const renderOverview = () => (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.fullName}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                    Here's what's happening with your MedQueue account today.
                </p>
            </div>

            {/* User Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon="fas fa-user"
                    title="Account Status"
                    value={user?.isActive ? 'Active' : 'Inactive'}
                    color={user?.isActive ? 'green' : 'red'}
                />
                <StatCard
                    icon="fas fa-shield-alt"
                    title="Role"
                    value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    color="blue"
                />
                <StatCard
                    icon="fas fa-envelope"
                    title="Email Status"
                    value={user?.emailVerified ? 'Verified' : 'Unverified'}
                    color={user?.emailVerified ? 'green' : 'yellow'}
                />
                <StatCard
                    icon="fas fa-phone"
                    title="Phone Status"
                    value={user?.phoneVerified ? 'Verified' : 'Unverified'}
                    color={user?.phoneVerified ? 'green' : 'yellow'}
                />
            </div>

            {/* Admin Stats */}
            {user?.role === 'admin' && stats && (
                <div className="bg-white shadow-lg rounded-xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center p-6 border border-gray-200 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 capitalize mb-2">
                                    {stat.role}s
                                </h3>
                                <p className="text-3xl font-bold text-blue-600 mb-1">{stat.count}</p>
                                <p className="text-sm text-gray-500">{stat.active} active users</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button
                        onClick={handleProfileClick}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all"
                    >
                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                            <i className="fas fa-user-edit text-blue-600"></i>
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-900">Edit Profile</h3>
                            <p className="text-sm text-gray-600">Update your personal information</p>
                        </div>
                    </button>
                    
                    <button
                        onClick={handleProfileClick}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-all"
                    >
                        <div className="bg-green-100 p-3 rounded-lg mr-4">
                            <i className="fas fa-key text-green-600"></i>
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-900">Change Password</h3>
                            <p className="text-sm text-gray-600">Update your account password</p>
                        </div>
                    </button>

                    <button
                        onClick={() => window.showToast && window.showToast('Queue management feature coming soon!', 'info')}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-all"
                    >
                        <div className="bg-purple-100 p-3 rounded-lg mr-4">
                            <i className="fas fa-list text-purple-600"></i>
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-900">Manage Queue</h3>
                            <p className="text-sm text-gray-600">View and manage your queue</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Account Information */}
            <div className="bg-white shadow-lg rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
                    <button
                        onClick={handleProfileClick}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                        <p className="text-gray-900">{user?.fullName}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                        <p className="text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                        <p className="text-gray-900">{user?.phone}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Language</label>
                        <p className="text-gray-900">{user?.language?.toUpperCase()}</p>
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

    const renderUsers = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <button
                    onClick={fetchUsers}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={loading}
                >
                    <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} mr-2`}></i>
                    Refresh
                </button>
            </div>

            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
                </div>
                
                {loading ? (
                    <div className="p-8">
                        <LoadingSpinner />
                        <p className="text-center text-gray-500 mt-4">Loading users...</p>
                    </div>
                ) : users.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Joined
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((userData) => (
                                    <UserRow key={userData.id} user={userData} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <i className="fas fa-users text-gray-300 text-4xl mb-4"></i>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-500">
                            {user?.role !== 'admin' 
                                ? "You need admin privileges to view users." 
                                : "Try refreshing or check your connection."
                            }
                        </p>
                        {user?.role === 'admin' && (
                            <button
                                onClick={fetchUsers}
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <i className="fas fa-redo mr-2"></i>
                                Try Again
                            </button>
                        )}
                    </div>
                )}
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
                            <h1 className="text-2xl font-bold gradient-text mr-8">
                                <i className="fas fa-hospital-user mr-2"></i>
                                MedQueue
                            </h1>
                            <nav className="hidden md:flex space-x-8">
                                <button 
                                    onClick={() => setCurrentPage('overview')}
                                    className={`${currentPage === 'overview' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'} border-b-2 py-2 px-1 text-sm font-medium transition-colors`}
                                >
                                    <i className="fas fa-tachometer-alt mr-2"></i>
                                    Overview
                                </button>
                                {user?.role === 'admin' && (
                                    <button 
                                        onClick={() => setCurrentPage('users')}
                                        className={`${currentPage === 'users' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'} border-b-2 py-2 px-1 text-sm font-medium transition-colors`}
                                    >
                                        <i className="fas fa-users mr-2"></i>
                                        Users
                                    </button>
                                )}
                            </nav>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {/* User Info */}
                            <div className="flex items-center text-sm text-gray-700">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                    <i className="fas fa-user text-blue-600"></i>
                                </div>
                                <div className="mr-2">
                                    <p className="font-medium">{user?.fullName}</p>
                                    <p className="text-xs text-gray-500">{user?.role}</p>
                                </div>
                            </div>
                            
                            {/* Profile Dropdown */}
                            <div className="relative" id="profile-dropdown-container">
                                <button
                                    onClick={toggleDropdown}
                                    className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-all duration-200 border-2 border-blue-200 shadow-md"
                                    aria-label="Profile menu"
                                    style={{ minWidth: '48px', minHeight: '48px' }}
                                >
                                    <i className={`fas fa-chevron-${showProfileDropdown ? 'up' : 'down'} text-lg`}></i>
                                </button>
                                
                                {/* Debug indicator - remove this in production */}
                                {showProfileDropdown && (
                                    <div className="absolute top-14 right-0 bg-green-500 text-white px-2 py-1 text-xs rounded-md z-50 shadow-lg">
                                        ✅ Dropdown is OPEN
                                    </div>
                                )}
                                
                                {/* Dropdown Menu */}
                                {showProfileDropdown && (
                                    <div 
                                        className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-2xl py-2 border border-gray-200"
                                        style={{
                                            zIndex: 9999,
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                            top: '100%'
                                        }}
                                    >
                                        {/* User Info Header */}
                                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                                            <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                                            <p className="text-xs text-gray-600">{user?.email}</p>
                                            <p className="text-xs text-blue-600 font-medium mt-1">
                                                <i className="fas fa-shield-alt mr-1"></i>
                                                {user?.role?.toUpperCase()}
                                            </p>
                                        </div>
                                        
                                        {/* Menu Items */}
                                        <div className="py-1">
                                            <button
                                                onClick={handleProfileClick}
                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                                            >
                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200">
                                                    <i className="fas fa-user-edit text-blue-600 text-sm"></i>
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium">Edit Profile</p>
                                                    <p className="text-xs text-gray-500">Update your information</p>
                                                </div>
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    setShowProfileDropdown(false);
                                                    window.showToast && window.showToast('Settings feature coming soon!', 'info');
                                                }}
                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                                            >
                                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200">
                                                    <i className="fas fa-cog text-gray-600 text-sm"></i>
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium">Settings</p>
                                                    <p className="text-xs text-gray-500">Preferences & privacy</p>
                                                </div>
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    setShowProfileDropdown(false);
                                                    window.showToast && window.showToast('Help feature coming soon!', 'info');
                                                }}
                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                                            >
                                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200">
                                                    <i className="fas fa-question-circle text-gray-600 text-sm"></i>
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium">Help & Support</p>
                                                    <p className="text-xs text-gray-500">Get assistance</p>
                                                </div>
                                            </button>
                                        </div>
                                        
                                        {/* Divider */}
                                        <div className="border-t border-gray-100 my-1"></div>
                                        
                                        {/* Logout Section */}
                                        <div className="py-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium group"
                                            >
                                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200">
                                                    <i className="fas fa-sign-out-alt text-red-600 text-sm"></i>
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium">Logout</p>
                                                    <p className="text-xs text-red-500">Sign out of your account</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Debug Info - Remove in production */}
            <div className="fixed top-4 left-4 bg-black text-white p-3 text-xs rounded-lg z-50 shadow-lg">
                <div>🎯 Dropdown State: <span className="font-bold text-green-400">{showProfileDropdown ? 'OPEN' : 'CLOSED'}</span></div>
                <div>👤 User: <span className="font-bold text-blue-400">{user?.fullName || 'Loading...'}</span></div>
                <div>🔑 Token: <span className="font-bold text-yellow-400">{localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN) ? 'Present' : 'Missing'}</span></div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {currentPage === 'overview' && renderOverview()}
                {currentPage === 'users' && user?.role === 'admin' && renderUsers()}
            </main>
        </div>
    );
};

export default Dashboard;