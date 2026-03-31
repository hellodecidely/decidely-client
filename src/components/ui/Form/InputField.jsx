import React, { forwardRef } from 'react';
import { Form } from 'react-bootstrap';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const InputField = forwardRef(({
  label,
  type = 'text',
  error,
  hint,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password')
    : type;

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <Form.Label className="fw-semibold text-gray-700 mb-1">
          {label}
        </Form.Label>
      )}
      
      <div className="position-relative">
        {leftIcon && (
          <div className="position-absolute start-0 top-50 translate-middle-y ms-3">
            {leftIcon}
          </div>
        )}
        
        <Form.Control
          ref={ref}
          type={inputType}
          isInvalid={!!error}
          className={`
            py-2.5
            ${leftIcon ? 'ps-5' : ''}
            ${rightIcon || showPasswordToggle ? 'pe-5' : ''}
            ${error ? 'border-danger' : 'border-gray-300'}
            focus:border-primary focus:ring-2 focus:ring-primary/20
            transition-all
          `}
          {...props}
        />
        
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            className="position-absolute end-0 top-50 translate-middle-y me-3 btn btn-link p-0 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
        
        {rightIcon && !showPasswordToggle && (
          <div className="position-absolute end-0 top-50 translate-middle-y me-3">
            {rightIcon}
          </div>
        )}
        
        <Form.Control.Feedback type="invalid" className="d-block">
          {error}
        </Form.Control.Feedback>
      </div>
      
      {hint && !error && (
        <Form.Text className="text-muted mt-1 d-block">
          {hint}
        </Form.Text>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;