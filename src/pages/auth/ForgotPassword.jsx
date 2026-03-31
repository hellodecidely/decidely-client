import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { FiMail, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

import AuthLayout from '../../components/layout/AuthLayout';
import { authAPI } from '../../services/api/auth';
import { ROUTES } from '../../utils/constants';

const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setEmail(data.email);
    
    try {
      // Use the authAPI instead of direct axios
      const response = await authAPI.forgotPassword(data.email);
      
      if (response.success) {
        setIsSubmitted(true);
        toast.success('Reset link sent to your email!');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.error || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setIsSubmitted(false);
    // Reset form
    document.querySelector('form')?.reset();
  };

  if (isSubmitted) {
    return (
      <AuthLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-5"
        >
          <div className="mb-4">
            <div className="bg-success bg-opacity-10 rounded-circle p-4 d-inline-flex">
              <FiCheckCircle size={48} className="text-success" />
            </div>
          </div>
          
          <h3 className="h4 fw-semibold mb-3">Check your email</h3>
          <p className="text-muted mb-2">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-muted small mb-4">
            Click the link in the email to reset your password. The link will expire in 10 minutes.
          </p>
          
          <div className="d-flex flex-column gap-3">
            <button
              type="button"
              onClick={handleResend}
              className="btn btn-outline-primary"
            >
              Resend email
            </button>
            <Link to="/login" className="text-primary text-decoration-none small">
              ← Back to Login
            </Link>
          </div>
          
          <div className="mt-4 pt-3 border-top">
            <p className="text-muted small mb-0">
              Didn't receive the email? Check your spam folder or{' '}
              <Link to="/contact" className="text-primary">
                contact support
              </Link>
            </p>
          </div>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl fw-bold mb-2">Reset your password</h1>
        <p className="text-muted">Enter your email to receive a reset link</p>
      </motion.div>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <div className="bg-light rounded-3 p-3 mb-4">
            <p className="text-muted small mb-0">
              We'll send you a link to reset your password. The link will expire in 10 minutes.
            </p>
          </div>
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label className="form-label fw-semibold small text-uppercase text-muted mb-2">
            Email Address
          </label>
          <div className="position-relative">
            <FiMail className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
            <input
              type="email"
              className={`form-control py-3 ps-5 rounded-3 border-0 bg-light ${errors.email ? 'is-invalid' : ''}`}
              placeholder="hello@gmail.com"
              {...register('email')}
            />
          </div>
          {errors.email && <div className="text-danger small mt-1">{errors.email.message}</div>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-100 py-3 rounded-3 fw-semibold mb-4"
        >
          {isLoading ? (
            <>
              <div className="spinner-border spinner-border-sm me-2" role="status" />
              Sending reset link...
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>

        {/* Back to Login */}
        <div className="text-center">
          <Link to="/login" className="text-primary text-decoration-none small">
            <FiArrowLeft className="me-1" /> Back to Login
          </Link>
        </div>
      </Form>
    </AuthLayout>
  );
};

export default ForgotPassword;