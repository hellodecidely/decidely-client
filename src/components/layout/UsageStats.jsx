import React from 'react';
import { useUsage } from '../../contexts/UsageContext';
import { FiFolder, FiCheckSquare, FiUsers, FiTrendingUp } from 'react-icons/fi';

const UsageStats = () => {
  const { usage, loading } = useUsage();

  if (loading || !usage) {
    return (
      <div className="text-center p-3">
        <div className="spinner-border spinner-border-sm text-primary" role="status" />
      </div>
    );
  }

  const getProgressPercentage = (used, limit) => {
    if (limit === 'Unlimited') return 0;
    return Math.min(100, (used / limit) * 100);
  };

  const getProgressColor = (used, limit) => {
    if (limit === 'Unlimited') return 'bg-info';
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'bg-danger';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Usage Overview</h5>
          <span className={`badge bg-${usage.plan === 'free' ? 'secondary' : 'primary'}`}>
            {usage.plan.toUpperCase()} Plan
          </span>
        </div>
      </div>
      <div className="card-body">
        {/* Workspaces */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center">
              <FiFolder className="text-primary me-2" />
              <span className="fw-semibold">Workspaces</span>
            </div>
            <span className="small">
              {usage.workspaces.used} / {usage.workspaces.limit}
            </span>
          </div>
          <div className="progress" style={{ height: '6px' }}>
            <div 
              className={`progress-bar ${getProgressColor(usage.workspaces.used, usage.workspaces.limit)}`}
              style={{ width: `${getProgressPercentage(usage.workspaces.used, usage.workspaces.limit)}%` }}
            />
          </div>
        </div>

        {/* Projects */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center">
              <FiCheckSquare className="text-primary me-2" />
              <span className="fw-semibold">Projects</span>
            </div>
            <span className="small">
              {usage.projects.used} / {usage.projects.limit}
            </span>
          </div>
          <div className="progress" style={{ height: '6px' }}>
            <div 
              className={`progress-bar ${getProgressColor(usage.projects.used, usage.projects.limit)}`}
              style={{ width: `${getProgressPercentage(usage.projects.used, usage.projects.limit)}%` }}
            />
          </div>
        </div>

        {/* Approvals */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center">
              <FiTrendingUp className="text-primary me-2" />
              <span className="fw-semibold">Approvals (monthly)</span>
            </div>
            <span className="small">
              {usage.approvals.used} / {usage.approvals.limit}
            </span>
          </div>
          <div className="progress" style={{ height: '6px' }}>
            <div 
              className={`progress-bar ${getProgressColor(usage.approvals.used, usage.approvals.limit)}`}
              style={{ width: `${getProgressPercentage(usage.approvals.used, usage.approvals.limit)}%` }}
            />
          </div>
          <small className="text-muted d-block mt-1">
            Resets in {usage.approvals.resetsIn} days
          </small>
        </div>

        {/* Plan info */}
        <div className="bg-light rounded-3 p-3 mt-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="fw-bold">Max file size</span>
              <p className="text-muted small mb-0">{usage.maxFileSize}</p>
            </div>
            {usage.plan === 'free' && (
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => window.location.href = '/pricing'}
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageStats;