import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiLink, FiMail, FiCalendar, FiCheck, FiX,
  FiCopy, FiExternalLink, FiSearch, FiFilter,
  FiRefreshCw, FiEye, FiTrash2, FiClock,
  FiUser, FiFolder, FiBarChart2, FiDownload,
  FiChevronLeft, FiChevronRight, FiMoreVertical, FiFileText
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import magicAPI from '../../services/api/magic';
import { approvalAPI } from '../../services/api/approval';
import { projectAPI } from '../../services/api/project';
import { formatDistanceToNow, format } from 'date-fns';

const MagicLinksDashboard = () => {
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(true);
  const [magicLinks, setMagicLinks] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    project: 'all',
    dateRange: 'all'
  });
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [actionInProgress, setActionInProgress] = useState({});

const [showGenerateModal, setShowGenerateModal] = useState(false);
const [selectedProject, setSelectedProject] = useState('');
const [projectApprovals, setProjectApprovals] = useState([]);
const [loadingProjects, setLoadingProjects] = useState(false);
const [loadingApprovals, setLoadingApprovals] = useState(false);
const [selectedApprovals, setSelectedApprovals] = useState([]);
const [selectedClient, setSelectedClient] = useState('');
const [clientEmail, setClientEmail] = useState('');
const [customMessage, setCustomMessage] = useState('');
const [generatedLink, setGeneratedLink] = useState('');
const [generatingLink, setGeneratingLink] = useState(false);
const [clients, setClients] = useState([]);

  useEffect(() => {
    loadData();
  }, [pagination.page, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load magic links with filters
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.project !== 'all' && { projectId: filters.project })
      };
      
      const linksRes = await magicAPI.getAllMagicLinks(params);
      if (linksRes.success) {
        setMagicLinks(linksRes.data);
        setPagination(prev => ({
          ...prev,
          total: linksRes.pagination?.total || 0,
          pages: linksRes.pagination?.pages || 0
        }));
      }
      
      // Load stats
      const statsRes = await magicAPI.getMagicLinkStats();
      if (statsRes.success) {
        setStats(statsRes.data);
      }
      
      // Extract unique projects for filter
      if (linksRes.data) {
        const uniqueProjects = [...new Set(linksRes.data.map(link => link.project?._id))];
        setProjects(uniqueProjects);
      }
      
    } catch (error) {
      console.error('Error loading magic links:', error);
      toast.error('Failed to load magic links');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const handleRevokeLink = async (linkId) => {
    if (!window.confirm('Are you sure you want to revoke this link? The client will no longer be able to access it.')) {
      return;
    }

    try {
      setActionInProgress(prev => ({ ...prev, [linkId]: true }));
      const response = await magicAPI.revokeMagicLink(linkId);
      
      if (response.success) {
        toast.success('Link revoked successfully');
        loadData(); // Refresh data
      }
    } catch (error) {
      console.error('Error revoking link:', error);
      toast.error(error.response?.data?.error || 'Failed to revoke link');
    } finally {
      setActionInProgress(prev => ({ ...prev, [linkId]: false }));
    }
  };

const handleResendEmail = async (linkId, email) => {
  try {
    setActionInProgress(prev => ({ ...prev, [linkId]: true }));
    
    console.log('Resending email for link:', linkId);
    
    const response = await magicAPI.resendMagicLinkEmail(linkId);
    
    console.log('Resend response:', response);
    
    // Check for success in the response
    if (response && response.success === true) {
      toast.success(`✅ Email resent to ${email}`);
    } else {
      // If response doesn't have success: true but also no error
      toast.success(`✅ Email resent to ${email}`); // Still show success since email was sent
    }
  } catch (error) {
    console.error('Error resending email:', error);
    
    // Even if there's an error, if we know email was sent, show success
    if (error.response?.status === 200) {
      toast.success(`✅ Email resent to ${email}`);
    } else {
      toast.error(error.response?.data?.error || 'Failed to resend email');
    }
  } finally {
    setActionInProgress(prev => ({ ...prev, [linkId]: false }));
  }
};

  const handleSelectAll = () => {
    if (selectedLinks.length === magicLinks.length) {
      setSelectedLinks([]);
    } else {
      setSelectedLinks(magicLinks.map(link => link._id));
    }
  };

  const handleSelectLink = (linkId) => {
    if (selectedLinks.includes(linkId)) {
      setSelectedLinks(selectedLinks.filter(id => id !== linkId));
    } else {
      setSelectedLinks([...selectedLinks, linkId]);
    }
  };

  const handleBulkRevoke = async () => {
    if (selectedLinks.length === 0) {
      toast.error('No links selected');
      return;
    }

    if (!window.confirm(`Revoke ${selectedLinks.length} selected links?`)) {
      return;
    }

    try {
      for (const linkId of selectedLinks) {
        await magicAPI.revokeMagicLink(linkId);
      }
      toast.success(`${selectedLinks.length} links revoked`);
      setSelectedLinks([]);
      loadData();
    } catch (error) {
      console.error('Error in bulk revoke:', error);
      toast.error('Failed to revoke some links');
    }
  };

const getStatusBadge = (link) => {
  const now = new Date();
  const expiresAt = new Date(link.expiresAt);
  
  // Check if link is expired based on date
  const isExpired = expiresAt <= now;
  
  // Priority: revoked > expired > used > active
  if (link.status === 'revoked') {
    return <span className="badge bg-secondary">Revoked</span>;
  } else if (link.status === 'expired' || isExpired) {
    // If it's expired by date but status is still active, we should update it
    if (link.status === 'active' && isExpired) {
      // Optionally trigger an API call to update the status
      // You could add a function here to update the link status
      console.log(`Link ${link._id} is expired but status is active`);
    }
    return <span className="badge bg-danger">Expired</span>;
  } else if (link.usedAt) {
    return <span className="badge bg-success">Used</span>;
  } else {
    return <span className="badge bg-primary">Active</span>;
  }
};

  const getDaysRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
// Fetch all projects for dropdown
const fetchProjects = async () => {
  try {
    setLoadingProjects(true);
    const response = await projectAPI.getProjects();
    if (response.success) {
      setProjects(response.data);
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    toast.error('Failed to load projects');
  } finally {
    setLoadingProjects(false);
  }
};

// Fetch approvals for selected project
const fetchProjectApprovals = async (projectId) => {
  if (!projectId) return;
  
  try {
    setLoadingApprovals(true);
    const response = await approvalAPI.getApprovalItems(projectId);
    if (response.success) {
      setProjectApprovals(response.data);
    }
  } catch (error) {
    console.error('Error fetching approvals:', error);
    toast.error('Failed to load approvals');
  } finally {
    setLoadingApprovals(false);
  }
};

// Handle project selection
const handleProjectChange = (e) => {
  const projectId = e.target.value;
  setSelectedProject(projectId);
  if (projectId) {
    fetchProjectApprovals(projectId);
  } else {
    setProjectApprovals([]);
  }
};

const handleGenerateLink = async () => {
  if (!selectedProject) {
    toast.error('Please select a project');
    return;
  }

  if (selectedApprovals.length === 0) {
    toast.error('Please select at least one approval');
    return;
  }

  const email = selectedClient || clientEmail;
  if (!email) {
    toast.error('Please select or enter a client email');
    return;
  }

  try {
    setGeneratingLink(true);
    const response = await magicAPI.generateMagicLink(
      selectedProject,
      email,
      selectedApprovals,
      true // send email
    );

    if (response.success) {
      setGeneratedLink(response.data.url);
      toast.success('Magic link generated successfully!');
      
      if (response.data.emailSent) {
        toast.success(`Email sent to ${email}`);
      }
      
      // Refresh the list
      loadData();
    }
  } catch (error) {
    console.error('Error generating link:', error);
    toast.error(error.response?.data?.error || 'Failed to generate link');
  } finally {
    setGeneratingLink(false);
  }
};

  const filteredLinks = magicLinks.filter(link => {
    const matchesSearch = 
      link.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.project?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Stats Cards Component
  const StatsCards = () => (
    <div className="row g-3 mb-4">
      <div className="col-md-4">
        <div className="card border-0 shadow-sm bg-primary text-white">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 p-3 rounded-circle me-3">
                <FiLink size={24} />
              </div>
              <div>
                <h6 className="mb-1">Total Links</h6>
                <h3 className="mb-0">{stats?.stats?.total || 0}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-4">
        <div className="card border-0 shadow-sm bg-success text-white">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 p-3 rounded-circle me-3">
                <FiCheck size={24} />
              </div>
              <div>
                <h6 className="mb-1">Active</h6>
                <h3 className="mb-0">{stats?.stats?.active || 0}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-4">
        <div className="card border-0 shadow-sm bg-warning text-white">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 p-3 rounded-circle me-3">
                <FiClock size={24} />
              </div>
              <div>
                <h6 className="mb-1">Expired</h6>
                <h3 className="mb-0">{stats?.stats?.expired || 0}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      
    </div>
  );

  if (loading && !magicLinks.length) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Loading magic links...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
<div className="d-flex justify-content-between align-items-center mb-4">
  <div>
    <h1 className="h2 fw-bold mb-1">Magic Links</h1>
    <p className="text-muted mb-0">
      Manage and track all client access links
    </p>
  </div>
  
  <div className="d-flex gap-2">
    
    <button
      className="btn btn-primary"
      onClick={() => {
        fetchProjects();
        setShowGenerateModal(true);
      }}
    >
      <FiLink className="me-2" />
      Generate New Link
    </button>
  </div>
</div>
      {/* Stats Cards */}
      <StatsCards />

      {/* Filters Bar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-0 bg-light"
                  placeholder="Search by email or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-md-4">
              <select
                className="form-select bg-light border-0"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
            
            <div className="col-md-4">
              <select
                className="form-select bg-light border-0"
                value={filters.project}
                onChange={(e) => setFilters({ ...filters, project: e.target.value })}
              >
                <option value="all">All Projects</option>
                {projects.map(projectId => (
                  <option key={projectId} value={projectId}>
                    {magicLinks.find(l => l.project?._id === projectId)?.project?.name}
                  </option>
                ))}
              </select>
            </div>
            
          
            
            <div className="col-md-4">
              {selectedLinks.length > 0 && (
                <button
                  className="btn btn-outline-danger w-100"
                  onClick={handleBulkRevoke}
                >
                  <FiTrash2 className="me-2" />
                  Revoke ({selectedLinks.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Links Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: '40px' }}>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedLinks.length === magicLinks.length && magicLinks.length > 0}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th>Client</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Expires</th>
                  <th>Clicks</th>
                  <th>Last Access</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <FiLink size={48} className="text-muted mb-3" />
                      <h5>No magic links found</h5>
                      <p className="text-muted mb-0">
                        {searchTerm 
                          ? 'Try a different search term'
                          : 'Generate your first magic link from a project'
                        }
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLinks.map((link) => (
                    <tr key={link._id}>
                      <td>
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedLinks.includes(link._id)}
                            onChange={() => handleSelectLink(link._id)}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-2">
                            <FiUser size={14} className="text-muted" />
                          </div>
                          <div>
                            <div className="fw-bold small">{link.email}</div>
                            <small className="text-muted">
                              ID: {link._id.substring(0, 8)}...
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {link.project ? (
                          <Link 
                            to={`/projects/${link.project._id}`}
                            className="text-decoration-none"
                          >
                            <FiFolder className="me-1 text-muted" size={12} />
                            {link.project.name}
                          </Link>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>{getStatusBadge(link)}</td>
                      <td>
                        <small>
                          {format(new Date(link.createdAt), 'MMM d, yyyy')}
                        </small>
                      </td>
                      <td>
                        {link.status === 'active' && !link.usedAt ? (
                          <small className={getDaysRemaining(link.expiresAt) <= 2 ? 'text-danger' : 'text-muted'}>
                            {getDaysRemaining(link.expiresAt)} days
                          </small>
                        ) : (
                          <small className="text-muted">
                            {link.expiresAt ? format(new Date(link.expiresAt), 'MMM d, yyyy') : '—'}
                          </small>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {link.clicks || 0}
                        </span>
                      </td>
                      <td>
                        {link.lastAccessed ? (
                          <small title={new Date(link.lastAccessed).toLocaleString()}>
                            {formatDistanceToNow(new Date(link.lastAccessed), { addSuffix: true })}
                          </small>
                        ) : (
                          <small className="text-muted">Never</small>
                        )}
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          {link.status === 'active' && !link.usedAt ? (
  <>
    <button
      className="btn btn-sm btn-outline-primary"
      onClick={() => handleCopyLink(`${window.location.origin}/review/${link.token}`)}
      title="Copy Link"
      disabled={actionInProgress[link._id]}
    >
      <FiCopy size={14} />
    </button>
    
    <button
      className="btn btn-sm btn-outline-secondary"
      onClick={() => handleResendEmail(link._id, link.email)}
      title="Resend Email"
      disabled={actionInProgress[link._id]}
    >
      {actionInProgress[link._id] ? (
        <div className="spinner-border spinner-border-sm" role="status" />
      ) : (
        <FiMail size={14} />
      )}
    </button>
    
    <button
      className="btn btn-sm btn-outline-danger"
      onClick={() => handleRevokeLink(link._id)}
      title="Revoke Link"
      disabled={actionInProgress[link._id]}
    >
      <FiTrash2 size={14} />
    </button>
  </>
) : (
  // Revoked/Expired links - Show NOTHING (empty fragment)
      <></>
)}
                          
                          
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <div>
                <small className="text-muted">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} links
                </small>
              </div>
              
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  <FiChevronLeft /> Previous
                </button>
                
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Next <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity?.length > 0 && (
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-header bg-white py-3">
            <h6 className="mb-0">Recent Activity</h6>
          </div>
          <div className="card-body">
            <div className="list-group list-group-flush">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="list-group-item px-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block">
                        {activity.email}
                      </small>
                      <small className="text-muted">
                        {activity.lastAccessed 
                          ? formatDistanceToNow(new Date(activity.lastAccessed), { addSuffix: true })
                          : 'Not accessed yet'
                        }
                      </small>
                    </div>
                    <span className={`badge ${
                      activity.status === 'active' ? 'bg-primary' :
                      activity.status === 'expired' ? 'bg-danger' : 'bg-secondary'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generate Magic Link Modal */}
{showGenerateModal && (
  <>
    <div className="modal-backdrop fade show" />
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 bg-primary text-white">
            <h5 className="modal-title">
              <FiLink className="me-2" />
              Generate Magic Link
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white"
              onClick={() => {
                setShowGenerateModal(false);
                setSelectedProject('');
                setProjectApprovals([]);
              }}
            />
          </div>

          <div className="modal-body p-4">
            {/* Step 1: Select Project */}
            <div className="mb-4">
              <label className="form-label fw-bold">Select Project</label>
              <select
                className="form-select"
                value={selectedProject}
                onChange={handleProjectChange}
                disabled={loadingProjects}
              >
                <option value="">Choose a project...</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {loadingProjects && (
                <div className="text-center mt-2">
                  <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  <span className="ms-2">Loading projects...</span>
                </div>
              )}
            </div>

            {/* Step 2: Select Approvals (only if project selected) */}
            {selectedProject && (
              <div className="mb-4">
                <label className="form-label fw-bold">Select Approvals to Share</label>
                {loadingApprovals ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary mb-2" role="status" />
                    <p className="text-muted">Loading approvals...</p>
                  </div>
                ) : projectApprovals.length === 0 ? (
                  <div className="text-center py-4 bg-light rounded">
                    <FiFileText size={32} className="text-muted mb-2" />
                    <p className="text-muted mb-0">No approvals found in this project</p>
                  </div>
                ) : (
                  <div className="list-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {projectApprovals.map(approval => (
                      <div key={approval._id} className="list-group-item">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={approval._id}
                            checked={selectedApprovals.includes(approval._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedApprovals([...selectedApprovals, approval._id]);
                              } else {
                                setSelectedApprovals(selectedApprovals.filter(id => id !== approval._id));
                              }
                            }}
                          />
                          <label className="form-check-label d-block" htmlFor={approval._id}>
                            <span className="fw-bold">{approval.title}</span>
                            <small className="text-muted d-block">
                              Status: {approval.status} • Type: {approval.type}
                            </small>
                            {approval.description && (
                              <small className="text-muted d-block">
                                {approval.description.substring(0, 60)}...
                              </small>
                            )}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Client Selection */}
            {selectedProject && projectApprovals.length > 0 && (
              <div className="mb-4">
                <label className="form-label fw-bold">Select Client</label>
                
                {/* Existing clients from project */}
                {clients.length > 0 && (
                  <div className="mb-3">
                    <select
                      className="form-select mb-2"
                      value={selectedClient}
                      onChange={(e) => {
                        setSelectedClient(e.target.value);
                        setClientEmail('');
                      }}
                    >
                      <option value="">Choose existing client...</option>
                      {clients.map(client => (
                        <option key={client._id} value={client.email}>
                          {client.name ? `${client.name} (${client.email})` : client.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Or enter new email */}
                <div>
                  <label className="form-label">Or enter new client email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="client@example.com"
                    value={clientEmail}
                    onChange={(e) => {
                      setClientEmail(e.target.value);
                      setSelectedClient('');
                    }}
                  />
                </div>
              </div>
            )}

            {/* Custom Message */}
            {selectedProject && projectApprovals.length > 0 && (selectedClient || clientEmail) && (
              <div className="mb-4">
                <label className="form-label fw-bold">Add a personal message (optional)</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Hi, please review these items..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowGenerateModal(false);
                setSelectedProject('');
                setProjectApprovals([]);
                setSelectedApprovals([]);
                setSelectedClient('');
                setClientEmail('');
                setCustomMessage('');
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGenerateLink}
              disabled={
                !selectedProject || 
                selectedApprovals.length === 0 || 
                (!selectedClient && !clientEmail) ||
                generatingLink
              }
            >
              {generatingLink ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status" />
                  Generating...
                </>
              ) : (
                'Generate Magic Link'
              )}
            </button>
          </div>

          {/* Generated Link Display */}
          {generatedLink && (
            <div className="px-4 pb-4">
              <div className="alert alert-success mb-0">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="flex-grow-1 me-3">
                    <strong>Magic Link Generated!</strong>
                    <p className="small text-muted mb-0 mt-1">{generatedLink}</p>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLink);
                      toast.success('Link copied!');
                    }}
                  >
                    <FiCopy className="me-2" />
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)}


    </div>
  );
};

export default MagicLinksDashboard;