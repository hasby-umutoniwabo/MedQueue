import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/landing/LandingPage';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import Dashboard from './components/dashboard/Dashboard';
import LoadingSpinner from './components/common/LoadingSpinner';
import ToastContainer from './components/common/Toast';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <div className="App">
        <ToastContainer />
        <AppContent />
      </div>
    </AuthProvider>
  );
};

const AppContent = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('landing');

  const handleNavigateToLogin = () => setCurrentView('login');
  const handleNavigateToSignup = () => setCurrentView('signup');
  const handleNavigateToLanding = () => setCurrentView('landing');

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600 text-lg">Loading MedQueue...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (isAuthenticated && user) {
    return <Dashboard />;
  }

  // If user is not authenticated, show the appropriate view
  switch (currentView) {
    case 'login':
      return (
        <LoginForm 
          onBackToLanding={handleNavigateToLanding}
          onSwitchToSignup={handleNavigateToSignup}
        />
      );
    case 'signup':
      return (
        <SignupForm 
          onBackToLanding={handleNavigateToLanding}
          onSwitchToLogin={handleNavigateToLogin}
        />
      );
    default:
      return (
        <LandingPage 
          onLoginClick={handleNavigateToLogin}
          onSignupClick={handleNavigateToSignup}
        />
      );
  }
};

export default App;