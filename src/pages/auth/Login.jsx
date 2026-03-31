import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';

import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../utils/constants';

// Validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const from = redirectParam === 'pricing' ? '/pricing' : location.state?.from?.pathname || ROUTES.DASHBOARD;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await login(data);
    setIsLoading(false);
    if (result.success) navigate(from, { replace: true });
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl fw-bold mb-2">Welcome back</h1>
        <p className="text-muted">Sign in to your Decidely account</p>
      </motion.div>

      <Form onSubmit={handleSubmit(onSubmit)}>
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
              placeholder="hello@decidely.app"
              {...register('email')}
            />
          </div>
          {errors.email && <div className="text-danger small mt-1">{errors.email.message}</div>}
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label className="form-label fw-semibold small text-uppercase text-muted mb-2">
            Password
          </label>
          <div className="position-relative">
            <FiLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              className={`form-control py-3 ps-5 pe-5 rounded-3 border-0 bg-light ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Enter your password"
              {...register('password')}
            />
            <button
              type="button"
              className="position-absolute top-50 end-0 translate-middle-y me-3 btn btn-link p-0 text-muted"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {errors.password && <div className="text-danger small mt-1">{errors.password.message}</div>}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Form.Check
            type="checkbox"
            id="remember-me"
            label={<span className="text-muted small">Remember me</span>}
            className="text-muted"
          />
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-primary text-decoration-none small fw-semibold">
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-100 py-3 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
          style={{ transition: 'all 0.2s' }}
        >
          {isLoading ? (
            <>
              <div className="spinner-border spinner-border-sm" role="status" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <FiArrowRight />
            </>
          )}
        </button>

        {/* Sign Up Link */}
        <div className="text-center mt-4 pt-2">
          <p className="text-muted mb-0">
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} className="text-primary fw-semibold text-decoration-none">
              Create one now
            </Link>
          </p>
        </div>
      </Form>
    </AuthLayout>
  );
};

export default Login;