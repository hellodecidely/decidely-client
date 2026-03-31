// client/src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Spinner } from 'react-bootstrap';
import Layout from './components/layout/Layout';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/global.css';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/decidely/LandingPage'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Workspaces = lazy(() => import('./pages/workspace/Workspaces'));
const Projects = lazy(() => import('./pages/project/Projects'));
const Approvals = lazy(() => import('./pages/approval/Approvals'));
const MagicLinks = lazy(() => import('./pages/magic/MagicLinks'));
import WorkspaceDashboard from './pages/workspace/WorkspaceDashboard';
import ProjectDetails from './pages/project/ProjectDetail';
import ApprovalDetail from './pages/approval/ApprovalDetail';
import ClientView from './pages/client/ClientView';
import Settings from './pages/setting/Settings';
import Pricing from './pages/decidely/Pricing';
import Usage from './pages/decidely/Usage';
import About from './pages/decidely/About';
import Contact from './pages/decidely/Contact';
import ClientPortal from './pages/client/ClientPortal';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Public route wrapper (only for login/register/forgot-password)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // ✅ Allow access to forgot-password even if logged in
  if (token && window.location.pathname === '/forgot-password') {
    return children;
  }
  if (token) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

// Loading component
const LoadingSpinner = () => (
  <div className="min-vh-100 d-flex align-items-center justify-content-center">
    <div className="text-center">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3 text-muted">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Public Pages */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            
            {/* Auth Pages - Redirect to dashboard if logged in */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />

            {/* ✅ RESET PASSWORD - NO AUTH, NO REDIRECTS, FULLY PUBLIC */}
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Client Portal - Public */}
            <Route path="/review/:token" element={<ClientPortal />} />

            {/* Protected Routes - Require Login */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="workspaces" element={<Workspaces />} />
              <Route path="projects" element={<Projects />} />
              <Route path="approvals" element={<Approvals />} />
              <Route path="magic-links" element={<MagicLinks />} />
              <Route path="settings" element={<Settings />} />
              <Route path="workspaces/:id" element={<WorkspaceDashboard />} />
              <Route path="projects/:id" element={<ProjectDetails />} />
              <Route path="approvals/:id" element={<ApprovalDetail />} />
              <Route path="clients" element={<ClientView />} />
              <Route path="projects/:projectId/clients" element={<ClientView />} />
              <Route path="usage" element={<Usage />} />
            </Route>

            {/* 404 Page */}
            <Route path="*" element={
              <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                  <h1 className="display-1 text-muted">404</h1>
                  <p className="lead">Page not found</p>
                  <a href="/" className="btn btn-primary">Go Home</a>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
      </Router>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          },
        }}
      />
    </>
  );
}

export default App;