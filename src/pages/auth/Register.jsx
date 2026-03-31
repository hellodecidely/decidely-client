import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { FiMail, FiLock, FiUser, FiBriefcase, FiArrowRight, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';

import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../utils/constants';

// Validation schema
const registerSchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number')
    .required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Please confirm your password'),
  company: yup.string().optional(),
});

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [agreeNewsletter, setAgreeNewsletter] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', company: '' },
  });

  const onSubmit = async (data) => {
    if (!acceptTerms) {
      alert('Please accept the terms and conditions');
      return;
    }
    setIsLoading(true);
    const { confirmPassword, ...userData } = data;
    const result = await registerUser(userData);
    setIsLoading(false);
    if (result.success) navigate(ROUTES.DASHBOARD);
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl fw-bold mb-2">Start your journey</h1>
        <p className="text-muted">Create your Decidely account in seconds</p>
      </motion.div>

      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* Name & Company Row */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-semibold small text-uppercase text-muted mb-2">Full Name</label>
            <div className="position-relative">
              <FiUser className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
              <input
                type="text"
                className={`form-control py-3 ps-5 rounded-3 border-0 bg-light ${errors.name ? 'is-invalid' : ''}`}
                placeholder="John Agency"
                {...register('name')}
              />
            </div>
            {errors.name && <div className="text-danger small mt-1">{errors.name.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold small text-uppercase text-muted mb-2">Company (Optional)</label>
            <div className="position-relative">
              <FiBriefcase className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
              <input
                type="text"
                className="form-control py-3 ps-5 rounded-3 border-0 bg-light"
                placeholder="Creative Agency Inc"
                {...register('company')}
              />
            </div>
          </div>
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label className="form-label fw-semibold small text-uppercase text-muted mb-2">Work Email</label>
          <div className="position-relative">
            <FiMail className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
            <input
              type="email"
              className={`form-control py-3 ps-5 rounded-3 border-0 bg-light ${errors.email ? 'is-invalid' : ''}`}
              placeholder="john@gmail.com"
              {...register('email')}
            />
          </div>
          {errors.email && <div className="text-danger small mt-1">{errors.email.message}</div>}
          <small className="text-muted mt-1 d-block">We'll send important updates to this email</small>
        </div>

        {/* Password Row */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-semibold small text-uppercase text-muted mb-2">Password</label>
            <div className="position-relative">
              <FiLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control py-3 ps-5 pe-5 rounded-3 border-0 bg-light ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Create a password"
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
            <small className="text-muted mt-1 d-block">Min. 6 characters with uppercase, lowercase, and number</small>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold small text-uppercase text-muted mb-2">Confirm Password</label>
            <div className="position-relative">
              <FiLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className={`form-control py-3 ps-5 pe-5 rounded-3 border-0 bg-light ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Confirm password"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                className="position-absolute top-50 end-0 translate-middle-y me-3 btn btn-link p-0 text-muted"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <div className="text-danger small mt-1">{errors.confirmPassword.message}</div>}
          </div>
        </div>

        {/* Terms & Newsletter */}
        <div className="mb-4">
          <Form.Check
            type="checkbox"
            id="terms"
            label={
              <span className="text-muted small">
                I agree to the{' '}
                <Link to="/terms" className="text-primary text-decoration-none">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary text-decoration-none">
                  Privacy Policy
                </Link>
              </span>
            }
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mb-3"
          />
          <Form.Check
            type="checkbox"
            id="newsletter"
            label={
              <span className="text-muted small">
                Send me product updates, tips, and announcements
              </span>
            }
            checked={agreeNewsletter}
            onChange={(e) => setAgreeNewsletter(e.target.checked)}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !acceptTerms}
          className="btn btn-primary w-100 py-3 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 mb-4"
          style={{ transition: 'all 0.2s' }}
        >
          {isLoading ? (
            <>
              <div className="spinner-border spinner-border-sm" role="status" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Agency Account</span>
              <FiArrowRight />
            </>
          )}
        </button>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-muted mb-0">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary fw-semibold text-decoration-none">
              Sign in here
            </Link>
          </p>
        </div>
      </Form>
    </AuthLayout>
  );
};

export default Register;