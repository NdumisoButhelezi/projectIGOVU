import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  color = '#000000',
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div 
      className={`${sizeClasses[size]} border-2 border-gray-200 border-t-current rounded-full animate-spin ${className}`}
      style={{ borderTopColor: color }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
         
