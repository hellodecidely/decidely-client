import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiPlus, FiSearch, FiFilter, FiCheckCircle, FiClock, 
  FiAlertCircle, FiXCircle, FiEye, FiEdit, FiTrash2,
  FiFileText, FiImage, FiLink, FiDownload, FiMessageSquare,
  FiCalendar, FiUser, FiFolder, FiSave, FiX, FiPaperclip, FiFile, FiVideo, FiExternalLink
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { approvalAPI } from '../../services/api/approval';
import { projectAPI } from '../../services/api/project';
import AWSUploader from '../../components/modal/AWSUploader';
import { useAuth } from '../../contexts/AuthContext';
import uploadAPI from '../../services/api/upload';




const ApprovalsPage = () => {
  const [approvals, setApprovals] = useState([]);
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    changes: 0,
    blocked: 0
  });
  const [filters, setFilters] = useState({
    project: 'all',
    status: 'all',
    type: 'all',
    search: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Add edit modal state
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [newApproval, setNewApproval] = useState({
    title: '',
    description: '',
    type: 'text',
    file: null,
    link: '',
    deadline: '',
    projectId: '',
    assignTo: ''
  });
  const [editApproval, setEditApproval] = useState({ // Add edit state
    title: '',
    description: '',
    type: 'text',
    link: '',
    deadline: '',
    assignTo: ''
  });


const [showFileUpload, setShowFileUpload] = useState(false);
const [uploadedFile, setUploadedFile] = useState(null);
const [creating, setCreating] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadXHR, setUploadXHR] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetchProjects();
  }, []);

  useEffect(() => {
    filterApprovals();
  }, [filters, approvals]);


const { user, getMaxFileSize, limits  } = useAuth();



const handleUploadFile = async (file, projectId) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Get signed URL from backend
        const urlResponse = await uploadAPI.getUploadUrl({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        });

        if (!urlResponse.success) {
          reject(new Error(urlResponse.error || 'Failed to get upload URL'));
          return;
        }

        const { uploadUrl, publicUrl, key } = urlResponse.data;

        // Upload directly to S3 with XHR for progress tracking
        const xhr = new XMLHttpRequest();
        setUploadXHR(xhr);

        console.log('📦 Frontend - Full urlResponse:', urlResponse);
        console.log('📦 Frontend - key from response:', urlResponse.data?.key);
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ publicUrl, key });
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
          setUploadXHR(null);
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error'));
          setUploadXHR(null);
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
          setUploadXHR(null);
        });

        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleCreateApproval = async () => {
    if (!newApproval.title || !newApproval.projectId) {
      toast.error('Title and project are required');
      return;
    }

    // Validate link if type is 'link'
    if (newApproval.type === 'link' && !newApproval.link) {
      toast.error('Link URL is required for link type');
      return;
    }

    // Validate that either file or link is provided
    if ((newApproval.type === 'image' || newApproval.type === 'video' || newApproval.type === 'document') && 
        !uploadedFile && !newApproval.link) {
      toast.error('Please either upload a file or provide a link');
      return;
    }

    try {
      setCreating(true);
      setIsUploading(!!uploadedFile);
      setUploadProgress(0);

      let mediaData = null;

      // Step 1: Upload file if exists
      if (uploadedFile?.file) {
        try {
          const uploadResult = await handleUploadFile(uploadedFile.file, newApproval.projectId);
          mediaData = {
            url: uploadResult.publicUrl,
            key: uploadResult.key,
            filename: uploadedFile.file.name,
            mimetype: uploadedFile.file.type,
            size: uploadedFile.file.size,
            category: uploadedFile.category
          };
        } catch (uploadError) {
          console.error('Upload failed:', uploadError);
          toast.error('File upload failed: ' + uploadError.message);
          setCreating(false);
          setIsUploading(false);
          return;
        }
      }

      // Step 2: Create approval
      const approvalData = {
        title: newApproval.title,
        description: newApproval.description || '',
        type: mediaData ? mediaData.category : newApproval.type,
        deadline: newApproval.deadline || '',
        link: newApproval.link || '',
        media: mediaData
      };

      const response = await approvalAPI.createApprovalItem(newApproval.projectId, approvalData);

      if (response.success) {
        toast.success('Approval created successfully');
        
        // Reset everything
        setShowCreateModal(false);
        setNewApproval({
          title: '',
          description: '',
          type: 'text',
          file: null,
          link: '',
          deadline: '',
          projectId: '',
          assignTo: ''
        });
        setUploadedFile(null);
        setShowFileUpload(false);
        setIsUploading(false);
        setUploadProgress(0);
        
        // Refresh data
        fetchData();
      }
    } catch (error) {
      console.error('Error creating approval:', error);
      toast.error(error.response?.data?.error || 'Failed to create approval');
    } finally {
      setCreating(false);
      setIsUploading(false);
      setUploadXHR(null);
    }
  };

  const handleCancelCreate = () => {
    // Cancel any ongoing upload
    if (uploadXHR) {
      uploadXHR.abort();
      setUploadXHR(null);
    }
    
    // Reset all states
    setShowCreateModal(false);
    setUploadedFile(null);
    setShowFileUpload(false);
    setNewApproval({
      title: '',
      description: '',
      type: 'text',
      file: null,
      link: '',
      deadline: '',
      projectId: '',
      assignTo: ''
    });
    setCreating(false);
    setIsUploading(false);
    setUploadProgress(0);
  };

