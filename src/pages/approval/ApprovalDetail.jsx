import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiCheckCircle, FiClock, FiAlertCircle, FiXCircle,
  FiEdit, FiTrash2, FiDownload, FiMessageSquare, FiCalendar,
  FiUser, FiFolder, FiLink, FiImage, FiFileText, FiSave, FiX,
  FiShare, FiMail, FiExternalLink, FiFile, FiVideo
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { approvalAPI } from '../../services/api/approval';
import magicAPI from '../../services/api/magic'; 
import AWSViewer from '../../components/modal/AWSViewer';

const ApprovalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [approval, setApproval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    deadline: '',
    link: ''
  });
  const [newComment, setNewComment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const [showShareModal, setShowShareModal] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      fetchApprovalDetails();
    }
  }, [id]);

const fetchApprovalDetails = async () => {
  try {
    setLoading(true);
    const response = await approvalAPI.getApprovalItem(id);
    
    if (response.success) {
      const approvalData = response.data;
      
      console.log('✅ Approval data:', approvalData);
      console.log('📝 Comments:', approvalData.comments);
      console.log('📸 Media:', approvalData.media);
      
      // Process comments
      const processedComments = (approvalData.comments || []).map(comment => ({
        ...comment,
        isClientComment: !comment.user && comment.userEmail,
        displayName: comment.userName || comment.userEmail || 'Client',
        formattedDate: new Date(comment.createdAt).toLocaleString()
      }));

      // Get client email from comments or updatedByClient
      let clientEmail = approvalData.clientEmail;
      
      const clientComment = processedComments.find(c => c.isClientComment);
      if (clientComment) {
        clientEmail = clientComment.userEmail;
      }
      
      if (approvalData.updatedByClient?.email) {
        clientEmail = approvalData.updatedByClient.email;
      }

      // Process media data if it exists
      let processedMedia = null;
      if (approvalData.media) {
        processedMedia = {
          ...approvalData.media,
          url: approvalData.media.url || '',
          publicId: approvalData.media.publicId || '',
          filename: approvalData.media.filename || 'Unnamed file',
          mimetype: approvalData.media.mimetype || 'application/octet-stream',
          size: approvalData.media.size || 0,
          category: approvalData.media.category || 
                   (approvalData.media.mimetype?.startsWith('image/') ? 'image' : 
                    approvalData.media.mimetype?.startsWith('video/') ? 'video' : 
                    approvalData.media.mimetype === 'application/pdf' ? 'document' : 'other'),
          uploadedAt: approvalData.media.uploadedAt ? new Date(approvalData.media.uploadedAt) : null
        };
        
        console.log('📸 Processed media:', processedMedia);
      }

      setApproval({
        ...approvalData,
        comments: processedComments,
        media: processedMedia,
        clientEmail: clientEmail,
        assignedTo: clientEmail || approvalData.assignedTo || 'Not assigned'
      });
      
      setEditForm({
        title: approvalData.title,
        description: approvalData.description || '',
        deadline: approvalData.deadline ? approvalData.deadline.split('T')[0] : '',
        link: approvalData.link || ''
      });
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to load approval');
  } finally {
    setLoading(false);
  }
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const handleDeleteFile = async () => {
  if (!approval.media?.publicId) return;
  
  if (!window.confirm('Are you sure you want to delete this file?')) return;
  
  try {
    const response = await uploadAPI.deleteFile(approval.media.publicId);
    if (response.success) {
      toast.success('File deleted');
      fetchApprovalDetails();
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    toast.error('Failed to delete file');
  }
};


  const handleUpdateApproval = async () => {
    try {
      const response = await approvalAPI.updateApprovalItem(id, editForm);
      if (response.success) {
        setApproval(response.data);
        setIsEditing(false);
        toast.success('Approval updated successfully');
      } else {
        throw new Error(response.error || 'Failed to update approval');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update approval');
    }
  };

  const handleDeleteApproval = async () => {
  // Show confirmation dialog
  const hasFile = approval?.media?.key || approval?.media?.publicId;
  const confirmMessage = hasFile 
    ? `Are you sure you want to delete "${approval.title}"? This will also delete the associated file from AWS S3.`
    : `Are you sure you want to delete "${approval.title}"?`;

  if (!window.confirm(confirmMessage)) return;

  try {
    // If there's a file, try to delete it from AWS S3 first
    if (hasFile) {
      const fileIdentifier = approval.media?.key || approval.media?.publicId;
      try {
        await uploadAPI.deleteFile(fileIdentifier);
        console.log('✅ File deleted from AWS S3');
      } catch (fileError) {
        console.error('Failed to delete file from S3:', fileError);
        // Continue with approval deletion even if file delete fails
        toast.warning('File could not be deleted from AWS, but approval will still be removed');
      }
    }

    // Delete the approval from database
    const response = await approvalAPI.deleteApprovalItem(id);
    
    if (response.success) {
      toast.success('Approval deleted successfully');
      navigate('/approvals');
    }
  } catch (error) {
    console.error('Error deleting approval:', error);
    toast.error(error.response?.data?.error || 'Failed to delete approval');
  }
};

  const handleStatusUpdate = async (status) => {
    try {
      const response = await approvalAPI.updateApprovalStatus(id, status);
      if (response.success) {
        setApproval({...approval, status});
        toast.success(`Status updated to ${status}`);
      } else {
        throw new Error(response.error || 'Failed to update status');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleAddComment = async () => {
  if (!newComment.trim()) {
    toast.error('Comment cannot be empty');
    return;
  }

  try {
    const response = await approvalAPI.addComment(id, {
      text: newComment,
      type: 'internal' // or 'external' if from client
    });
    
    if (response.success) {
      // Refresh approval details to get updated comments
      fetchApprovalDetails();
      setNewComment('');
      toast.success('Comment added');
    }
  } catch (error) {
    toast.error(error.response?.data?.error || 'Failed to add comment');
  }
};

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FiCheckCircle className="text-success fs-4" />;
      case 'pending': return <FiClock className="text-warning fs-4" />;
      case 'changes': return <FiAlertCircle className="text-info fs-4" />;
      case 'blocked': return <FiXCircle className="text-danger fs-4" />;
      default: return <FiClock className="text-warning fs-4" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'changes': return 'info';
      case 'blocked': return 'danger';
      default: return 'secondary';
    }
  };

const getTypeIcon = (type) => {
  switch (type) {
    case 'image': return <FiImage className="text-primary" />;
    case 'video': return <FiVideo className="text-primary" />; 
    case 'document': return <FiFileText className="text-secondary" />;
    case 'link': return <FiLink className="text-info" />;
    default: return <FiFileText className="text-muted" />;
  }
};

  const handleGenerateMagicLink = async () => {
  if (!clientEmail) {
    toast.error('Please enter client email');
    return;
  }

  try {
    setSending(true);
    
    console.log('Generating magic link for:', clientEmail);
    console.log('Project ID:', approval.project._id);
    
    // Call your existing magic link API
    const response = await magicAPI.generateMagicLink(approval.project._id, clientEmail);
    
    console.log('API Response:', response);
    
    if (response.success) {
      setGeneratedLink(response.data.url);
      
      // Check if backend indicates email was sent
      if (response.data.emailSent) {
        toast.success(`✅ Magic link sent to ${clientEmail}!`);
        toast.success('Email delivered successfully');
      } else if (response.data.warning) {
        // Backend generated link but email failed
        toast.success('✅ Magic link generated!');
        toast.warning(response.data.warning);
        toast.info('Copy the link below to share manually');
      } else {
        // Default success
        toast.success('✅ Magic link generated!');
        toast.info('Copy and share the link below');
      }
      
      // Always copy to clipboard for backup
      navigator.clipboard.writeText(response.data.url);
      toast.success('📋 Link copied to clipboard');
      
    } else {
      // API returned success: false
      toast.error(response.error || 'Failed to generate link');
    }
  } catch (error) {
    console.error('❌ Error generating link:', error);
    
    // Check for specific error messages
    if (error.response?.data?.error) {
      toast.error(`Error: ${error.response.data.error}`);
      
      // If email not authorized, suggest adding client
      if (error.response.data.error.includes('not authorized')) {
        toast.info('Add client to project first in Project Settings');
      }
    } else {
      toast.error('Failed to generate link. Check console for details.');
    }
  } finally {
    setSending(false);
  }
};

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!approval) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">Approval not found</div>
        <button className="btn btn-primary" onClick={() => navigate('/approvals')}>
          Back to Approvals
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-link text-decoration-none me-3"
            onClick={() => navigate('/approvals')}
          >
            <FiArrowLeft className="me-2" />
            Back to Approvals
          </button>
          <div className="d-flex align-items-center">
            <div className="me-3">
              {getTypeIcon(approval.type)}
            </div>
            <div>
              <h1 className="h2 fw-bold mb-0">
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  />
                ) : (
                  approval.title
                )}
              </h1>
              <p className="text-muted mb-0">
                <FiFolder className="me-1" size={14} />
                {approval.project?.name || 'No Project'} • 
                Created {new Date(approval.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
<div className="d-flex flex-nowrap align-items-center gap-2">
  {/* Share Button - Primary Action */}
  <button 
    className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2"
    onClick={() => setShowShareModal(true)}
  >
    <FiShare size={16} />
    <span className="d-none d-sm-inline">Share with Client</span>
  </button>
  
  {isEditing ? (
    <>
      <button 
        className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 px-3 py-2"
        onClick={() => {
          setIsEditing(false);
          setEditForm({
            title: approval.title,
            description: approval.description || '',
            deadline: approval.deadline ? approval.deadline.split('T')[0] : '',
            link: approval.link || ''
          });
        }}
      >
        <FiX size={16} />
        <span className="d-none d-sm-inline">Cancel</span>
      </button>
      <button 
        className="btn btn-success d-inline-flex align-items-center gap-2 px-3 py-2"
        onClick={handleUpdateApproval}
      >
        <FiSave size={16} />
        <span className="d-none d-sm-inline">Save</span>
      </button>
    </>
  ) : (
    <>
      {/* Status Dropdown - Compact on mobile */}
      <div className="dropdown">
        <button 
          className={`btn btn-outline-${getStatusBadge(approval.status)} d-inline-flex align-items-center gap-1 px-3 py-2`}
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {getStatusIcon(approval.status)}
          <span className="ms-1 text-capitalize d-none d-md-inline">{approval.status}</span>
          <span className="ms-1 badge bg-${getStatusBadge(approval.status)} bg-opacity-25 d-md-none">
            {approval.status.charAt(0).toUpperCase()}
          </span>
        </button>
        <ul className="dropdown-menu dropdown-menu-end">
          <li>
            <button 
              className="dropdown-item d-flex align-items-center gap-2 py-2"
              onClick={() => handleStatusUpdate('pending')}
            >
              <FiClock className="text-warning" size={16} />
              <span>Pending</span>
            </button>
          </li>
          <li>
            <button 
              className="dropdown-item d-flex align-items-center gap-2 py-2"
              onClick={() => handleStatusUpdate('approved')}
            >
              <FiCheckCircle className="text-success" size={16} />
              <span>Approved</span>
            </button>
          </li>
          <li>
            <button 
              className="dropdown-item d-flex align-items-center gap-2 py-2"
              onClick={() => handleStatusUpdate('changes')}
            >
              <FiAlertCircle className="text-info" size={16} />
              <span>Request Changes</span>
            </button>
          </li>
          <li>
            <button 
              className="dropdown-item d-flex align-items-center gap-2 py-2"
              onClick={() => handleStatusUpdate('blocked')}
            >
              <FiXCircle className="text-danger" size={16} />
              <span>Block</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Edit Button */}
      <button 
        className="btn btn-outline-primary d-inline-flex align-items-center gap-2 px-3 py-2"
        onClick={() => setIsEditing(true)}
        title="Edit"
      >
        <FiEdit size={16} />
        <span className="d-none d-sm-inline">Edit</span>
      </button>

      {/* Delete Button */}
      <button 
        className="btn btn-outline-danger d-inline-flex align-items-center gap-2 px-3 py-2"
        onClick={() => setShowDeleteConfirm(true)}
        title="Delete"
      >
        <FiTrash2 size={16} />
        <span className="d-none d-sm-inline">Delete</span>
      </button>
    </>
  )}
</div>

</div>

      <div className="row">
        <div className="col-lg-8">
          {/* Tabs */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0 py-3">
              <ul className="nav nav-tabs border-0">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveTab('details')}
                  >
                    Details
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'comments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('comments')}
                  >
                    Comments ({approval.comments?.length || 0})
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activity')}
                  >
                    Activity Log
                  </button>
                </li>
              </ul>
            </div>
            <div className="card-body">
              {activeTab === 'details' && (
  <div>
    {/* Description */}
    <div className="mb-4">
      <h5 className="mb-3">Description</h5>
      {isEditing ? (
        <textarea
          className="form-control"
          rows="4"
          value={editForm.description}
          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
        />
      ) : (
        <p className="text-muted">
          {approval.description || 'No description provided'}
        </p>
      )}
    </div>

    {/* Link Type (only if no media) */}
    {approval.type === 'link' && !approval.media && (
      <div className="mb-4">
        <h5 className="mb-3">Link</h5>
        {isEditing ? (
          <input
            type="url"
            className="form-control"
            value={editForm.link}
            onChange={(e) => setEditForm({...editForm, link: e.target.value})}
          />
        ) : (
          <a 
            href={approval.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary"
          >
            <FiLink className="me-2" />
            {approval.link}
          </a>
        )}
      </div>
    )}

    {/* AWS Media Display */}
    {approval.media && (
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            {approval.media.category === 'image' && 'Image'}
            {approval.media.category === 'video' && 'Video'}
            {approval.media.category === 'document' && 'Document'}
          </h5>
          
        </div>

        {/* Image Display */}
        {approval.media.category === 'image' && (
          <div className="border rounded p-3">
            <div className="text-center">
              <img 
                src={approval.media.url} 
                alt={approval.media.filename}
                className="img-fluid rounded cursor-pointer"
                style={{ maxHeight: '400px', maxWidth: '100%', objectFit: 'contain' }}
                onClick={() => window.open(approval.media.url, '_blank')}
              />
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                <p className="mb-0 fw-semibold small">{approval.media.filename}</p>
                <small className="text-muted">
                  {approval.media.size ? formatFileSize(approval.media.size) : 'Unknown'}
                </small>
              </div>
              <a 
                href={approval.media.url} 
                target="_blank" 
                className="btn btn-sm btn-outline-primary"
              >
                <FiExternalLink className="me-1" /> Open
              </a>
            </div>
          </div>
        )}

        {/* Video Display */}
        {approval.media.category === 'video' && (
          <div className="border rounded p-3">
            <video controls className="w-100 rounded" style={{ maxHeight: '400px' }}>
              <source src={approval.media.url} type={approval.media.mimetype} />
            </video>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                <p className="mb-0 fw-semibold small">{approval.media.filename}</p>
                <small className="text-muted">{formatFileSize(approval.media.size)}</small>
              </div>
              <a href={approval.media.url} target="_blank" className="btn btn-sm btn-outline-primary">
                <FiExternalLink className="me-1" /> Open
              </a>
            </div>
          </div>
        )}

        {/* Document/PDF Display */}
        {approval.media.category === 'document' && (
          <div className="border rounded p-3">
            {approval.media.mimetype === 'application/pdf' ? (
              <iframe 
                src={`${approval.media.url}#toolbar=0`}
                className="w-100 rounded"
                style={{ height: '500px' }}
                title={approval.media.filename}
              />
            ) : (
              <div className="d-flex align-items-center p-3 bg-light rounded">
                <FiFile size={40} className="text-primary me-3" />
                <div>
                  <p className="mb-1 fw-semibold">{approval.media.filename}</p>
                  <small className="text-muted">{formatFileSize(approval.media.size)}</small>
                </div>
              </div>
            )}
            <div className="text-end mt-3">
              <a href={approval.media.url} target="_blank" className="btn btn-sm btn-outline-primary">
                <FiExternalLink className="me-1" /> Open Document
              </a>
            </div>
          </div>
        )}
      </div>
    )}

    {/* File Upload Section (when editing and no media) */}
    {isEditing && !approval.media && (
      <div className="mb-4">
        <h5 className="mb-3">Attach File</h5>
        <AWSUploader
  onUploadComplete={(fileData) => {
    setUploadedFile(fileData);
    setShowFileUpload(false);
    setApproval({...approval, link: ''});
  }}
  acceptedTypes={
    approval.type === 'image' ? 'image/*' : 
    approval.type === 'video' ? 'video/*' : 
    'application/pdf,image/*'
  }
  maxSize={approval.type === 'video' ? 20 * 1024 * 1024 : 10 * 1024 * 1024}
  buttonText={`Choose ${approval.type}`}
  uploadText="Upload to AWS"
/>
      </div>
    )}
    
    {/* Deadline and Assigned To Row */}
    <div className="row">
      <div className="col-md-6">
        <div className="mb-3">
          <h5 className="mb-2">Deadline</h5>
          {isEditing ? (
            <input
              type="date"
              className="form-control"
              value={editForm.deadline}
              onChange={(e) => setEditForm({...editForm, deadline: e.target.value})}
            />
          ) : approval.deadline ? (
            <div className="d-flex align-items-center">
              <FiCalendar className="me-2 text-muted" />
              {new Date(approval.deadline).toLocaleDateString()}
            </div>
          ) : (
            <span className="text-muted">No deadline set</span>
          )}
        </div>
      </div>

      {/* Assigned To section */}
      <div className="col-md-6">
        <div className="mb-3">
          <h5 className="mb-2">Assigned To</h5>
          {approval.assignedTo && approval.assignedTo !== 'Not assigned' ? (
            <div className="d-flex align-items-center">
              <FiUser className="me-2 text-muted" />
              {approval.assignedTo}
            </div>
          ) : approval.clientEmail ? (
            <div className="d-flex align-items-center">
              <FiMail className="me-2 text-primary" />
              <div>
                <div>{approval.clientEmail}</div>
                <small className="text-muted">Client</small>
              </div>
            </div>
          ) : (
            <span className="text-muted">Not assigned</span>
          )}
        </div>
      </div>
    </div>
  </div>
)}

  {activeTab === 'comments' && (
  <div>
    {/* Comment Form */}
    <div className="mb-4">
      <div className="d-flex align-items-center mb-3">
        <textarea
          className="form-control me-2"
          rows="2"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button 
          className="btn btn-primary"
          onClick={handleAddComment}
        >
          <FiMessageSquare className="me-2" />
          Comment
        </button>
      </div>
    </div>

    {/* Comments List */}
    {approval.comments && approval.comments.length > 0 ? (
      <div className="comments-list">
        {approval.comments.map((comment, index) => (
          <div key={index} className="border-bottom pb-3 mb-3">
            <div className="d-flex">
              {/* Avatar */}
              <div className={`rounded-circle p-2 me-3 ${
                comment.isClientComment ? 'bg-info bg-opacity-10' : 'bg-light'
              }`}>
                {comment.isClientComment ? (
                  <FiMail className="text-info" size={16} />
                ) : (
                  <FiUser size={16} />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-grow-1">
                <div className="d-flex align-items-center mb-1">
                  <span className="fw-bold me-2">
                    {comment.displayName}
                  </span>
                  
                  {comment.isClientComment && (
                    <span className="badge bg-info me-2">Client</span>
                  )}
                  
                  {!comment.internal && !comment.isClientComment && (
                    <span className="badge bg-secondary me-2">Internal</span>
                  )}
                  
                  <small className="text-muted">
                    {comment.formattedDate}
                  </small>
                </div>
                
                <p className="mb-0">{comment.text}</p>
                
                {comment.isClientComment && comment.userEmail && (
                  <small className="text-muted d-block mt-1">
                    From: {comment.userEmail}
                  </small>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-4">
        <FiMessageSquare size={48} className="text-muted mb-3" />
        <h5>No comments yet</h5>
        <p className="text-muted">Be the first to comment</p>
      </div>
    )}
  </div>
)}

              {activeTab === 'activity' && (
                <div>
                  {approval.activityLog && approval.activityLog.length > 0 ? (
                    <div className="timeline">
                      {approval.activityLog.map((activity, index) => (
                        <div key={index} className="timeline-item mb-3">
                          <div className="d-flex">
                            <div className="timeline-marker bg-primary rounded-circle me-3"></div>
                            <div>
                              <div className="fw-bold">{activity.action}</div>
                              <small className="text-muted">
                                By {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                              </small>
                              {activity.details && (
                                <div className="mt-1">
                                  <small className="text-muted">{activity.details}</small>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FiClock size={48} className="text-muted mb-3" />
                      <h5>No activity yet</h5>
                      <p className="text-muted">Activity log will appear here</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h6 className="mb-3">Approval Information</h6>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Approval ID</small>
                <code className="small">{approval._id}</code>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Type</small>
                <div className="d-flex align-items-center">
                  {getTypeIcon(approval.type)}
                  <span className="ms-2 text-capitalize">{approval.type}</span>
                </div>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Current Status</small>
                <div className="d-flex align-items-center">
                  {getStatusIcon(approval.status)}
                  <span className={`badge bg-${getStatusBadge(approval.status)} ms-2`}>
                    {approval.status}
                  </span>
                </div>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Created By</small>
                <div className="d-flex align-items-center">
                  <FiUser className="me-2 text-muted" />
                  {approval.createdBy?.name || 'Unknown'}
                </div>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Last Updated</small>
                <div>{new Date(approval.updatedAt).toLocaleDateString()}</div>
              </div>
              {approval.project && (
                <div className="mt-4 pt-3 border-top">
                  <Link 
                    to={`/projects/${approval.project._id}`}
                    className="btn btn-outline-secondary w-100"
                  >
                    <FiFolder className="me-2" />
                    View Project
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-0">
                  <h5 className="modal-title text-danger">Delete Approval</h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setShowDeleteConfirm(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete approval <strong>"{approval.title}"</strong>?</p>
                  <p className="text-danger small mb-0">
                    This action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer border-0">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={handleDeleteApproval}
                  >
                    Delete Approval
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-0">
                  <h5 className="modal-title">Share with Client</h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => {
                      setShowShareModal(false);
                      setClientEmail('');
                      setGeneratedLink('');
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Client Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                    />
                    <small className="text-muted">
                      The client must be added to the project first.
                    </small>
                  </div>
                  
                  {generatedLink && (
                    <div className="mb-3">
                      <label className="form-label">Magic Link</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          value={generatedLink}
                          readOnly
                        />
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedLink);
                            toast.success('Link copied!');
                          }}
                        >
                          Copy
                        </button>
                      </div>
                      <small className="text-muted">
                        Send this link to your client. It expires in 7 days.
                      </small>
                    </div>
                  )}
                </div>
                <div className="modal-footer border-0">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setShowShareModal(false);
                      setClientEmail('');
                      setGeneratedLink('');
                    }}
                  >
                    Close
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleGenerateMagicLink}
                    disabled={!clientEmail || sending}
                  >
                    {sending ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Generating...
                      </>
                    ) : (
                      'Generate Link'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ApprovalDetailPage;