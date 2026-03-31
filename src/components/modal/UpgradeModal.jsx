import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiTrendingUp, FiZap, FiAward, FiStar } from 'react-icons/fi';
import { useUsage } from '../../contexts/UsageContext';

const UpgradeModal = () => {
  const navigate = useNavigate();
  const { showUpgradeModal, setShowUpgradeModal, limitError } = useUsage();

  if (!showUpgradeModal || !limitError) return null;

  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    navigate('/pricing');
  };

  const getLimitPercentage = () => {
    if (!limitError) return 0;
    return Math.min(100, (limitError.used / limitError.total) * 100);
  };

  const getResourceName = () => {
    if (!limitError) return '';
    return limitError.type === 'workspace' ? 'workspaces' :
           limitError.type === 'project' ? 'projects' : 'approvals';
  };

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            {/* Header - Different colors based on plan */}
            <div className={`p-4 text-center ${
              limitError?.plan === 'free' ? 'bg-warning' : 'bg-primary'
            }`}>
              <div className="bg-white rounded-circle d-inline-flex p-3 mb-3">
                {limitError?.plan === 'free' ? (
                  <FiTrendingUp size={32} className="text-warning" />
                ) : (
                  <FiAward size={32} className="text-primary" />
                )}
              </div>
              <h3 className="text-white fw-bold mb-2">
                {limitError?.plan === 'free' ? 'Free Limit Reached' : 'Pro Limit Reached'}
              </h3>
              <p className="text-white opacity-90 mb-0">
                {limitError?.message}
              </p>
            </div>

            <div className="modal-body p-4">
              {/* Usage bar */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-semibold">Current {getResourceName()} usage</span>
                  <span className={`fw-bold ${
                    limitError?.plan === 'free' ? 'text-warning' : 'text-primary'
                  }`}>
                    {limitError?.used}/{limitError?.total}
                  </span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar ${
                      limitError?.plan === 'free' ? 'bg-warning' : 'bg-primary'
                    }`}
                    style={{ width: `${getLimitPercentage()}%` }}
                  />
                </div>
              </div>

              {/* Free Plan Upgrade Options */}
              {limitError?.plan === 'free' && (
                <div className="bg-light rounded-3 p-3 mb-4">
                  <h6 className="fw-bold mb-3 d-flex align-items-center">
                    <FiZap className="text-primary me-2" />
                    Upgrade to Pro and get:
                  </h6>
                  <ul className="list-unstyled">
                    <li className="mb-2 d-flex align-items-center">
                      <FiStar className="text-success me-2" size={14} />
                      <span><strong>20 projects</strong> (instead of 2)</span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <FiStar className="text-success me-2" size={14} />
                      <span><strong>200 approvals</strong> per month (instead of 20)</span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <FiStar className="text-success me-2" size={14} />
                      <span><strong>40MB file uploads</strong> (instead of 20MB)</span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <FiStar className="text-success me-2" size={14} />
                      <span><strong>Priority email support</strong></span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <FiStar className="text-success me-2" size={14} />
                      <span><strong>5 team members</strong></span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Pro Plan Upgrade Options */}
              {limitError?.plan === 'pro' && (
                <div className="bg-light rounded-3 p-3 mb-4">
                  <h6 className="fw-bold mb-3 d-flex align-items-center">
                    <FiAward className="text-primary me-2" />
                    Upgrade to Agency and get:
                  </h6>
                  <ul className="list-unstyled">
                    <li className="mb-2 d-flex align-items-center">
                      <FiStar className="text-success me-2" size={14} />
                      <span><strong>Unlimited projects</strong></span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <FiStar className="text-success me-2" size={14} />
                      <span><strong>Unlimited approvals</strong></span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <FiStar className="text-success me-2" size={14} />
                      <span><strong>60MB file uploads</strong></span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <FiStar className="text-success me-2" size={14} />
                      <span><strong>Priority support + onboarding</strong></span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <FiStar className="text-success me-2" size={14} />
                      <span><strong>Unlimited team members</strong></span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <FiStar className="text-success me-2" size={14} />
                      <span><strong>Custom branding</strong></span>
                    </li>
                  </ul>
                </div>
              )}

              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-secondary flex-grow-1"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  <FiX className="me-2" />
                  Later
                </button>
                <button 
                  className={`btn flex-grow-1 ${
                    limitError?.plan === 'free' ? 'btn-primary' : 'btn-primary'
                  }`}
                  onClick={handleUpgrade}
                >
                  {limitError?.plan === 'free' ? 'Upgrade to Pro' : 'Upgrade to Agency'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpgradeModal;