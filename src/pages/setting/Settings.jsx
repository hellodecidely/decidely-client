import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiUser, FiMail, FiBriefcase, FiSave,
  FiCamera, FiLock, FiBell, FiMoon,
  FiGlobe, FiArrowLeft, FiKey, FiShield
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api/auth';

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    company: '',
    email: ''
  });

  // State for password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        company: user.company || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!profileForm.name) {
      toast.error('Name is required');
      return;
    }

    try {
      setLoading(true);
      
      const updateData = {};
      if (profileForm.name !== user.name) updateData.name = profileForm.name;
      if (profileForm.company !== user.company) updateData.company = profileForm.company;
      
      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        setLoading(false);
        return;
      }

      const result = await updateProfile(updateData);
      
      if (result.success) {
        setProfileForm(prev => ({
          ...prev,
          name: result.user.name,
          company: result.user.company
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordForm.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setPasswordLoading(true);
    try {
      // ✅ Call change password API
      const response = await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (response.success) {
        toast.success('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Handle forgot password click - open in new tab or force navigation
  const handleForgotPassword = () => {
    // Option 1: Open in new tab
    window.open('/forgot-password', '_blank');
    
    // Option 2: Force navigation (if you want to stay in same tab)
    // navigate('/forgot-password');
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button 
          className="btn btn-link text-decoration-none me-3"
          onClick={() => navigate('/dashboard')}
        >
          <FiArrowLeft className="me-2" />
          Back to Dashboard
        </button>
        <div>
          <h1 className="h2 fw-bold mb-1">Settings</h1>
          <p className="text-muted mb-0">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 ${
                    activeTab === 'profile' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  <FiUser />
                  Profile Information
                </button>
                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 ${
                    activeTab === 'security' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('security')}
                >
                  <FiLock />
                  Security
                </button>
                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 ${
                    activeTab === 'notifications' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <FiBell />
                  Notifications
                </button>
                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 ${
                    activeTab === 'preferences' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('preferences')}
                >
                  <FiGlobe />
                  Preferences
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="col-md-9">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate}>
                  <h5 className="mb-4">Profile Information</h5>
                  
                  {/* Avatar */}
                  <div className="mb-4 text-center">
                    <div className="position-relative d-inline-block">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto" 
                           style={{ width: '100px', height: '100px', fontSize: '36px' }}>
                        {profileForm.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label">Full Name *</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FiUser className="text-secondary" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={profileForm.name}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FiMail className="text-secondary" />
                        </span>
                        <input
                          type="email"
                          className="form-control bg-light"
                          value={profileForm.email}
                          readOnly
                          disabled
                        />
                      </div>
                      <small className="text-muted">Email cannot be changed</small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Company</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FiBriefcase className="text-secondary" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          name="company"
                          value={profileForm.company}
                          onChange={handleInputChange}
                          placeholder="Your Company"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave className="me-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'security' && (
                <div>
                  <h5 className="mb-4">Security Settings</h5>
                  
                  {/* Change Password Section */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <FiKey className="text-primary" />
                      <h6 className="mb-0">Change Password</h6>
                    </div>
                    
                    <form onSubmit={handlePasswordChange}>
                      <div className="row g-3">
                        <div className="col-md-12">
                          <label className="form-label">Current Password</label>
                          <input
                            type="password"
                            className="form-control"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordInputChange}
                            placeholder="Enter current password"
                            required
                          />
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label">New Password</label>
                          <input
                            type="password"
                            className="form-control"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordInputChange}
                            placeholder="Enter new password"
                            required
                          />
                          <small className="text-muted">Minimum 6 characters</small>
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label">Confirm New Password</label>
                          <input
                            type="password"
                            className="form-control"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordInputChange}
                            placeholder="Confirm new password"
                            required
                          />
                        </div>
                        
                        <div className="col-12">
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={passwordLoading}
                          >
                            {passwordLoading ? (
                              <>
                                <div className="spinner-border spinner-border-sm me-2" role="status" />
                                Changing Password...
                              </>
                            ) : (
                              <>
                                <FiLock className="me-2" />
                                Change Password
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Divider */}
                  <hr className="my-4" />

                  {/* Forgot Password Link */}
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <FiShield className="text-warning" />
                      <h6 className="mb-0">Forgot Password?</h6>
                    </div>
                    
                    <div className="bg-light rounded-3 p-4">
                      <p className="text-muted mb-3">
                        If you've forgotten your password, you can request a password reset link.
                      </p>
                      {/* ✅ Use onClick to navigate */}
                      <button 
                        onClick={handleForgotPassword}
                        className="btn btn-outline-primary"
                      >
                        <FiMail className="me-2" />
                        Send Reset Link
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="text-center py-5">
                  <FiBell size={48} className="text-muted mb-3" />
                  <h5>Notification Preferences</h5>
                  <p className="text-muted">Coming soon...</p>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="text-center py-5">
                  <FiGlobe size={48} className="text-muted mb-3" />
                  <h5>Preferences</h5>
                  <p className="text-muted">Coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;