import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiCheckCircle, FiClock, FiAlertCircle, FiXCircle,
  FiFileText, FiImage, FiLink, FiMessageSquare,
  FiSend, FiExternalLink, FiMail, FiCalendar,
  FiUser, FiBriefcase, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import magicAPI from '../../services/api/magic';

const ClientPortal = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [clientInfo, setClientInfo] = useState(null);
  const [magicLinkInfo, setMagicLinkInfo] = useState(null);
  
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    if (token) {
      validateAndLoadData();
    }
  }, [token]);

  const validateAndLoadData = async () => {
    try {
      setValidating(true);
      
      // First validate the token
      const validateRes = await magicAPI.validateMagicLink(token);
      
      if (!validateRes.success) {
        setError(validateRes.error || 'Invalid or expired link');
        setValidating(false);
        setLoading(false);
        return;
      }
      
      // Get project and approvals data
      const accessRes = await magicAPI.getAccessViaMagicLink(token);
      
      if (accessRes.success) {
        setProjectData(accessRes.data.project);
        setApprovals(accessRes.data.approvals || []);
        setClientInfo(accessRes.data.client);
        setMagicLinkInfo(accessRes.data.magicLink);
        
        // Auto-select first approval if none selected
        if (accessRes.data.approvals?.length > 0 && !selectedApproval) {
          setSelectedApproval(accessRes.data.approvals[0]);
        }
      }
      
    } catch (error) {
      console.error('Error loading portal data:', error);
      setError('Failed to load review data');
    } finally {
      setValidating(false);
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FiCheckCircle className="text-success" size={20} />;
      case 'pending': return <FiClock className="text-warning" size={20} />;
      case 'changes': return <FiAlertCircle className="text-info" size={20} />;
      case 'blocked': return <FiXCircle className="text-danger" size={20} />;
      default: return <FiClock className="text-warning" size={20} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'bg-success text-white';
      case 'pending': return 'bg-warning text-dark';
      case 'changes': return 'bg-info text-white';
      case 'blocked': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending Review';
      case 'changes': return 'Changes Requested';
      case 'blocked': return 'Blocked';
      default: return status;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'image': return <FiImage className="text-primary" size={18} />;
      case 'document': return <FiFileText className="text-secondary" size={18} />;
      case 'link': return <FiLink className="text-info" size={18} />;
      default: return <FiFileText className="text-muted" size={18} />;
    }
  };

  const handleSelectApproval = (approval) => {
    setSelectedApproval(approval);
    setSelectedStatus('');
    setComment('');
  };

  const handleSubmitDecision = async () => {
    if (!selectedStatus) {
      toast.error('Please select a decision');
      return;
    }

    if (!selectedApproval) {
      toast.error('No item selected');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await magicAPI.submitDecisionViaMagic(
        token,
        selectedApproval._id,
        selectedStatus,
        comment
      );

      if (response.success) {
        toast.success('✅ Your feedback has been submitted!');
        
        // Update the approval status in the list
        setApprovals(prev => prev.map(item => 
          item._id === selectedApproval._id 
            ? { ...item, status: selectedStatus }
            : item
        ));
        
        // Update selected approval
        setSelectedApproval(prev => ({
          ...prev,
          status: selectedStatus
        }));
        
        // Show thank you message
        toast.success('Thank you for your feedback!', {
          duration: 5000,
          icon: '🎉'
        });
        
        // Reset form
        setSelectedStatus('');
        setComment('');
      }
      
    } catch (error) {
      console.error('Error submitting decision:', error);
      toast.error(error.response?.data?.error || 'Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreviewLink = (link) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApprovals = approvals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(approvals.length / itemsPerPage);

  // Loading states
  if (validating) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Validating your access link...</h5>
          <p className="text-muted">Please wait</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Loading your review items...</h5>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="bg-danger bg-opacity-10 p-4 rounded-circle d-inline-block mb-4">
            <FiXCircle size={48} className="text-danger" />
          </div>
          <h2 className="h4 mb-3">Link Error</h2>
          <p className="text-muted mb-4">{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/'}
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-bottom">
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="h3 fw-bold mb-2">{projectData?.name}</h1>
              <p className="text-muted mb-0">{projectData?.description}</p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <div className="d-flex align-items-center justify-content-md-end">
                <FiMail className="text-muted me-2" />
                <span className="text-muted">{clientInfo?.email}</span>
              </div>
              {clientInfo?.name && (
                <div className="d-flex align-items-center justify-content-md-end mt-1">
                  <FiUser className="text-muted me-2" />
                  <span className="text-muted">{clientInfo.name}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Link Info Bar */}
          <div className="row mt-3 pt-3 border-top">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <FiCalendar className="text-muted me-2" />
                <span className="text-muted me-3">
                  Link expires in: <strong>{getDaysRemaining(magicLinkInfo?.expiresAt)} days</strong>
                </span>
                <span className="badge bg-light text-dark">
                  {magicLinkInfo?.clicks || 0} views
                </span>
              </div>
            </div>
            <div className="col-md-6 text-md-end mt-2 mt-md-0">
              <small className="text-muted">
                Workspace: {projectData?.workspace}
              </small>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-4">
        <div className="row g-4">
          {/* Left Column - Approvals List */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">Items to Review</h5>
                <small className="text-muted">{approvals.length} item(s)</small>
              </div>
              
              <div className="card-body p-0">
                {approvals.length === 0 ? (
                  <div className="text-center py-5">
                    <FiFileText size={48} className="text-muted mb-3" />
                    <h6>No items to review</h6>
                    <p className="text-muted small">All items have been reviewed</p>
                  </div>
                ) : (
                  <>
                    <div className="list-group list-group-flush">
                      {currentApprovals.map((approval) => (
                        <button
                          key={approval._id}
                          className={`list-group-item list-group-item-action p-3 border-0 border-bottom ${
                            selectedApproval?._id === approval._id ? 'active bg-primary bg-opacity-10' : ''
                          }`}
                          onClick={() => handleSelectApproval(approval)}
                        >
                          <div className="d-flex w-100 justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-1">
                                {getTypeIcon(approval.type)}
                                <h6 className="mb-0 ms-2 fw-bold">{approval.title}</h6>
                              </div>
                              <p className="small text-muted mb-2">
                                {approval.description?.substring(0, 60)}
                                {approval.description?.length > 60 ? '...' : ''}
                              </p>
                            </div>
                            {selectedApproval.media && (
      <div className="mb-4">
        <div className="d-flex align-items-center mb-3">
          <FiPaperclip className="me-2 text-muted" />
          <h6 className="mb-0">Attached File</h6>
        </div>
        <FileViewer file={selectedApproval.media} />
      </div>
    )}
                            <span className={`badge ${getStatusBadge(approval.status)} ms-2`}>
                              {getStatusIcon(approval.status)}
                              <span className="ms-1">{getStatusText(approval.status)}</span>
                            </span>
                          </div>
                          {approval.deadline && (
                            <small className="text-muted">
                              <FiCalendar size={12} className="me-1" />
                              Due: {new Date(approval.deadline).toLocaleDateString()}
                            </small>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-between align-items-center p-3">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          <FiChevronLeft /> Previous
                        </button>
                        <span className="small">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Next <FiChevronRight />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Review Panel */}
          <div className="col-lg-7">
            {selectedApproval ? (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                  <h5 className="mb-0">Review Item</h5>
                </div>
                
                <div className="card-body">
                  {/* Item Details */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      {getTypeIcon(selectedApproval.type)}
                      <h4 className="h5 mb-0 ms-2">{selectedApproval.title}</h4>
                    </div>
                    
                    <p className="text-muted mb-3">
                      {selectedApproval.description || 'No description provided'}
                    </p>
                    
                    {selectedApproval.link && (
                      <button
                        onClick={() => handlePreviewLink(selectedApproval.link)}
                        className="btn btn-outline-primary btn-sm "
                      >
                        <FiExternalLink className="me-2" />
                        Preview Content
                      </button>
                    )}
                    
                    {selectedApproval.deadline && (
                      <div className="alert alert-warning py-2 small mb-3">
                        <FiCalendar className="me-2" />
                        Deadline: {new Date(selectedApproval.deadline).toLocaleDateString()}
                      </div>
                    )}
                    
                    <div className={`badge ${getStatusBadge(selectedApproval.status)} p-2`}>
                      {getStatusIcon(selectedApproval.status)}
                      <span className="ms-2">Current Status: {getStatusText(selectedApproval.status)}</span>
                    </div>
                  </div>

                  {/* Decision Buttons */}
                  <div className="mb-4">
                    <label className="form-label fw-bold mb-3">Your Decision</label>
                    <div className="row g-2">
                      <div className="col-6 col-md-3">
                        <button
                          type="button"
                          onClick={() => setSelectedStatus('approved')}
                          className={`btn w-100 py-3 ${
                            selectedStatus === 'approved'
                              ? 'btn-success'
                              : 'btn-outline-success'
                          }`}
                        >
                          <FiCheckCircle className="me-2" />
                          Approve
                        </button>
                      </div>
                      
                      <div className="col-6 col-md-3">
                        <button
                          type="button"
                          onClick={() => setSelectedStatus('changes')}
                          className={`btn w-100 py-3 ${
                            selectedStatus === 'changes'
                              ? 'btn-info text-white'
                              : 'btn-outline-info'
                          }`}
                        >
                          <FiAlertCircle className="me-2" />
                          Changes
                        </button>
                      </div>
                      
                      <div className="col-6 col-md-3">
                        <button
                          type="button"
                          onClick={() => setSelectedStatus('blocked')}
                          className={`btn w-100 py-3 ${
                            selectedStatus === 'blocked'
                              ? 'btn-danger'
                              : 'btn-outline-danger'
                          }`}
                        >
                          <FiXCircle className="me-2" />
                          Block
                        </button>
                      </div>
                      
                      <div className="col-6 col-md-3">
                        <button
                          type="button"
                          onClick={() => setSelectedStatus('pending')}
                          className={`btn w-100 py-3 ${
                            selectedStatus === 'pending'
                              ? 'btn-warning text-dark'
                              : 'btn-outline-warning'
                          }`}
                        >
                          <FiClock className="me-2" />
                          Pending
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comment Box */}
                  <div className="mb-4">
                    <label className="form-label fw-bold mb-2">
                      Add Comment {selectedStatus && '(Optional)'}
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={
                        selectedStatus === 'approved' 
                          ? "Add any positive feedback (optional)..."
                          : selectedStatus === 'changes'
                          ? "Please describe what changes are needed..."
                          : selectedStatus === 'blocked'
                          ? "Please explain why this is blocked..."
                          : "Add your feedback or comments..."
                      }
                      disabled={!selectedStatus}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitDecision}
                    disabled={!selectedStatus || submitting}
                    className="btn btn-primary w-100 py-3"
                  >
                    {submitting ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FiSend className="me-2" />
                        Submit Decision
                      </>
                    )}
                  </button>

                  {/* Info Text */}
                  <div className="text-center mt-3">
                    <small className="text-muted">
                      Your feedback will be sent immediately to the project team.
                    </small>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <FiMessageSquare size={48} className="text-muted mb-3" />
                  <h5>Select an item to review</h5>
                  <p className="text-muted mb-0">
                    Choose an item from the list to view details and submit your decision
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-top mt-5 py-3">
        <div className="container text-center">
          <small className="text-muted">
            Powered by Decidely • Secure client review portal
          </small>
        </div>
      </footer>
    </div>
  );
};

export default ClientPortal;