// const getMaxFileSize = () => {
//   if (!user) return 10 * 1024 * 1024; // Default 10MB
  
//   // Safely get the type - default to 'image' if not available
//   const type = newApproval?.type || 'image';
  
//   switch(user.plan) {
//     case 'agency':
//       return type === 'video' ? 60 * 1024 * 1024 : 40 * 1024 * 1024; // Video: 60MB, Others: 40MB
//     case 'pro':
//       return type === 'video' ? 40 * 1024 * 1024 : 20 * 1024 * 1024; // Video: 40MB, Others: 20MB
//     case 'free':
//     default:
//       return type === 'video' ? 20 * 1024 * 1024 : 10 * 1024 * 1024; // Video: 20MB, Others: 10MB
//   }
// };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await approvalAPI.getAllApprovals();
      if (response.success) {
        setApprovals(response.data);
        setFilteredApprovals(response.data);
        calculateStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
      toast.error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAllProjects();
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const calculateStats = (approvalList) => {
    const stats = {
      total: approvalList.length,
      pending: approvalList.filter(a => a.status === 'pending').length,
      approved: approvalList.filter(a => a.status === 'approved').length,
      changes: approvalList.filter(a => a.status === 'changes').length,
      blocked: approvalList.filter(a => a.status === 'blocked').length
    };
    setStats(stats);
  };

  const filterApprovals = () => {
    let filtered = [...approvals];

    // Filter by project
    if (filters.project !== 'all') {
      filtered = filtered.filter(a => a.project?._id === filters.project);
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(a => a.status === filters.status);
    }

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(a => a.type === filters.type);
    }

    // Filter by search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchTerm) ||
        a.description.toLowerCase().includes(searchTerm) ||
        a.project?.name.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredApprovals(filtered);
  };


