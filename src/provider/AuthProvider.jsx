// provider/AuthProvider.jsx
import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api/auth';
import { toast } from 'react-hot-toast';
import AuthContext from '../contexts/AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [plan, setPlan] = useState(null);
  const [planExpiresAt, setPlanExpiresAt] = useState(null);
  const [limits, setLimits] = useState({ 
    workspaces: 2, 
    projects: 2, 
    approvals: 20, 
    imageDocSize: 10,  // Images & Documents limit in MB
    videoSize: 20      // Videos limit in MB
  });

  // ✅ Fetch current plan from backend
  const fetchCurrentPlan = async () => {
    if (!token) return;
    
    try {
      const response = await authAPI.getCurrentPlan();
      console.log('📊 Plan response:', response);
      
      if (response.success) {
        setPlan(response.plan);
        setPlanExpiresAt(response.planExpiresAt);
        setLimits(response.limits);
        
        // Store plan in localStorage for quick access
        localStorage.setItem('userPlan', response.plan);
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Fetch current plan
        await fetchCurrentPlan();
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // ✅ Check plan periodically (every 30 seconds)
  useEffect(() => {
    if (!token) return;
    
    // Check immediately
    fetchCurrentPlan();
    
    // Check every 30 seconds
    const interval = setInterval(fetchCurrentPlan, 30000);
    
    return () => clearInterval(interval);
  }, [token]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        
        // Fetch plan after login
        await fetchCurrentPlan();
        
        toast.success('Welcome back!');
        return { success: true };
      } else {
        toast.error(response.error || 'Login failed');
        return { success: false, error: response.error };
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed. Please check your credentials.';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        
        // Fetch plan after registration
        await fetchCurrentPlan();
        
        toast.success('Account created successfully!');
        return { success: true };
      } else {
        toast.error(response.error || 'Registration failed');
        return { success: false, error: response.error };
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userPlan');
    setToken(null);
    setUser(null);
    setPlan(null);
    setPlanExpiresAt(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(userData);
      
      if (response.success) {
        const updatedUser = response.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully!');
        return { success: true, user: updatedUser };
      } else {
        toast.error(response.error || 'Update failed');
        return { success: false, error: response.error };
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Update failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper functions for components
  const getMaxFileSize = (type = 'image') => {
    if (type === 'video') {
      return limits.videoSize * 1024 * 1024;
    }
    return limits.imageDocSize * 1024 * 1024;
  };

  const canCreateWorkspace = () => {
    if (plan === 'agency') return true;
    if (plan === 'pro') return limits.workspaces === 'Unlimited' ? true : user?.workspacesCount < limits.workspaces;
    return user?.workspacesCount < 2;
  };

  const canCreateProject = () => {
    if (plan === 'agency') return true;
    if (plan === 'pro') return limits.projects === 'Unlimited' ? true : user?.projectsCount < limits.projects;
    return user?.projectsCount < 2;
  };

  const canCreateApproval = () => {
    if (plan === 'agency') return true;
    if (plan === 'pro') return limits.approvals === 'Unlimited' ? true : user?.approvalsCount < limits.approvals;
    return user?.approvalsCount < 20;
  };

  const getPlanDisplay = () => {
    return plan ? plan.toUpperCase() : 'FREE';
  };

  const getDaysRemaining = () => {
    if (!planExpiresAt) return null;
    const days = Math.ceil((new Date(planExpiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const isAuthenticated = !!token;

  // ✅ Context Value - All data and functions available to components
  const value = {
    // Data
    user,
    token,
    plan,
    planExpiresAt,
    limits,
    loading,
    isAuthenticated,
    
    // Auth functions
    register,
    login,
    logout,
    updateProfile,
    
    // Plan helpers
    refreshPlan: fetchCurrentPlan,
    getMaxFileSize,
    canCreateWorkspace,
    canCreateProject,
    canCreateApproval,
    getPlanDisplay,
    getDaysRemaining,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};