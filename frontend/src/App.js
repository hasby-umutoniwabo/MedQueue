import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/landing/LandingPage';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import Dashboard from './components/dashboard/Dashboard';
import ProfileEdit from './components/profile/ProfileEdit';
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

  // Update URL and view state
  useEffect(() => {
    const path = window.location.pathname;
    if (isAuthenticated && user) {
      if (path === '/profile') {
        setCurrentView('profile');
      } else {
        setCurrentView('dashboard');
        if (path !== '/dashboard') {
          window.history.pushState(null, '', '/dashboard');
        }
      }
    } else {
      if (path === '/login') {
        setCurrentView('login');
      } else if (path === '/signup') {
        setCurrentView('signup');
      } else {
        setCurrentView('landing');
        if (path !== '/') {
          window.history.pushState(null, '', '/');
        }
      }
    }
  }, [isAuthenticated, user]);

  const handleNavigateToLogin = () => {
    setCurrentView('login');
    window.history.pushState(null, '', '/login');
  };

  const handleNavigateToSignup = () => {
    setCurrentView('signup');
    window.history.pushState(null, '', '/signup');
  };

  const handleNavigateToLanding = () => {
    setCurrentView('landing');
    window.history.pushState(null, '', '/');
  };

  const handleNavigateToDashboard = () => {
    setCurrentView('dashboard');
    window.history.pushState(null, '', '/dashboard');
  };

  const handleNavigateToProfile = () => {
    setCurrentView('profile');
    window.history.pushState(null, '', '/profile');
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (isAuthenticated && user) {
        if (path === '/profile') {
          setCurrentView('profile');
        } else {
          setCurrentView('dashboard');
        }
      } else {
        if (path === '/login') {
          setCurrentView('login');
        } else if (path === '/signup') {
          setCurrentView('signup');
        } else {
          setCurrentView('landing');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated, user]);

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

  // If user is authenticated, show dashboard or profile
  if (isAuthenticated && user) {
    switch (currentView) {
      case 'profile':
        return (
          <ProfileEdit 
            onBackToDashboard={handleNavigateToDashboard}
          />
        );
      default:
        return (
          <Dashboard 
            onNavigateToProfile={handleNavigateToProfile}
          />
        );
    }
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