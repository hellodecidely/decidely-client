import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiFolder, FiCheckSquare, FiTrendingUp, FiZap,
  FiArrowLeft, FiRefreshCw, FiInfo, FiBarChart2,
  FiCalendar, FiHardDrive, FiUsers, FiAlertCircle,
  FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import { useUsage } from '../../contexts/UsageContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Usage = () => {
  const navigate = useNavigate();
  const { user, plan, limits, planExpiresAt, getPlanDisplay } = useAuth();
  const { 
    usage, 
    loading, 
    refreshUsage, 
    apiError,
    checkLimit 
  } = useUsage();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');


  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    setRefreshing(true);
    await refreshUsage(true);
    setRefreshing(false);
  };

  // Calculate days remaining until plan expires
  const getDaysRemaining = () => {
    if (!planExpiresAt) return null;
    const now = new Date();
    const expiresAt = new Date(planExpiresAt);
    const diffTime = expiresAt - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getProgressColor = (used, limit) => {
    if (limit === 'Unlimited') return 'bg-info';
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'bg-danger';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  };

  const getProgressPercentage = (used, limit) => {
    if (limit === 'Unlimited') return 0;
    return Math.min(100, (used / limit) * 100);
  };

  const getStatusIcon = (used, limit) => {
    if (limit === 'Unlimited') return <FiCheckCircle className="text-info" />;
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return <FiAlertCircle className="text-danger" />;
    if (percentage >= 70) return <FiAlertCircle className="text-warning" />;
    return <FiCheckCircle className="text-success" />;
  };

  const formatNumber = (num) => {
    if (num === 'Unlimited') return '∞';
    return num?.toLocaleString() || 0;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button 
          className="btn btn-outline-secondary rounded-circle p-2"
          onClick={() => navigate(-1)}
          style={{ width: '40px', height: '40px' }}
        >
          <FiArrowLeft />
        </button>
        <div className="flex-grow-1">
          <h1 className="h2 fw-bold mb-1">Usage & Limits</h1>
          <p className="text-muted mb-0">
            Track your resource usage and plan limits
          </p>
        </div>
        <button 
          className="btn btn-outline-primary"
          onClick={loadUsageData}
          disabled={refreshing}
        >
          <FiRefreshCw className={`me-2 ${refreshing ? 'spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* API Warning */}
      {apiError && (
        <div className="alert alert-info border-0 rounded-3 mb-4">
          <div className="d-flex align-items-center">
            <FiInfo className="me-3" size={20} />
            <div>
              <strong>Using default limits</strong>
              <p className="small mb-0 mt-1">
                Connect to backend to see your actual usage data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plan Overview Card */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm bg-primary text-white">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h6 className="text-white-50 mb-2">Current Plan</h6>
                  <h2 className="display-6 fw-bold mb-2 text-capitalize">
                    {usage?.plan || 'free'}
                  </h2>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    {/* ✅ SHOW PLAN EXPIRATION FOR PAID PLANS */}
                    {usage?.plan !== 'free' && daysRemaining !== null && daysRemaining > 0 && (
                      <span className="badge bg-light text-dark px-3 py-2">
                        <FiCalendar className="me-1" />
                        Expires in {daysRemaining} days
                      </span>
                    )}
                    {usage?.plan !== 'free' && daysRemaining !== null && daysRemaining <= 0 && (
                      <span className="badge bg-danger text-white px-3 py-2">
                        <FiCalendar className="me-1" />
                        Expired
                      </span>
                    )}
                    <span className="badge bg-light text-dark px-3 py-2">
                      <FiHardDrive className="me-1" />
                      Max file size: {usage?.maxFileSize || '20MB'}
                    </span>
                  </div>
                </div>
                <div className="col-md-6 text-md-end mt-3 mt-md-0">
                  {usage?.plan === 'free' && (
                    <button 
                      className="btn btn-light btn-lg px-4"
                      onClick={() => navigate('/pricing')}
                    >
                      Upgrade Plan
                      <FiZap className="ms-2" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Stats Cards */}
      <div className="row g-4 mb-4">
        {/* Workspaces Card */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                  <FiFolder className="text-primary" size={24} />
                </div>
                <span className={`badge bg-${usage?.workspaces?.limit === 'Unlimited' ? 'info' : 
                  (usage?.workspaces?.used >= usage?.workspaces?.limit ? 'danger' : 'success')} bg-opacity-10 text-dark px-3 py-2`}>
                  {getStatusIcon(usage?.workspaces?.used, usage?.workspaces?.limit)}
                  <span className="ms-1">
                    {usage?.workspaces?.used}/{formatNumber(usage?.workspaces?.limit)}
                  </span>
                </span>
              </div>
              
              <h5 className="fw-bold mb-1">Workspaces</h5>
              <p className="text-muted small mb-3">
                {usage?.workspaces?.limit === 'Unlimited' 
                  ? 'Unlimited workspaces' 
                  : `${usage?.workspaces?.remaining} remaining`}
              </p>
              
              <div className="progress mb-2" style={{ height: '8px' }}>
                <div 
                  className={`progress-bar ${getProgressColor(usage?.workspaces?.used, usage?.workspaces?.limit)}`}
                  style={{ width: `${getProgressPercentage(usage?.workspaces?.used, usage?.workspaces?.limit)}%` }}
                />
              </div>
              
              <div className="d-flex justify-content-between small">
                <span className="text-muted">Used</span>
                <span className="fw-semibold">{usage?.workspaces?.used}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Card */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="bg-success bg-opacity-10 p-3 rounded-3">
                  <FiCheckSquare className="text-success" size={24} />
                </div>
                <span className={`badge bg-${usage?.projects?.limit === 'Unlimited' ? 'info' : 
                  (usage?.projects?.used >= usage?.projects?.limit ? 'danger' : 'success')} bg-opacity-10 text-dark px-3 py-2`}>
                  {getStatusIcon(usage?.projects?.used, usage?.projects?.limit)}
                  <span className="ms-1">
                    {usage?.projects?.used}/{formatNumber(usage?.projects?.limit)}
                  </span>
                </span>
              </div>
              
              <h5 className="fw-bold mb-1">Projects</h5>
              <p className="text-muted small mb-3">
                {usage?.projects?.limit === 'Unlimited' 
                  ? 'Unlimited projects' 
                  : `${usage?.projects?.remaining} remaining`}
              </p>
              
              <div className="progress mb-2" style={{ height: '8px' }}>
                <div 
                  className={`progress-bar ${getProgressColor(usage?.projects?.used, usage?.projects?.limit)}`}
                  style={{ width: `${getProgressPercentage(usage?.projects?.used, usage?.projects?.limit)}%` }}
                />
              </div>
              
              <div className="d-flex justify-content-between small">
                <span className="text-muted">Used</span>
                <span className="fw-semibold">{usage?.projects?.used}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Approvals Card */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="bg-warning bg-opacity-10 p-3 rounded-3">
                  <FiTrendingUp className="text-warning" size={24} />
                </div>
                <span className={`badge bg-${usage?.approvals?.limit === 'Unlimited' ? 'info' : 
                  (usage?.approvals?.used >= usage?.approvals?.limit ? 'danger' : 'success')} bg-opacity-10 text-dark px-3 py-2`}>
                  {getStatusIcon(usage?.approvals?.used, usage?.approvals?.limit)}
                  <span className="ms-1">
                    {usage?.approvals?.used}/{formatNumber(usage?.approvals?.limit)}
                  </span>
                </span>
              </div>
              
              <h5 className="fw-bold mb-1">Approvals (Monthly)</h5>
              <p className="text-muted small mb-3">
                {usage?.approvals?.limit === 'Unlimited' 
                  ? 'Unlimited approvals' 
                  : `${usage?.approvals?.remaining} remaining this month`}
              </p>
              
              <div className="progress mb-2" style={{ height: '8px' }}>
                <div 
                  className={`progress-bar ${getProgressColor(usage?.approvals?.used, usage?.approvals?.limit)}`}
                  style={{ width: `${getProgressPercentage(usage?.approvals?.used, usage?.approvals?.limit)}%` }}
                />
              </div>
              
              <div className="d-flex justify-content-between small">
                <span className="text-muted">Used this month</span>
                <span className="fw-semibold">{usage?.approvals?.used}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Resource Breakdown</h5>
                <div className="d-flex gap-2">
                  <select 
                    className="form-select form-select-sm"
                    style={{ width: '150px' }}
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <option value="month">This Month</option>
                    <option value="quarter">Last 3 Months</option>
                    <option value="year">Last 12 Months</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Resource</th>
                      <th>Used</th>
                      <th>Limit</th>
                      <th>Remaining</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <FiFolder className="text-primary me-2" />
                          <span className="fw-semibold">Workspaces</span>
                        </div>
                      </td>
                      <td>{usage?.workspaces?.used}</td>
                      <td>{formatNumber(usage?.workspaces?.limit)}</td>
                      <td className="fw-semibold">{formatNumber(usage?.workspaces?.remaining)}</td>
                      <td>
                        {usage?.workspaces?.limit !== 'Unlimited' && 
                         usage?.workspaces?.used >= usage?.workspaces?.limit ? (
                          <span className="badge bg-danger">Limit Reached</span>
                        ) : (
                          <span className="badge bg-success">Active</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <FiCheckSquare className="text-success me-2" />
                          <span className="fw-semibold">Projects</span>
                        </div>
                      </td>
                      <td>{usage?.projects?.used}</td>
                      <td>{formatNumber(usage?.projects?.limit)}</td>
                      <td className="fw-semibold">{formatNumber(usage?.projects?.remaining)}</td>
                      <td>
                        {usage?.projects?.limit !== 'Unlimited' && 
                         usage?.projects?.used >= usage?.projects?.limit ? (
                          <span className="badge bg-danger">Limit Reached</span>
                        ) : (
                          <span className="badge bg-success">Active</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <FiTrendingUp className="text-warning me-2" />
                          <span className="fw-semibold">Approvals (Monthly)</span>
                        </div>
                      </td>
                      <td>{usage?.approvals?.used}</td>
                      <td>{formatNumber(usage?.approvals?.limit)}</td>
                      <td className="fw-semibold">{formatNumber(usage?.approvals?.remaining)}</td>
                      <td>
                        {usage?.approvals?.limit !== 'Unlimited' && 
                         usage?.approvals?.used >= usage?.approvals?.limit ? (
                          <span className="badge bg-danger">Limit Reached</span>
                        ) : (
                          <span className="badge bg-success">Active</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade CTA for Free Users */}
      {usage?.plan === 'free' && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm bg-light">
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h5 className="fw-bold mb-2">Need more resources?</h5>
                    <p className="text-muted mb-md-0">
                      Upgrade to Pro for 20 projects, 200 approvals/month, and 40MB file uploads.
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <button 
                      className="btn btn-primary px-4"
                      onClick={() => navigate('/pricing')}
                    >
                      View Plans
                      <FiZap className="ms-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usage;