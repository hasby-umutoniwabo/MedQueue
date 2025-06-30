import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    const colorClasses = {
        blue: 'border-blue-600',
        white: 'border-white',
        gray: 'border-gray-600',
        green: 'border-green-600',
        red: 'border-red-600'
    };

    return (
        <div className="flex justify-center items-center">
            <div 
                className={`animate-spin rounded-full border-2 border-gray-200 ${colorClasses[color]} ${sizeClasses[size]}`} 
                style={{ borderTopColor: 'transparent' }}
            />
        </div>
    );
};

export const FullPageLoading = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <LoadingSpinner size="xl" />
            <p className="mt-4 text-gray-600 text-lg">Loading MedQueue...</p>
        </div>
    </div>
);

export const ButtonLoading = ({ children, loading, ...props }) => (
    <button {...props} disabled={loading || props.disabled}>
        {loading ? (
            <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" color="white" />
                <span className="ml-2">Loading...</span>
            </div>
        ) : (
            children
        )}
    </button>
);

export default LoadingSpinner;