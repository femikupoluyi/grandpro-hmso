import { FC, ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'subtle';
}

const colorClasses = {
  solid: {
    gray: 'bg-gray-500 text-white',
    red: 'bg-red-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    green: 'bg-green-500 text-white',
    blue: 'bg-blue-500 text-white',
    indigo: 'bg-indigo-500 text-white',
    purple: 'bg-purple-500 text-white',
    pink: 'bg-pink-500 text-white',
  },
  outline: {
    gray: 'border-gray-500 text-gray-500',
    red: 'border-red-500 text-red-500',
    yellow: 'border-yellow-500 text-yellow-500',
    green: 'border-green-500 text-green-500',
    blue: 'border-blue-500 text-blue-500',
    indigo: 'border-indigo-500 text-indigo-500',
    purple: 'border-purple-500 text-purple-500',
    pink: 'border-pink-500 text-pink-500',
  },
  subtle: {
    gray: 'bg-gray-100 text-gray-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    purple: 'bg-purple-100 text-purple-700',
    pink: 'bg-pink-100 text-pink-700',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const Badge: FC<BadgeProps> = ({ 
  children, 
  color = 'gray', 
  size = 'md', 
  variant = 'solid' 
}) => {
  const variantClass = variant === 'outline' ? 'border-2' : '';
  
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${colorClasses[variant][color]}
        ${sizeClasses[size]}
        ${variantClass}
      `}
    >
      {children}
    </span>
  );
};
