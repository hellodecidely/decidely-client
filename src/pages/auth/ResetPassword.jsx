// client/src/pages/auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiLock, FiCheckCircle, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api/auth';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');

  console.log('ResetPassword page opened with token:', token);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setValidating(false);
      setError('No reset token provided');
    }
  }, [token]);

  const validateToken = async () => {
    try {
      console.log('Validating token...');
      const response = await authAPI.validateResetToken(token);
      console.log('Validation response:', response);
      if (response.success) {
        setIsValid(true);
      } else {
        setError('Invalid or expired reset link');
      }
    } catch (error) {
      console.error('Validation error:', error);
      // Even if there's a 401 error, we don't redirect - just show error message
      setError('Invalid or expired reset link. Please request a new one.');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authAPI.resetPassword(token, password);
      if (response.success) {
        setIsSubmitted(true);
        toast.success('Password reset successful!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Reset error:', error);
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Validating your reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="mb-4">
                  <div className="bg-danger bg-opacity-10 rounded-circle p-4 d-inline-flex">
                    <FiLock size={48} className="text-danger" />
                  </div>
                </div>
                
                <h3 className="h4 fw-semibold mb-3">Invalid or Expired Link</h3>
                <p className="text-muted mb-4">
                  {error || 'This password reset link is invalid or has expired.'}
                  Please request a new password reset link.
                </p>
                
                <Link to="/forgot-password" className="btn btn-primary">
                  Request New Link
                </Link>
                
                <div className="mt-4">
                  <Link to="/login" className="text-primary text-decoration-none">
                    ← Back to Login
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="mb-4">
                  <div className="bg-success bg-opacity-10 rounded-circle p-4 d-inline-flex">
                    <FiCheckCircle size={48} className="text-success" />
                  </div>
                </div>
                
                <h3 className="h4 fw-semibold mb-3">Password Reset Successfully!</h3>
                <p className="text-muted mb-4">
                  Your password has been reset. You can now log in with your new password.
                </p>
                
                <Link to="/login" className="btn btn-primary">
                  Go to Login
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-4">
                <Link to="/" className="text-decoration-none">
                  <h1 className="h2 fw-bold text-primary">Decidely</h1>
                </Link>
                <p className="text-muted">Create new password</p>
              </div>

              <div className="card border-0 shadow-lg">
                <div className="card-body p-5">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="form-label fw-semibold">New Password</label>
                      <div className="position-relative">
                        <FiLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control py-3 ps-5 pe-5 rounded-3"
                          placeholder="Create a new password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="position-absolute top-50 end-0 translate-middle-y me-3 btn btn-link p-0 text-muted"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                      <small className="text-muted mt-1 d-block">
                        Must be at least 6 characters with uppercase, lowercase, and number
                      </small>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Confirm Password</label>
                      <div className="position-relative">
                        <FiLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="form-control py-3 ps-5 pe-5 rounded-3"
                          placeholder="Confirm your new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="position-absolute top-50 end-0 translate-middle-y me-3 btn btn-link p-0 text-muted"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary w-100 py-3 rounded-3 fw-semibold mb-4"
                    >
                      {isLoading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status" />
                          Resetting password...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>

                    <div className="text-center">
                      <Link to="/login" className="text-primary text-decoration-none">
                        <FiArrowLeft className="me-1" /> Back to Login
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;