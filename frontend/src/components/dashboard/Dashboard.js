import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [currentPage, setCurrentPage] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUserStats = useCallback(async () => {
        try {
            const response = await ApiService.auth.getUserStats();
            setStats(response.data.stats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            window.showToast && window.showToast('Failed to load statistics', 'error');
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        if (currentPage !== 'users') return;
        
        setLoading(true);
        try {
            const response = await ApiService.auth.getAllUsers({ limit: 20 });
            setUsers(response.data.users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            window.showToast && window.showToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchUserStats();
        }
    }, [user, fetchUserStats]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleLogout = async () => {
        try {
            await logout();
            window.showToast && window.showToast('You have been logged out successfully', 'success');
        } catch (error) {
            console.error('Logout failed:', error);
        }
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

            {/* Account Information */}
            <div className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Account Information</h2>
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
                >
                    <i className="fas fa-sync-alt mr-2"></i>
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
                    </div>
                ) : (
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
                            <div className="flex items-center text-sm text-gray-700">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                    <i className="fas fa-user text-blue-600"></i>
                                </div>
                                <div>
                                    <p className="font-medium">{user?.fullName}</p>
                                    <p className="text-xs text-gray-500">{user?.role}</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="text-gray-500 hover:text-red-600 transition-colors p-2"
                                title="Logout"
                            >
                                <i className="fas fa-sign-out-alt text-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {currentPage === 'overview' && renderOverview()}
                {currentPage === 'users' && user?.role === 'admin' && renderUsers()}
            </main>
        </div>
    );
};

export default Dashboard;