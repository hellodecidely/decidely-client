import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiFolder, FiClock, FiUsers, FiCheckCircle, FiPlus, FiSettings } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { workspaceAPI } from '../../services/api/workspace';
import { projectAPI } from '../../services/api/project';
import { approvalAPI } from '../../services/api/approval';
import CreateProjectModal from '../../components/modal/CreateProjectModal';

const WorkspaceDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [allApprovals, setAllApprovals] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingApprovals: 0,
    approvedApprovals: 0,
    changesRequested: 0,
    blockedApprovals: 0,
    teamMembers: 1,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchWorkspaceData();
    }
  }, [id]);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      
      // Fetch workspace details
      const workspaceRes = await workspaceAPI.getWorkspace(id);
      if (workspaceRes.success) {
        setWorkspace(workspaceRes.data);
      } else {
        throw new Error(workspaceRes.error || 'Failed to load workspace');
      }

      // Fetch projects in this workspace
      const projectsRes = await projectAPI.getProjectsByWorkspace(id);
      if (projectsRes.success) {
        const projectsData = projectsRes.data || [];
        setProjects(projectsData);
        
        // Fetch all approvals for these projects
        const projectIds = projectsData.map(p => p._id);
        let allApprovalsData = [];
        
        if (projectIds.length > 0) {
          // You might need to modify this based on your API
          // This assumes you have an API to get all approvals
          try {
            const approvalsRes = await approvalAPI.getAllApprovals();
            if (approvalsRes.success) {
              // Filter approvals that belong to projects in this workspace
              allApprovalsData = approvalsRes.data.filter(
                approval => projectIds.includes(approval.project?._id || approval.project)
              );
            }
          } catch (err) {
            console.log('Could not fetch all approvals, calculating from projects only');
            // Fallback: calculate from project stats
          }
        }
        
        setAllApprovals(allApprovalsData);
        
        // Calculate stats from approvals
        const pendingCount = allApprovalsData.filter(a => a.status === 'pending').length;
        const approvedCount = allApprovalsData.filter(a => a.status === 'approved').length;
        const changesCount = allApprovalsData.filter(a => a.status === 'changes').length;
        const blockedCount = allApprovalsData.filter(a => a.status === 'blocked').length;
        
        // Also calculate from project.pendingApprovals as fallback
        const pendingFromProjects = projectsData.reduce((total, project) => 
          total + (project.pendingApprovals || 0), 0);
        
        const approvedFromProjects = projectsData.reduce((total, project) => 
          total + (project.completedApprovals || 0), 0);

        setStats({
          totalProjects: projectsData.length,
          pendingApprovals: pendingCount || pendingFromProjects,
          approvedApprovals: approvedCount || approvedFromProjects,
          changesRequested: changesCount,
          blockedApprovals: blockedCount,
          teamMembers: workspaceRes.data?.members?.length || 1,
          completionRate: (approvedCount + changesCount + blockedCount) > 0 
            ? Math.round((approvedCount / (approvedCount + changesCount + blockedCount)) * 100) 
            : 0
        });
      }
    } catch (error) {
      console.error('Error fetching workspace data:', error);
      toast.error(error.message || 'Failed to load workspace');
      navigate('/workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setShowCreateProjectModal(true);
  };

  const handleProjectCreated = () => {
    fetchWorkspaceData();
  };

  const calculateProjectProgress = (project) => {
    // Try to get from project stats first
    if (project.completionRate) return project.completionRate;
    
    const total = (project.pendingApprovals || 0) + (project.completedApprovals || 0);
    const approved = project.completedApprovals || 0;
    return total > 0 ? Math.round((approved / total) * 100) : 0;
  };

  const getProjectPendingCount = (project) => {
    // Get from approvals list if available
    if (allApprovals.length > 0) {
      return allApprovals.filter(a => 
        (a.project?._id === project._id || a.project === project._id) && 
        a.status === 'pending'
      ).length;
    }
    return project.pendingApprovals || 0;
  };

  const getProjectApprovedCount = (project) => {
    if (allApprovals.length > 0) {
      return allApprovals.filter(a => 
        (a.project?._id === project._id || a.project === project._id) && 
        a.status === 'approved'
      ).length;
    }
    return project.completedApprovals || 0;
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

  if (!workspace) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">Workspace not found</div>
        <button className="btn btn-primary" onClick={() => navigate('/workspaces')}>
          Back to Workspaces
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-4">
        <button 
          className="btn btn-link text-decoration-none mb-3"
          onClick={() => navigate('/workspaces')}
        >
          <FiArrowLeft className="me-2" />
          Back to Workspaces
        </button>
        
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h2 fw-bold mb-2">{workspace.name}</h1>
            <p className="text-muted">Workspace dashboard and project management</p>
          </div>
          <div className="d-flex gap-2">
            
            <button className="btn btn-primary" onClick={handleCreateProject}>
              <FiPlus className="me-2" />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Simplified without colors */}
      <div className="row g-4 mb-5">
        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-light p-3 rounded me-3">
                  <FiFolder className="text-secondary fs-4" />
                </div>
                <div>
                  <h2 className="mb-0 fw-bold">{stats.totalProjects}</h2>
                  <p className="text-muted mb-0">Total Projects</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-light p-3 rounded me-3">
                  <FiClock className="text-secondary fs-4" />
                </div>
                <div>
                  <h2 className="mb-0 fw-bold">{stats.pendingApprovals}</h2>
                  <p className="text-muted mb-0">Pending Approvals</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-light p-3 rounded me-3">
                  <FiCheckCircle className="text-secondary fs-4" />
                </div>
                <div>
                  <h2 className="mb-0 fw-bold">{stats.approvedApprovals}</h2>
                  <p className="text-muted mb-0">Approved</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-light p-3 rounded me-3">
                  <FiUsers className="text-secondary fs-4" />
                </div>
                <div>
                  <h2 className="mb-0 fw-bold">{stats.teamMembers}</h2>
                  <p className="text-muted mb-0">Team Members</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row - Optional breakdown */}
      {(stats.changesRequested > 0 || stats.blockedApprovals > 0) && (
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm bg-light">
              <div className="card-body">
                <div className="d-flex gap-4">
                  {stats.changesRequested > 0 && (
                    <div>
                      <span className="badge bg-info me-2">Changes Requested</span>
                      <span className="fw-bold">{stats.changesRequested}</span>
                    </div>
                  )}
                  {stats.blockedApprovals > 0 && (
                    <div>
                      <span className="badge bg-danger me-2">Blocked</span>
                      <span className="fw-bold">{stats.blockedApprovals}</span>
                    </div>
                  )}
                  <div>
                    <span className="badge bg-success me-2">Completion Rate</span>
                    <span className="fw-bold">{stats.completionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Section */}
      <div className="card border-0 shadow-sm mb-5">
        <div className="card-header bg-white border-0 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Projects in this Workspace</h5>
            <div className="d-flex gap-2">
              <button className="btn btn-primary btn-sm" onClick={handleCreateProject}>
                <FiPlus className="me-1" /> New Project
              </button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {projects.length > 0 ? (
            <div className="list-group list-group-flush">
              {projects.map((project) => {
                const pendingCount = getProjectPendingCount(project);
                const approvedCount = getProjectApprovedCount(project);
                const progress = calculateProjectProgress(project);
                
                return (
                  <div key={project._id} className="list-group-item border-0 px-4 py-3 hover-bg">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center" style={{flex: 1}}>
                        <div className="bg-light p-2 rounded me-3">
                          <FiFolder className="text-secondary" />
                        </div>
                        <div style={{flex: 1}}>
                          <h6 className="mb-1">{project.name}</h6>
                          <p className="text-muted small mb-2">
                            {project.description || 'No description'}
                          </p>
                          <div className="d-flex gap-3">
                            <small className="text-muted">
                              Created: {new Date(project.createdAt).toLocaleDateString()}
                            </small>
                            {project.deadline && (
                              <small className="text-muted">
                                Deadline: {new Date(project.deadline).toLocaleDateString()}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center gap-3">
                        <div className="text-end">
                          <div className="d-flex gap-2 mb-1">
                            <span className="badge bg-warning bg-opacity-25 text-dark">
                              {pendingCount} Pending
                            </span>
                            <span className="badge bg-success bg-opacity-25 text-dark">
                              {approvedCount} Approved
                            </span>
                          </div>
                          <div className="progress" style={{width: '100px', height: '6px'}}>
                            <div 
                              className="progress-bar bg-secondary" 
                              style={{width: `${progress}%`}}
                            ></div>
                          </div>
                          <small className="text-muted">{progress}% complete</small>
                        </div>
                        
                        <Link 
                          to={`/projects/${project._id}`}
                          className="btn btn-outline-secondary btn-sm"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                <FiFolder size={48} className="text-muted" />
              </div>
              <h5>No projects yet</h5>
              <p className="text-muted mb-4">Create your first project in this workspace</p>
              <button className="btn btn-primary" onClick={handleCreateProject}>
                <FiPlus className="me-2" />
                Create First Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal 
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        workspaceId={id}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default WorkspaceDashboard;