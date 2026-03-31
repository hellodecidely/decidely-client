import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiFolder, FiUsers, FiCalendar, FiCheckCircle, 
  FiClock, FiFileText, FiSettings, FiPlus, FiMail,
  FiMessageSquare, FiEdit, FiTrash2, FiSave, FiX,
  FiEye, FiAlertCircle, FiXCircle, FiImage, FiLink,
  FiExternalLink, FiUser, FiPaperclip, FiFile, FiVideo
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { projectAPI } from '../../services/api/project';
import { workspaceAPI } from '../../services/api/workspace';
import { approvalAPI } from '../../services/api/approval';
import clientAPI from '../../services/api/client';
import AWSUploader from '../../components/modal/AWSUploader';
import { useAuth } from '../../contexts/AuthContext';
import uploadAPI from '../../services/api/upload';

const ProjectDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [showCreateApprovalModal, setShowCreateApprovalModal] = useState(false);
  const [projectApprovals, setProjectApprovals] = useState([]);
  const [newApproval, setNewApproval] = useState({
    title: '',
    description: '',
    type: 'text',
    link: '',
    deadline: ''
  });

  
  // ADDED THESE 3 STATE VARIABLES FOR EDIT APPROVAL MODAL
  const [showEditApprovalModal, setShowEditApprovalModal] = useState(false);
  const [editingApproval, setEditingApproval] = useState(null);
  const [approvalEditForm, setApprovalEditForm] = useState({
    title: '',
    description: '',
    type: 'text',
    link: '',
    deadline: '',
    status: 'pending'
  });

  // Add these state variables at the top with your other states (around line 30-40)
const [showAddClientModal, setShowAddClientModal] = useState(false);
const [newClient, setNewClient] = useState({
  email: '',
  name: '',
  company: '',
  sendInvitation: true
});
const [addingClient, setAddingClient] = useState(false);
const [projectClients, setProjectClients] = useState([]);


const [uploadedFile, setUploadedFile] = useState(null);
const [showFileUpload, setShowFileUpload] = useState(false);
const [creating, setCreating] = useState(false);

