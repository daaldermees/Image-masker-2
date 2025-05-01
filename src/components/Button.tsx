import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'green' | 'blue';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className,
  ...props 
}) => {
  const getButtonClass = () => {
    switch (variant) {
      case 'green':
        return 'green';
      case 'blue':
        return 'blue';
      case 'secondary':
        return 'secondary-button';
      case 'primary':
      default:
        return 'primary-button';
    }
  };

  return (
    <button 
      className={`${getButtonClass()} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 