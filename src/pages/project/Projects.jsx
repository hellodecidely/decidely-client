import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiPlus, FiGrid, FiList, FiMoreVertical, FiEdit, FiTrash2, FiFolder, FiUsers, FiCheckCircle, FiEye, FiSearch, FiClock } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { projectAPI } from '../../services/api/project';
import { workspaceAPI } from '../../services/api/workspace';
import clientAPI from '../../services/api/client';
import { approvalAPI } from '../../services/api/approval';
import CreateProjectModal from '../../components/modal/CreateProjectModal';
import EditProjectModal from '../../components/modal/EditProjectModal';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedWorkspace, setSelectedWorkspace] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [clientCounts, setClientCounts] = useState({});
  const [approvalStats, setApprovalStats] = useState({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load workspaces first
        await fetchWorkspaces();
        // Then load projects
        await fetchProjects();
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getAllProjects();
      if (response.success) {
        const projectsData = response.data || [];
        setProjects(projectsData);
        await fetchAllClientCounts(projectsData);
        await fetchAllApprovalStats(projectsData);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const response = await workspaceAPI.getAllWorkspaces();
      if (response.success) {
        setWorkspaces(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    }
  };

  const fetchAllApprovalStats = async (projects) => {
  const stats = {};
  for (const project of projects) {
    try {
      const response = await approvalAPI.getApprovalItems(project._id);
      if (response.success) {
        const approvals = response.data || [];
        const pending = approvals.filter(a => a.status === 'pending').length;
        const approved = approvals.filter(a => a.status === 'approved').length;
        const changes = approvals.filter(a => a.status === 'changes').length;
        const blocked = approvals.filter(a => a.status === 'blocked').length;
        
        stats[project._id] = {
          pending,
          approved,
          changes,
          blocked,
          total: approvals.length
        };
      }
    } catch (error) {
      console.error(`Error fetching approvals for project ${project._id}:`, error);
      stats[project._id] = { pending: 0, approved: 0, total: 0 };
    }
  }
  setApprovalStats(stats);
};

  const handleDeleteProject = async (projectId, projectName) => {
    if (window.confirm(`Are you sure you want to delete project "${projectName}"? This will also delete all approvals.`)) {
      try {
        const response = await projectAPI.deleteProject(projectId);
        if (response.success) {
          toast.success('Project deleted successfully');
          fetchProjects();
        }
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete project');
      }
    }
    setMenuOpen(null);
  };

  const handleViewDetails = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const calculateProgress = (projectId) => {
    const stats = approvalStats[projectId];
    if (!stats) return 0;
    const total = stats.total || 0;
    const approved = stats.approved || 0;
    return total > 0 ? Math.round((approved / total) * 100) : 0;
  };

  const getWorkspaceName = (workspaceId) => {
    if (!workspaceId) return 'No Workspace';
    
    const workspace = workspaces.find(ws => ws._id === workspaceId);
    if (workspace) {
      return workspace.name;
    }
    
    const project = projects.find(p => p.workspace === workspaceId);
    if (project?.workspaceName) {
      return project.workspaceName;
    }
    
    return 'Unknown Workspace';
  };

  // Filter projects based on workspace and search term
  const filteredProjects = projects.filter(project => {
    const matchesWorkspace = selectedWorkspace === 'all' || project.workspaceId === selectedWorkspace;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (project.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesWorkspace && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    archived: projects.filter(p => p.status === 'archived').length
  };

  const fetchAllClientCounts = async (projects) => {
    const counts = {};
    for (const project of projects) {
      try {
        const response = await clientAPI.getProjectClients(project._id);
        if (response.success) {
          counts[project._id] = response.count || 0;
        }
      } catch (error) {
        console.error(`Error fetching clients for project ${project._id}:`, error);
        counts[project._id] = 0;
      }
    }
    setClientCounts(counts);
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

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Projects</h1>
          <p className="text-muted mb-0">Manage all your agency projects</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <FiList /> : <FiGrid />}
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus className="me-2" />
            New Project
          </button>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="row mb-4">
        <div className="col-md-9">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body py-3">
                  <h5 className="mb-0 fw-bold">{stats.total}</h5>
                  <p className="text-muted mb-0 small">Total Projects</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body py-3">
                  <h5 className="mb-0 fw-bold">{stats.active}</h5>
                  <p className="text-muted mb-0 small">Active</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body py-3">
                  <h5 className="mb-0 fw-bold">{stats.completed}</h5>
                  <p className="text-muted mb-0 small">Completed</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body py-3">
                  <h5 className="mb-0 fw-bold">{stats.archived}</h5>
                  <p className="text-muted mb-0 small">Archived</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="d-flex flex-column gap-2">
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <FiSearch className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-0 bg-light"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="form-select border-0 bg-light"
              value={selectedWorkspace}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
            >
              <option value="all">All Workspaces</option>
              {workspaces.map(ws => (
                <option key={ws._id} value={ws._id}>{ws.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="row g-4">
          {filteredProjects.length === 0 ? (
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <FiFolder size={64} className="text-muted mb-3" />
                  <h4>No projects found</h4>
                  <p className="text-muted mb-4">
                    {searchTerm || selectedWorkspace !== 'all' 
                      ? 'Try changing your search or filters' 
                      : 'Create your first project to get started'}
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <FiPlus className="me-2" />
                    Create First Project
                  </button>
                </div>
              </div>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const projectStats = approvalStats[project._id] || { pending: 0, approved: 0, total: 0 };
              const progress = calculateProgress(project._id);
              
              return (
                <div key={project._id} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100 hover-shadow">
                    <div className="card-body position-relative">
                      {/* Three-dot Menu */}
                      <div className="position-absolute top-0 end-0 mt-3 me-3">
                        <div className="dropdown">
                          <button 
                            className="btn btn-link text-muted p-0"
                            onClick={() => setMenuOpen(menuOpen === project._id ? null : project._id)}
                          >
                            <FiMoreVertical size={20} />
                          </button>
                          
                          {menuOpen === project._id && (
                            <div className="dropdown-menu show" style={{
                              position: 'absolute',
                              right: 0,
                              top: '100%',
                              zIndex: 1000,
                              minWidth: '160px'
                            }}>
                              <button 
                                className="dropdown-item d-flex align-items-center py-2"
                                onClick={() => handleViewDetails(project._id)}
                              >
                                <FiEye className="me-2" size={14} /> View Details
                              </button>
                              <button 
                                className="dropdown-item d-flex align-items-center py-2"
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowEditModal(true);
                                  setMenuOpen(null);
                                }}
                              >
                                <FiEdit className="me-2" size={14} /> Edit
                              </button>
                              <button 
                                className="dropdown-item d-flex align-items-center py-2 text-danger"
                                onClick={() => handleDeleteProject(project._id, project.name)}
                              >
                                <FiTrash2 className="me-2" size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-2">
                            <FiFolder className="text-primary" />
                          </div>
                          <div>
                            <h5 className="mb-0">{project.name}</h5>
                            <small className="text-muted">
                              {getWorkspaceName(project.workspaceId)}
                            </small>
                          </div>
                        </div>
                        <p className="text-muted small mb-3" style={{ minHeight: '40px' }}>
                          {project.description || 'No description provided'}
                        </p>
                      </div>

                      {/* Client and Approval Stats */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="small text-muted">
                            <FiUsers className="me-1" size={12} />
                            {clientCounts[project._id] || 0} client{clientCounts[project._id] !== 1 ? 's' : ''}
                          </span>
                          <span className="small text-muted">
                            <FiCheckCircle className="me-1 text-success" size={12} />
                            {projectStats.approved}/{projectStats.total} approved
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="progress mb-1" style={{ height: '8px', backgroundColor: '#e9ecef' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            style={{ width: `${progress}%` }}
                            role="progressbar"
                          ></div>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            <FiClock className="me-1" size={10} />
                            {projectStats.pending} pending
                          </small>
                          <small className="fw-semibold">
                            {progress}% Complete
                          </small>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="d-flex justify-content-between align-items-center mt-4 pt-2 border-top">
                        <small className="text-muted">
                          Updated {new Date(project.updatedAt).toLocaleDateString()}
                        </small>
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewDetails(project._id)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* List View */
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="list-group list-group-flush">
              {filteredProjects.map((project) => {
                const projectStats = approvalStats[project._id] || { pending: 0, approved: 0, total: 0 };
                const progress = calculateProgress(project._id);
                
                return (
                  <div key={project._id} className="list-group-item border-0 px-4 py-3 hover-bg">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center" style={{flex: 1}}>
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                          <FiFolder className="text-primary" />
                        </div>
                        <div style={{flex: 1}}>
                          <h6 className="mb-1">{project.name}</h6>
                          <p className="text-muted small mb-1">
                            {project.description || 'No description'}
                          </p>
                          <div className="d-flex gap-4 mt-1">
                            <small className="text-muted">
                              <FiUsers className="me-1" size={12} />
                              {clientCounts[project._id] || 0} clients
                            </small>
                            <small className="text-muted">
                              <FiCheckCircle className="me-1 text-success" size={12} />
                              {projectStats.approved}/{projectStats.total} approved
                            </small>
                            <small className="text-muted">
                              <FiClock className="me-1 text-warning" size={12} />
                              {projectStats.pending} pending
                            </small>
                            <small className="text-muted">
                              {getWorkspaceName(project.workspaceId)}
                            </small>
                          </div>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center gap-4">
                        {/* Progress Bar for List View */}
                        <div className="text-end" style={{ minWidth: '140px' }}>
                          <div className="progress mb-1" style={{ height: '6px', backgroundColor: '#e9ecef' }}>
                            <div 
                              className="progress-bar bg-primary" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <small className="text-muted">{progress}% complete</small>
                        </div>
                        
                        {/* Three-dot Menu for List View */}
                        <div className="dropdown">
                          <button 
                            className="btn btn-link text-muted p-0"
                            onClick={() => setMenuOpen(menuOpen === project._id ? null : project._id)}
                          >
                            <FiMoreVertical size={20} />
                          </button>
                          
                          {menuOpen === project._id && (
                            <div className="dropdown-menu show" style={{
                              position: 'absolute',
                              right: 0,
                              top: '100%',
                              zIndex: 1000,
                              minWidth: '160px'
                            }}>
                              <button 
                                className="dropdown-item d-flex align-items-center py-2"
                                onClick={() => handleViewDetails(project._id)}
                              >
                                <FiEye className="me-2" size={14} /> View Details
                              </button>
                              <button 
                                className="dropdown-item d-flex align-items-center py-2"
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowEditModal(true);
                                  setMenuOpen(null);
                                }}
                              >
                                <FiEdit className="me-2" size={14} /> Edit
                              </button>
                              <button 
                                className="dropdown-item d-flex align-items-center py-2 text-danger"
                                onClick={() => handleDeleteProject(project._id, project.name)}
                              >
                                <FiTrash2 className="me-2" size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={fetchProjects}
        workspaces={workspaces}
      />

      {/* Edit Project Modal */}
      {selectedProject && (
        <EditProjectModal 
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
          onProjectUpdated={fetchProjects}
        />
      )}
    </div>
  );
};

export default Projects;