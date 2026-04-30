export const API_URL = import.meta.env.VITE_API_URL || 'https://decidely-server.vercel.app/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Decidely';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  WORKSPACES: '/workspaces',
  PROJECTS: '/projects',
};

export const STATUS_COLORS = {
  pending: 'warning',
  approved: 'success',
  changes_requested: 'danger',
  blocked: 'secondary',
};

export const STATUS_TEXT = {
  pending: 'Pending Review',
  approved: 'Approved',
  changes_requested: 'Changes Requested',
  blocked: 'Blocked',
};