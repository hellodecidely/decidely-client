import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api/auth';

const UsageContext = createContext({});

export const useUsage = () => useContext(UsageContext);

export const UsageProvider = ({ children }) => {
  // Don't fetch anything on mount - set default values immediately
  const [usage, setUsage] = useState(() => ({
    plan: 'free',
    workspaces: { used: 0, limit: 2, remaining: 2 },
    projects: { used: 0, limit: 2, remaining: 2 },
    approvals: { used: 0, limit: 20, remaining: 20, resetsIn: 30 },
    maxFileSize: '20MB'
  }));
  
  const [loading, setLoading] = useState(false); // Start with false, not true
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitError, setLimitError] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Only fetch usage when explicitly called, not on mount
  const fetchUsage = async (silent = false) => {
    if (!silent) setLoading(true);
    setApiError(null);
    
    try {
      const response = await authAPI.getUserUsage();
      if (response.success && response.data) {
        setUsage(response.data);
        setApiError(null);
      }
    } catch (error) {
      console.warn('Usage API not available yet:', error.message);
      setApiError('API not available');
      // Keep using default values - don't break the app
    } finally {
      setLoading(false);
    }
  };

  // Don't call fetchUsage in useEffect - remove the empty dependency array!

  const checkLimit = (type) => {
    // Use current usage state (which has defaults if API failed)
    const limits = {
      workspace: {
        used: usage?.workspaces?.used || 0,
        limit: usage?.workspaces?.limit || 2,
        name: 'workspaces'
      },
      project: {
        used: usage?.projects?.used || 0,
        limit: usage?.projects?.limit || 2,
        name: 'projects'
      },
      approval: {
        used: usage?.approvals?.used || 0,
        limit: usage?.approvals?.limit || 20,
        name: 'approvals'
      }
    };

    const limit = limits[type];
    
    if (limit.limit !== 'Unlimited' && limit.used >= limit.limit) {
      setLimitError({
        type,
        message: `You've reached your ${limit.name} limit (${limit.used}/${limit.limit}). Upgrade to Pro for more.`,
        used: limit.used,
        total: limit.limit
      });
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  const clearLimitError = () => {
    setLimitError(null);
  };

  const value = {
    usage,
    loading,
    showUpgradeModal,
    setShowUpgradeModal,
    limitError,
    checkLimit,
    clearLimitError,
    refreshUsage: fetchUsage,
    apiError // So components can know if API is available
  };

  return (
    <UsageContext.Provider value={value}>
      {children}
    </UsageContext.Provider>
  );
};