const [isUploading, setIsUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
const [uploadXHR, setUploadXHR] = useState(null);

const { user, getMaxFileSize, limits } = useAuth();

// Add this function to fetch project clients
const fetchProjectClients = async () => {
  try {
    console.log('Fetching clients for project:', id);
    const response = await clientAPI.getProjectClients(id);
    if (response.success) {
      console.log('Clients fetched:', response.data);
      setProjectClients(response.data);
    } else {
      console.error('Failed to fetch clients:', response.error);
    }
  } catch (error) {
    console.error('Error fetching clients:', error);
    if (error.response?.status === 403) {
      console.log('Permission denied - user may not have access to this project');
    }
  }
};

// Add this function to handle adding client
const handleAddClient = async () => {
  if (!newClient.email) {
    toast.error('Email is required');
    return;
  }

  try {
    setAddingClient(true);
    console.log('Adding client to project:', id);
    console.log('Client data:', newClient);
    
    const response = await clientAPI.addClient(id, newClient);
    
    console.log('Add client response:', response);
    
    if (response.success) {
      toast.success(response.data.message || 'Client added successfully');
      
      if (response.data.invitationSent) {
        toast.success(`✅ Invitation email sent to ${newClient.email}`);
      } else {
        toast.info('Client added (email not sent)');
      }
      
      setShowAddClientModal(false);
      setNewClient({
        email: '',
        name: '',
        company: '',
        sendInvitation: true
      });
      
      // Refresh project data and clients
      fetchProjectDetails();
      if (typeof fetchProjectClients === 'function') {
        fetchProjectClients();
      }
    }
  } catch (error) {
    console.error('Error adding client:', error);
    
    if (error.response?.data?.error) {
      toast.error(`Error: ${error.response.data.error}`);
    } else {
      toast.error('Failed to add client');
    }
  } finally {
    setAddingClient(false);
  }
};

// Add this function to remove client
const handleRemoveClient = async (clientId, clientEmail) => {
  if (!window.confirm(`Remove ${clientEmail} from this project?`)) {
    return;
  }

  try {
    const response = await clientAPI.removeClient(id, clientId);
    if (response.success) {
      toast.success('Client removed');
      fetchProjectDetails();
      fetchProjectClients();
    }
  } catch (error) {
    console.error('Error removing client:', error);
    toast.error('Failed to remove client');
  }
};
const calculatePendingCount = () => {
  if (!projectApprovals || projectApprovals.length === 0) return 0;
  return projectApprovals.filter(approval => approval.status === 'pending').length;
};

// Call fetchProjectClients when component mounts and when project changes
useEffect(() => {
  if (id) {
    fetchProjectClients();
  }
}, [id]);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  useEffect(() => {
    if (project && activeTab === 'approvals') {
      fetchProjectApprovals();
    }
  }, [project, activeTab]);

const fetchProjectDetails = async () => {
  try {
    setLoading(true);
    const response = await projectAPI.getProject(id);
    
    if (response.success) {
      const projectData = response.data;
      setProject(projectData);
      setEditForm({
        name: projectData.name,
        description: projectData.description || '',
        status: projectData.status || 'active'
      });
      
      console.log('Project Data:', projectData);
      
      // Check different possible fields for workspace
      let workspaceId = null;
      
      if (projectData.workspaceId) {
        workspaceId = projectData.workspaceId;
      } else if (projectData.workspace) {
        if (typeof projectData.workspace === 'object') {
          setWorkspace(projectData.workspace);
          console.log('Workspace from populated field:', projectData.workspace);
        } else if (typeof projectData.workspace === 'string') {
          workspaceId = projectData.workspace;
        }
      }
      
      // If we have a workspace ID, fetch the workspace details
      if (workspaceId && !workspace) {
        console.log('Fetching workspace with ID:', workspaceId);
        try {
          // Make sure workspaceAPI.getWorkspace exists
          if (workspaceAPI.getWorkspace) {
            const workspaceRes = await workspaceAPI.getWorkspace(workspaceId);
            if (workspaceRes.success) {
              setWorkspace(workspaceRes.data);
              console.log('Workspace fetched:', workspaceRes.data);
            }
          } else {
            console.error('workspaceAPI.getWorkspace is not a function');
          }
        } catch (workspaceError) {
          console.error('Error fetching workspace:', workspaceError);
        }
      }
      
      
    } else {
      throw new Error(response.error || 'Failed to load project');
    }
  } catch (error) {
    console.error('Error fetching project details:', error);
    toast.error(error.message || 'Failed to load project');
    navigate('/projects');
  } finally {
    setLoading(false);
  }
};

  const fetchProjectApprovals = async () => {
    try {
      if (!project?._id) return;
      
      const response = await approvalAPI.getApprovalItems(project._id);
      if (response.success) {
        setProjectApprovals(response.data);
      }
    } catch (error) {
      console.error('Error fetching project approvals:', error);
    }
  };

  const handleDeleteProject = async () => {
    try {
      const response = await projectAPI.deleteProject(id);
      if (response.success) {
        toast.success('Project deleted successfully');
        navigate('/projects');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete project');
    }
  };

  const handleUpdateProject = async () => {
    try {
      const response = await projectAPI.updateProject(id, editForm);
      if (response.success) {
        setProject(response.data);
        setIsEditing(false);
        toast.success('Project updated successfully');
      } else {
        throw new Error(response.error || 'Failed to update project');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update project');
    }
  };

const handleCreateApproval = async () => {
  if (!newApproval.title) {
    toast.error('Title is required');
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
        const uploadResult = await handleUploadFile(uploadedFile.file, project._id);
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

    // Step 2: Create approval (with or without media)
    const approvalData = {
      title: newApproval.title,
      description: newApproval.description || '',
      type: mediaData ? mediaData.category : newApproval.type,
      deadline: newApproval.deadline || '',
      link: newApproval.link || '',
      media: mediaData
    };

    const response = await approvalAPI.createApprovalItem(project._id, approvalData);

    if (response.success) {
      toast.success('Approval created successfully');
      setShowCreateApprovalModal(false);
      setNewApproval({
        title: '',
        description: '',
        type: 'text',
        link: '',
        deadline: ''
      });
      setUploadedFile(null);
      setShowFileUpload(false);
      setIsUploading(false);
      setUploadProgress(0);
      fetchProjectApprovals();
      fetchProjectDetails();
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

//function to get file size limits based on user plan
// const getMaxFileSize = () => {
//   if (!user) return 10 * 1024 * 1024; // Default 10MB
  
//   const type = newApproval?.type || 'image';
  
//   switch(user.plan) {
//     case 'agency':
//       return type === 'video' ? 60 * 1024 * 1024 : 40 * 1024 * 1024;
//     case 'pro':
//       return type === 'video' ? 40 * 1024 * 1024 : 20 * 1024 * 1024;
//     case 'free':
//     default:
//       return type === 'video' ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
//   }
// };

// Add this function to handle file upload with progress
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

// Add this function to handle cancel with upload abort
const handleCancelCreate = () => {
  // Cancel any ongoing upload
  if (uploadXHR) {
    uploadXHR.abort();
    setUploadXHR(null);
  }
  
  // Reset all states
  setShowCreateApprovalModal(false);
  setUploadedFile(null);
  setShowFileUpload(false);
  setNewApproval({
    title: '',
    description: '',
    type: 'text',
    link: '',
    deadline: ''
  });
  setCreating(false);
  setIsUploading(false);
  setUploadProgress(0);
};

  // ADDED THIS FUNCTION FOR EDIT APPROVAL MODAL
  const handleOpenEditApprovalModal = (approval) => {
    setEditingApproval(approval);
    setApprovalEditForm({
      title: approval.title,
      description: approval.description || '',
      type: approval.type || 'text',
      link: approval.link || '',
      deadline: approval.deadline ? approval.deadline.split('T')[0] : '',
      status: approval.status || 'pending'
    });
    setShowEditApprovalModal(true);
  };

  // ADDED THIS FUNCTION FOR SAVING APPROVAL EDITS
  const handleUpdateApproval = async () => {
    if (!editingApproval) return;
    
    try {
      const response = await approvalAPI.updateApprovalItem(
        editingApproval._id,
        approvalEditForm
      );
      
      if (response.success) {
        toast.success('Approval updated successfully');
        setShowEditApprovalModal(false);
        setEditingApproval(null);
        fetchProjectApprovals();
        fetchProjectDetails();
      } else {
        throw new Error(response.error || 'Failed to update approval');
      }
    } catch (error) {
      console.error('Error updating approval:', error);
      toast.error(error.message || 'Failed to update approval');
    }
  };

  // ADDED THIS FUNCTION FOR VIEW WORKSPACE
  const handleViewWorkspace = () => {
    if (workspace?._id) {
      navigate(`/workspaces/${workspace._id}`);
    } else {
      toast.error('Workspace not found');
    }
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

const getTypeIcon = (type) => {
  switch (type) {
    case 'image': return <FiImage className="text-primary" />;
    case 'video': return <FiVideo className="text-primary" />; 
    case 'document': return <FiFileText className="text-secondary" />;
    case 'link': return <FiLink className="text-info" />;
    default: return <FiFileText className="text-muted" />;
  }
};

  const handleViewApproval = (approvalId) => {
    navigate(`/approvals/${approvalId}`);
  };

  // CHANGED THIS FUNCTION - REMOVED NAVIGATION
  const handleEditApproval = (approval) => {
    // Now opens modal instead of navigating
    handleOpenEditApprovalModal(approval);
  };

  const calculateProgress = () => {
  if (!projectApprovals || projectApprovals.length === 0) return 0;
  const approved = projectApprovals.filter(a => a.status === 'approved').length;
  return Math.round((approved / projectApprovals.length) * 100);
};

const getApprovalStatusBadge = (status) => {
  switch (status) {
    case 'approved': return 'success';
    case 'pending': return 'warning';
    case 'changes': return 'info';
    case 'blocked': return 'danger';
    default: return 'secondary';
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

  if (!project) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">Project not found</div>
        <button className="btn btn-primary" onClick={() => navigate('/projects')}>
          Back to Projects
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
            onClick={() => navigate('/projects')}
          >
            <FiArrowLeft className="me-2" />
            Back to Projects
          </button>
          <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
              <FiFolder className="text-primary fs-4" />
            </div>
            <div>
              <h1 className="h2 fw-bold mb-0">
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                ) : (
                  project.name
                )}
              </h1>
              <p className="text-muted mb-0">
                {workspace?.name || 'No workspace'} • Created on {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        {isEditing ? (
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-secondary"
              onClick={() => {
                setIsEditing(false);
                setEditForm({
                  name: project.name,
                  description: project.description || '',
                  status: project.status || 'active'
                });
              }}
            >
              <FiX className="me-2" />
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleUpdateProject}
            >
              <FiSave className="me-2" />
              Save Changes
            </button>
          </div>
        ) : (
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateApprovalModal(true)}
          >
            <FiPlus className="me-2" />
            New Approval
          </button>
        )}
      </div>

      {/* Stats Cards - Simplified */}
<div className="row g-4 mb-4">
  <div className="col-md-3">
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="bg-light p-3 rounded me-3">
            <FiUsers className="text-secondary fs-4" />
          </div>
          <div>
            <h2 className="mb-0 fw-bold">{projectClients?.length || 0}</h2>
            <p className="text-muted mb-0">Clients</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="bg-light p-3 rounded me-3">
            <FiClock className="text-secondary fs-4" />
          </div>
          <div>
            <h2 className="mb-0 fw-bold">
              {projectApprovals?.filter(a => a.status === 'pending').length || 0}
            </h2>
            <p className="text-muted mb-0">Pending</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="bg-light p-3 rounded me-3">
            <FiCheckCircle className="text-secondary fs-4" />
          </div>
          <div>
            <h2 className="mb-0 fw-bold">
              {projectApprovals?.filter(a => a.status === 'approved').length || 0}
            </h2>
            <p className="text-muted mb-0">Approved</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="bg-light p-3 rounded me-3">
            <FiFileText className="text-secondary fs-4" />
          </div>
          <div>
            <h2 className="mb-0 fw-bold">{projectApprovals?.length || 0}</h2>
            <p className="text-muted mb-0">Total Items</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


      {/* Main Content */}
      <div className="row">
        <div className="col-md-8">
          {/* Tabs */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0 py-3">
              <ul className="nav nav-tabs border-0">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'approvals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('approvals')}
                  >
                    Approvals
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'clients' ? 'active' : ''}`}
                    onClick={() => setActiveTab('clients')}
                  >
                    Clients
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <FiSettings className="me-1" /> Settings
                  </button>
                </li>
              </ul>
            </div>
            <div className="card-body">
              {activeTab === 'overview' && (
                <div>
                  <h5 className="mb-3">Project Description</h5>
                  <p className="text-muted mb-4">
                    {project.description || 'No description provided for this project.'}
                  </p>
                  
                  <div className="mb-4">
                    <h5 className="mb-3">Progress</h5>
                    <div className="progress mb-2" style={{height: '10px'}}>
                      <div 
                        className="progress-bar" 
                        style={{width: `${calculateProgress()}%`}}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Overall Progress</span>
                      <span className="fw-bold">{calculateProgress()}%</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'approvals' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0">Project Approvals</h5>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowCreateApprovalModal(true)}
                    >
                      <FiPlus className="me-1" /> Create Approval
                    </button>
                  </div>
                  
                  {projectApprovals.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Deadline</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projectApprovals.map(approval => (
                            <tr key={approval._id}>
                              <td>
                                <div className="fw-bold">{approval.title}</div>
                                <small className="text-muted">
                                  {approval.description ? (approval.description.length > 50 ? `${approval.description.substring(0, 50)}...` : approval.description) : 'No description'}
                                </small>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  {getTypeIcon(approval.type)}
                                  <span className="ms-2 text-capitalize">{approval.type}</span>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  {getStatusIcon(approval.status)}
                                  <span className={`badge bg-${getApprovalStatusBadge(approval.status)} ms-2`}>
                                    {approval.status}
                                  </span>
                                </div>
                              </td>
                              <td>
                                {new Date(approval.createdAt).toLocaleDateString()}
                              </td>
                              <td>
                                {approval.deadline ? (
                                  new Date(approval.deadline).toLocaleDateString()
                                ) : (
                                  <span className="text-muted">No deadline</span>
                                )}
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleViewApproval(approval._id)}
                                  >
                                    <FiEye size={14} />
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handleEditApproval(approval)}  // This now opens modal
                                  >
                                    <FiEdit size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <FiFileText size={48} className="text-muted mb-3" />
                      <h5>No approvals yet</h5>
                      <p className="text-muted mb-4">Create your first approval item for this project</p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowCreateApprovalModal(true)}
                      >
                        <FiPlus className="me-2" />
                        Create Approval
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'clients' && (
  <div>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h5 className="mb-0">Project Clients</h5>
      <button 
        className="btn btn-primary btn-sm"
        onClick={() => setShowAddClientModal(true)}
      >
        <FiPlus className="me-1" /> Add Client
      </button>
    </div>
    
    {projectClients && projectClients.length > 0 ? (
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Client</th>
              <th>Email</th>
              <th>Company</th>
              <th>Added</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projectClients.map((client) => (
              <tr key={client._id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                      <FiUser className="text-primary" />
                    </div>
                    <div className="fw-bold">{client.name || '—'}</div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <FiMail className="me-2 text-muted" size={14} />
                    {client.email}
                  </div>
                </td>
                <td>{client.company || '—'}</td>
                <td>{new Date(client.addedAt).toLocaleDateString()}</td>
                <td>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemoveClient(client._id, client.email)}
                      title="Remove Client"
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
    ) : (
      <div className="text-center py-5">
        <FiUsers size={48} className="text-muted mb-3" />
        <h5>No clients added</h5>
        <p className="text-muted mb-4">Add clients to this project to start sharing approvals</p>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddClientModal(true)}
        >
          <FiPlus className="me-2" />
          Add Client
        </button>
      </div>
    )}
  </div>
)}


              {activeTab === 'settings' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0">Project Settings</h5>
                    <div className="d-flex gap-2">
                      {!isEditing ? (
                        <>
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setIsEditing(true)}
                          >
                            <FiEdit className="me-1" /> Edit
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => setShowDeleteConfirm(true)}
                          >
                            <FiTrash2 className="me-1" /> Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => {
                              setIsEditing(false);
                              setEditForm({
                                name: project.name,
                                description: project.description || '',
                                status: project.status || 'active'
                              });
                            }}
                          >
                            <FiX className="me-1" /> Cancel
                          </button>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={handleUpdateProject}
                          >
                            <FiSave className="me-1" /> Save
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Project Name</label>
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="form-control" 
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          />
                        ) : (
                          <input type="text" className="form-control" value={project.name} readOnly />
                        )}
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        {isEditing ? (
                          <textarea 
                            className="form-control" 
                            rows="3" 
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          />
                        ) : (
                          <textarea className="form-control" rows="3" value={project.description || ''} readOnly />
                        )}
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        {isEditing ? (
                          <select 
                            className="form-select"
                            value={editForm.status}
                            onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                          >
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="completed">Completed</option>
                          </select>
                        ) : (
                          <div>
                            <span className={`badge bg-${project.status === 'active' ? 'success' : 'secondary'}`}>
                              {project.status || 'active'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Workspace</label>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <FiFolder className="me-2 text-muted" />
                            {workspace?.name || 'No workspace'}
                          </div>
                          {workspace?._id && (
                            <button 
                              className="btn btn-link btn-sm text-decoration-none p-0"
                              onClick={handleViewWorkspace}
                              title="View Workspace"
                            >
                              <FiExternalLink size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Created</label>
                        <div className="d-flex align-items-center">
                          <FiCalendar className="me-2 text-muted" />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">Project Details</h6>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Project ID</small>
                <code className="small">{project._id}</code>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Workspace</small>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <FiFolder className="me-2 text-primary" size={16} />
                    {workspace?.name || 'No workspace'}
                  </div>
                  {workspace?._id && (
                    <button 
                      className="btn btn-link btn-sm text-decoration-none p-0"
                      onClick={handleViewWorkspace}
                      title="View Workspace"
                    >
                      <FiExternalLink size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Last Updated</small>
                <div>{new Date(project.updatedAt).toLocaleDateString()}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Total Items</small>
                <div>{projectApprovals?.length || 0} approval items</div>
              </div>
              <div className="mt-4 pt-3 border-top">
                <button 
                  className="btn btn-primary w-100 mb-2"
                  onClick={() => setShowCreateApprovalModal(true)}
                >
                  <FiPlus className="me-2" />
                  Create Approval
                </button>
                
                {/* ADDED VIEW WORKSPACE BUTTON */}
                {workspace?._id && (
                  <button 
                    className="btn btn-outline-primary w-100"
                    onClick={handleViewWorkspace}
                  >
                    <FiFolder className="me-2" />
                    View Workspace
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

{showCreateApprovalModal && (
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
              
              style={{ opacity: (creating || isUploading) ? 0.5 : 1 }}
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

            {/* Type and Deadline Row */}
            <div className="row g-3">
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
              <div className="col-md-6">
                <label className="form-label">Deadline (Optional)</label>
                <input
                  type="date"
                  className="form-control"
                  value={newApproval.deadline}
                  onChange={(e) => setNewApproval({...newApproval, deadline: e.target.value})}
                />
              </div>
            </div>

            {/* Link URL Section - Shows for link type or when no file */}
            {(newApproval.type === 'link' || (newApproval.type !== 'text' && !uploadedFile)) && (
              <div className="mt-3">
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
                    disabled={creating || isUploading}
                  >
                    <FiPaperclip className="me-1" />
                    {showFileUpload ? 'Hide' : 'Choose File'}
                  </button>
                </div>
                
                {showFileUpload && !uploadedFile && (
  <AWSUploader
    onFileSelect={setUploadedFile}
    onFileRemove={() => setUploadedFile(null)}
    acceptedTypes={
      newApproval.type === 'image' ? 'image/*' : 
      newApproval.type === 'video' ? 'video/*' : 
      'application/pdf,image/*'
    }
    maxSize={getMaxFileSize()}  // ← Use from context
    buttonText={`Choose ${newApproval.type}`}
    selectedFile={uploadedFile?.file}
    disabled={creating || isUploading}
  />
)}

                {/* Show selected file info */}
                {uploadedFile && (
                  <div className="border rounded p-2 mt-2 bg-light">
                    <div className="d-flex align-items-center">
                      {uploadedFile.category === 'image' ? (
                        <img 
                          src={uploadedFile.url} 
                          alt="thumbnail" 
                          className="rounded me-2"
                          style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                        />
                      ) : uploadedFile.category === 'video' ? (
                        <FiVideo className="me-2 text-primary" size={24} />
                      ) : (
                        <FiFile className="me-2 text-primary" />
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
                        disabled={creating || isUploading}
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

{/* Plan Limits Display */}
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

      {/* ADDED EDIT APPROVAL MODAL */}
      {showEditApprovalModal && editingApproval && (
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
                setShowEditApprovalModal(false);
                setEditingApproval(null);
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
                value={approvalEditForm.title}
                onChange={(e) => setApprovalEditForm({...approvalEditForm, title: e.target.value})}
                placeholder="Enter approval title"
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={approvalEditForm.description}
                onChange={(e) => setApprovalEditForm({...approvalEditForm, description: e.target.value})}
                placeholder="Enter description"
              />
            </div>

            <div className="row g-3">
              {/* Type - Shows original type, cannot be changed */}
              <div className="col-md-6">
                <label className="form-label">Type</label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    {editingApproval.type === 'image' && <FiImage />}
                    {editingApproval.type === 'video' && <FiVideo />}
                    {editingApproval.type === 'document' && <FiFileText />}
                    {editingApproval.type === 'link' && <FiLink />}
                    {editingApproval.type === 'text' && <FiFileText />}
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={editingApproval.type.charAt(0).toUpperCase() + editingApproval.type.slice(1)}
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
                  value={approvalEditForm.status}
                  onChange={(e) => setApprovalEditForm({...approvalEditForm, status: e.target.value})}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="changes">Changes Requested</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            {/* Show current file if exists (read-only) */}
            {editingApproval.media && (
              <div className="mt-3">
                <label className="form-label">Current Attachment</label>
                <div className="border rounded p-2 bg-light">
                  <div className="d-flex align-items-center">
                    {editingApproval.media.category === 'image' ? (
                      <FiImage className="me-2 text-primary" />
                    ) : editingApproval.media.category === 'video' ? (
                      <FiVideo className="me-2 text-primary" />
                    ) : (
                      <FiFile className="me-2 text-primary" />
                    )}
                    <div className="flex-grow-1">
                      <small className="fw-semibold d-block">{editingApproval.media.filename}</small>
                      <small className="text-muted">
                        Uploaded to AWS • {(editingApproval.media.size / 1024 / 1024).toFixed(2)}MB
                      </small>
                    </div>
                    <a 
                      href={editingApproval.media.url} 
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
            {editingApproval.type === 'link' && (
              <div className="mt-3">
                <label className="form-label">Link URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={approvalEditForm.link}
                  onChange={(e) => setApprovalEditForm({...approvalEditForm, link: e.target.value})}
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
                value={approvalEditForm.deadline}
                onChange={(e) => setApprovalEditForm({...approvalEditForm, deadline: e.target.value})}
              />
            </div>
          </div>

          <div className="modal-footer border-0">
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowEditApprovalModal(false);
                setEditingApproval(null);
              }}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleUpdateApproval}
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
      {showDeleteConfirm && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-0">
                  <h5 className="modal-title text-danger">Delete Project</h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setShowDeleteConfirm(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete project <strong>"{project.name}"</strong>?</p>
                  <p className="text-danger small mb-0">
                    <strong>Warning:</strong> This will also delete all approvals and cannot be undone.
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
                    onClick={handleDeleteProject}
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Client Modal */}
{showAddClientModal && (
  <>
    <div className="modal-backdrop fade show" />
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0">
            <h5 className="modal-title">Add Client to Project</h5>
            <button 
              type="button" 
              className="btn-close"
              onClick={() => {
                setShowAddClientModal(false);
                setNewClient({
                  email: '',
                  name: '',
                  company: '',
                  sendInvitation: true
                });
              }}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">
                Email Address <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                placeholder="client@example.com"
                required
              />
            </div>
            
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Client Name (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Company (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={newClient.company}
                  onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                  placeholder="Acme Inc."
                />
              </div>
            </div>
            
            <div className="form-check mt-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="sendInvitation"
                checked={newClient.sendInvitation}
                onChange={(e) => setNewClient({...newClient, sendInvitation: e.target.checked})}
              />
              <label className="form-check-label" htmlFor="sendInvitation">
                Send invitation email
              </label>
              <small className="text-muted d-block">
                Client will receive an email introducing them to Decidely
              </small>
            </div>
          </div>
          <div className="modal-footer border-0">
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowAddClientModal(false);
                setNewClient({
                  email: '',
                  name: '',
                  company: '',
                  sendInvitation: true
                });
              }}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleAddClient}
              disabled={!newClient.email || addingClient}
            >
              {addingClient ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  Adding...
                </>
              ) : (
                'Add Client'
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

export default ProjectDashboard;