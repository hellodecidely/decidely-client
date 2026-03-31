import React from 'react';
import { Spinner } from 'react-bootstrap';

const PrimaryButton = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'btn rounded-pill fw-semibold border-0 transition-all';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-700',
    secondary: 'bg-secondary text-white hover:bg-secondary-700',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary-50',
    danger: 'bg-danger text-white hover:bg-red-700',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-100' : '';
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${widthClass}
    ${className}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
  `.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading ? (
        <div className="d-flex align-items-center justify-content-center gap-2">
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default PrimaryButton;