const handleEditApproval = async () => {
  if (!editApproval.title) {
    toast.error('Title is required');
    return;
  }

  try {
    // First update the approval details
    const response = await approvalAPI.updateApprovalItem(selectedApproval._id, {
      title: editApproval.title,
      description: editApproval.description,
      link: editApproval.link,
      deadline: editApproval.deadline
    });

    if (response.success) {
      // Then update the status separately if it changed
      if (editApproval.status !== selectedApproval.status) {
        await approvalAPI.updateApprovalStatus(selectedApproval._id, editApproval.status);
      }
      
      toast.success('Approval updated successfully');
      setShowEditModal(false);
      setSelectedApproval(null);
      fetchData(); // Refresh the list
    }
  } catch (error) {
    console.error('Error updating approval:', error);
    toast.error('Failed to update approval');
  }
};
const handleDeleteApproval = async () => {
  if (!selectedApproval) return;

  // Show warning about file deletion
  const hasFile = selectedApproval.media?.key || selectedApproval.media?.publicId;
  const confirmMessage = hasFile 
    ? `Are you sure you want to delete "${selectedApproval.title}"? This will also delete the associated file from AWS S3.`
    : `Are you sure you want to delete "${selectedApproval.title}"?`;

  if (!window.confirm(confirmMessage)) return;

  try {
    // If there's a file, try to delete it first
    if (hasFile) {
      const fileIdentifier = selectedApproval.media?.key || selectedApproval.media?.publicId;
      try {
        await uploadAPI.deleteFile(fileIdentifier);
        console.log('✅ File deleted from AWS S3');
      } catch (fileError) {
        console.error('Failed to delete file from S3:', fileError);
        // Continue with approval deletion even if file delete fails
      }
    }

    const response = await approvalAPI.deleteApprovalItem(selectedApproval._id);
    
    if (response.success) {
      toast.success('Approval deleted successfully');
      setShowDeleteModal(false);
      setSelectedApproval(null);
      fetchData(); // Refresh the list
    }
  } catch (error) {
    console.error('Error deleting approval:', error);
    toast.error(error.response?.data?.error || 'Failed to delete approval');
  }
};

  const handleStatusUpdate = async (approvalId, status) => {
    try {
      const response = await approvalAPI.updateApprovalStatus(approvalId, status);
      if (response.success) {
        toast.success(`Status updated to ${status}`);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleEditClick = (approval) => {
    setSelectedApproval(approval);
    setEditApproval({
      title: approval.title,
      description: approval.description || '',
      type: approval.type || 'text',
      link: approval.link || '',
      deadline: approval.deadline ? approval.deadline.split('T')[0] : '',
      assignTo: approval.assignTo || '',
      status: approval.status || 'pending'
    });
    setShowEditModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FiCheckCircle className="text-success" />;
      case 'pending': return <FiClock className="text-warning" />;
      case 'changes': return <FiAlertCircle className="text-info" />;
      case 'blocked': return <FiXCircle className="text-danger" />;
      default: return <FiClock className="text-warning" />;
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
    case 'video': return <FiVideo className="text-primary" />; // ADD THIS LINE
    case 'document': return <FiFileText className="text-secondary" />;
    case 'link': return <FiLink className="text-info" />;
    default: return <FiFileText className="text-muted" />;
  }
};

  // Fix for detail page navigation - update the route
  const handleViewClick = (approval) => {
    navigate(`/approvals/${approval._id}`);
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Approvals</h1>
          <p className="text-muted mb-0">Manage client approvals across all projects</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus className="me-2" />
          New Approval
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-2 col-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-3">
              <h2 className="mb-1">{stats.total}</h2>
              <p className="text-muted mb-0 small">Total Items</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 col-6">
          <div className="card border-0 shadow-sm border-warning">
            <div className="card-body text-center py-3">
              <h2 className="mb-1">{stats.pending}</h2>
              <p className="text-muted mb-0 small">Pending</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 col-6">
          <div className="card border-0 shadow-sm border-success">
            <div className="card-body text-center py-3">
              <h2 className="mb-1">{stats.approved}</h2>
              <p className="text-muted mb-0 small">Approved</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 col-6">
          <div className="card border-0 shadow-sm border-info">
            <div className="card-body text-center py-3">
              <h2 className="mb-1">{stats.changes}</h2>
              <p className="text-muted mb-0 small">Changes</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 col-6">
          <div className="card border-0 shadow-sm border-danger">
            <div className="card-body text-center py-3">
              <h2 className="mb-1">{stats.blocked}</h2>
              <p className="text-muted mb-0 small">Blocked</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 col-6">
          <div className="card border-0 shadow-sm border-primary">
            <div className="card-body text-center py-3">
              <h2 className="mb-1">{stats.pending}</h2>
              <p className="text-muted mb-0 small">Needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text"><FiSearch /></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search approvals..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={filters.project}
                onChange={(e) => setFilters({...filters, project: e.target.value})}
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="changes">Changes</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <option value="all">All Types</option>
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="document">Document</option>
                <option value="link">Link</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Approvals List */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="text-center py-5">
              <FiFileText size={48} className="text-muted mb-3" />
              <h5>No approvals found</h5>
              <p className="text-muted mb-4">
                {filters.search || filters.status !== 'all' || filters.project !== 'all' 
                  ? 'Try changing your filters' 
                  : 'Create your first approval item'}
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <FiPlus className="me-2" />
                Create Approval
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th width="40%">Title & Description</th>
                    <th>Project</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApprovals.map(approval => (
                    <tr key={approval._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {getTypeIcon(approval.type)}
                          </div>
                          <div>
                            <div className="fw-bold">{approval.title}</div>
                            <small className="text-muted text-truncate d-block" style={{maxWidth: '300px'}}>
                              {approval.description || 'No description'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FiFolder className="me-2 text-muted" size={14} />
                          <span>{approval.project?.name || 'No Project'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {approval.type}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {getStatusIcon(approval.status)}
                          <span className={`badge bg-${getStatusBadge(approval.status)} ms-2`}>
                            {approval.status}
                          </span>
                        </div>
                      </td>
                      <td>
                        {approval.deadline ? (
                          <div className="d-flex align-items-center">
                            <FiCalendar className="me-2 text-muted" size={14} />
                            {new Date(approval.deadline).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted">No deadline</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewClick(approval)} // Fixed: Now navigates to detail page
                          >
                            <FiEye size={14} />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleEditClick(approval)} // Fixed: Opens edit modal
                          >
                            <FiEdit size={14} />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              setSelectedApproval(approval);
                              setShowDeleteModal(true);
                            }}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Approval Modal */}
{showCreateModal && (
  <>
    <div className="modal-backdrop fade show" />
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0">
            <h5 className="modal-title">Create New Approval</h5>
            <button 
              type="button" 
              className="btn-close"
              onClick={handleCancelCreate}
              style={{ opacity: (isUploading || creating) ? 0.5 : 1 }}
            ></button>
          </div>
          
          <div className="modal-body">
            {/* Title Field */}
            <div className="mb-3">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-control"
                value={newApproval.title}
                onChange={(e) => setNewApproval({...newApproval, title: e.target.value})}
                placeholder="Enter approval title"
              />
            </div>

            {/* Description Field */}
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={newApproval.description}
                onChange={(e) => setNewApproval({...newApproval, description: e.target.value})}
                placeholder="Enter description"
              />
            </div>

            {/* Project and Type Row */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Project *</label>
                <select
                  className="form-select"
                  value={newApproval.projectId}
                  onChange={(e) => setNewApproval({...newApproval, projectId: e.target.value})}
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={newApproval.type}
                  onChange={(e) => {
                    setNewApproval({
                      ...newApproval, 
                      type: e.target.value,
                      link: '',
                    });
                    setUploadedFile(null);
                    setShowFileUpload(false);
                  }}
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="link">Link</option>
                </select>
              </div>
            </div>

            {/* Link URL Section - Shows for link type or when no file */}
            {(newApproval.type === 'link' || (newApproval.type !== 'text' && !uploadedFile)) && (
              <div className="mt-3 mb-3">
                <label className="form-label">
                  {newApproval.type === 'link' ? 'Link URL *' : 'External URL (Optional)'}
                </label>
                <div className="input-group">
                  <span className="input-group-text">🔗</span>
                  <input
                    type="url"
                    className="form-control"
                    value={newApproval.link}
                    onChange={(e) => setNewApproval({...newApproval, link: e.target.value})}
                    placeholder="https://example.com"
                  />
                </div>
                {newApproval.type !== 'link' && (
                  <small className="text-muted">You can provide a URL instead of uploading a file</small>
                )}
              </div>
            )}

            {/* File Upload Section */}
            {(newApproval.type === 'image' || newApproval.type === 'document' || newApproval.type === 'video') && (
              <div className="mt-3">
                <div className="d-flex align-items-center mb-2">
                  <label className="form-label mb-0 me-2">Attach File</label>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowFileUpload(!showFileUpload)}
                  >
                    <FiPaperclip className="me-1" />
                    {showFileUpload ? 'Hide' : 'Choose File'}
                  </button>
                </div>
                
                {showFileUpload && (

                  
                  <AWSUploader
    onFileSelect={(fileData) => {
      setUploadedFile(fileData);
    }}
    onFileRemove={() => setUploadedFile(null)}
    acceptedTypes={
      newApproval.type === 'image' ? 'image/*' : 
      newApproval.type === 'video' ? 'video/*' : 
      'application/pdf,image/*'
    }
    maxSize={getMaxFileSize(newApproval.type)}  
    buttonText={`Choose ${newApproval.type}`}
    selectedFile={uploadedFile?.file}
    disabled={creating || isUploading}
  />
                )}

                {/* Show selected file info */}
                {uploadedFile && !showFileUpload && (
                  <div className="border rounded p-2 mt-2 bg-light">
                    <div className="d-flex align-items-center">
                      {uploadedFile.category === 'image' ? (
                        <FiImage className="me-2 text-primary" size={20} />
                      ) : uploadedFile.category === 'video' ? (
                        <FiVideo className="me-2 text-primary" size={20} />
                      ) : (
                        <FiFile className="me-2 text-primary" size={20} />
                      )}
                      <div className="flex-grow-1">
                        <small className="fw-semibold d-block">{uploadedFile.filename}</small>
                        <small className="text-muted">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)}MB • Ready to create
                        </small>
                      </div>
                      <button
                        className="btn btn-link text-danger p-0"
                        onClick={() => setUploadedFile(null)}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {isUploading && (
                  <div className="mt-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small">Uploading file...</span>
                      <span className="small fw-bold">{uploadProgress}%</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

{/* Plan Limits Display - Use dynamic values */}
<div className="bg-light rounded-3 p-3 mt-3">
  <h6 className="fw-semibold mb-2">📊 Your Plan Limits</h6>
  <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
    <span className="text-muted">Images/Docs:</span>
    <span className="fw-bold">{limits.imageDocSize}MB</span>
  </div>
  <div className="d-flex justify-content-between align-items-center">
    <span className="text-muted">Videos:</span>
    <span className="fw-bold">{limits.videoSize}MB</span>
  </div>
</div>
              </div>
            )}

            {/* Deadline Field */}
            <div className="mt-3">
              <label className="form-label">Deadline (Optional)</label>
              <input
                type="date"
                className="form-control"
                value={newApproval.deadline}
                onChange={(e) => setNewApproval({...newApproval, deadline: e.target.value})}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer border-0">
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={handleCancelCreate}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleCreateApproval}
              disabled={creating}
            >
              {creating ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status" />
                  {isUploading ? `Uploading ${uploadProgress}%` : 'Creating...'}
                </>
              ) : (
                'Create Approval'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
)}

      {/* Edit Approval Modal */}
      {showEditModal && selectedApproval && (
  <>
    <div className="modal-backdrop fade show" />
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0">
            <h5 className="modal-title">Edit Approval</h5>
            <button 
              type="button" 
              className="btn-close"
              onClick={() => {
                setShowEditModal(false);
                setSelectedApproval(null);
              }}
            ></button>
          </div>
          <div className="modal-body">
            {/* Title */}
            <div className="mb-3">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-control"
                value={editApproval.title}
                onChange={(e) => setEditApproval({...editApproval, title: e.target.value})}
                placeholder="Enter approval title"
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={editApproval.description}
                onChange={(e) => setEditApproval({...editApproval, description: e.target.value})}
                placeholder="Enter description"
              />
            </div>

            <div className="row g-3">
              {/* Type - Shows original type, cannot be changed */}
              <div className="col-md-6">
                <label className="form-label">Type</label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    {selectedApproval.type === 'image' && <FiImage />}
                    {selectedApproval.type === 'video' && <FiVideo />}
                    {selectedApproval.type === 'document' && <FiFileText />}
                    {selectedApproval.type === 'link' && <FiLink />}
                    {selectedApproval.type === 'text' && <FiFileText />}
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={selectedApproval.type.charAt(0).toUpperCase() + selectedApproval.type.slice(1)}
                    readOnly
                    disabled
                  />
                </div>
                <small className="text-muted">Type cannot be changed after creation</small>
              </div>

              {/* Status - Can be changed */}
              <div className="col-md-6">
  <label className="form-label">Status</label>
  <select
    className="form-select"
    value={editApproval.status}
    onChange={(e) => setEditApproval({...editApproval, status: e.target.value})}
  >
    <option value="pending">Pending</option>
    <option value="approved">Approved</option>
    <option value="changes">Changes</option>
    <option value="blocked">Blocked</option>
  </select>
</div>


            </div>

            {/* Show current file if exists (read-only) */}
            {selectedApproval.media && (
              <div className="mt-3">
                <label className="form-label">Current Attachment</label>
                <div className="border rounded p-2 bg-light">
                  <div className="d-flex align-items-center">
                    {selectedApproval.media.category === 'image' ? (
                      <FiImage className="me-2 text-primary" />
                    ) : selectedApproval.media.category === 'video' ? (
                      <FiVideo className="me-2 text-primary" />
                    ) : (
                      <FiFile className="me-2 text-primary" />
                    )}
                    <div className="flex-grow-1">
                      <small className="fw-semibold d-block">{selectedApproval.media.filename}</small>
                      <small className="text-muted">
                        Uploaded to AWS • {(selectedApproval.media.size / 1024 / 1024).toFixed(2)}MB
                      </small>
                    </div>
                    <a 
                      href={selectedApproval.media.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <FiExternalLink size={14} />
                    </a>
                  </div>
                </div>
                <small className="text-muted d-block mt-1">File cannot be changed. Delete and create new approval to upload different file.</small>
              </div>
            )}

            {/* Link URL - Only show if type is link */}
            {selectedApproval.type === 'link' && (
              <div className="mt-3">
                <label className="form-label">Link URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={editApproval.link}
                  onChange={(e) => setEditApproval({...editApproval, link: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
            )}

            {/* Deadline */}
            <div className="mt-3">
              <label className="form-label">Deadline (Optional)</label>
              <input
                type="date"
                className="form-control"
                value={editApproval.deadline}
                onChange={(e) => setEditApproval({...editApproval, deadline: e.target.value})}
              />
            </div>
          </div>

          <div className="modal-footer border-0">
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowEditModal(false);
                setSelectedApproval(null);
              }}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleEditApproval}
            >
              <FiSave className="me-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
)}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
                    onClick={() => setShowDeleteModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete approval <strong>"{selectedApproval?.title}"</strong>?</p>
                  <p className="text-danger small mb-0">
                    This action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer border-0">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => setShowDeleteModal(false)}
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
    </div>
  );
};

export default ApprovalsPage;