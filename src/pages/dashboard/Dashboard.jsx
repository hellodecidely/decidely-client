import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFolder,
  FiCheckSquare,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiEye
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { projectAPI } from '../../services/api/project';
import { approvalAPI } from '../../services/api/approval';

const Dashboard = () => {
  // States
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingApprovals: 0,
    approvedApprovals: 0,
    changesRequested: 0,
    blockedApprovals: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load projects
      const projectsRes = await projectAPI.getProjects();
      
      // Try to load approvals, but don't fail if it doesn't work
      let approvalsData = [];
      try {
        const approvalsRes = await approvalAPI.getAllApprovals();
        if (approvalsRes && approvalsRes.success) {
          approvalsData = approvalsRes.data || [];
        }
      } catch (approvalError) {
        console.log('Approvals endpoint not available yet, skipping...');
      }

      // Process Projects
      if (projectsRes && projectsRes.success) {
        setProjects(projectsRes.data || []);
        setStats(prev => ({
          ...prev,
          totalProjects: projectsRes.data?.length || 0
        }));
      }

      // Process Approvals
      if (approvalsData.length > 0) {
        setApprovals(approvalsData);
        
        // Calculate approval stats
        const pending = approvalsData.filter(a => a.status === 'pending').length;
        const approved = approvalsData.filter(a => a.status === 'approved').length;
        const changes = approvalsData.filter(a => a.status === 'changes').length;
        const blocked = approvalsData.filter(a => a.status === 'blocked').length;

        setStats(prev => ({
          ...prev,
          pendingApprovals: pending,
          approvedApprovals: approved,
          changesRequested: changes,
          blockedApprovals: blocked
        }));
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FiCheckCircle className="text-success" size={16} />;
      case 'pending': return <FiClock className="text-warning" size={16} />;
      case 'changes': return <FiAlertCircle className="text-info" size={16} />;
      case 'blocked': return <FiXCircle className="text-danger" size={16} />;
      default: return <FiCheckSquare className="text-muted" size={16} />;
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

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Loading your dashboard...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Dashboard</h1>
          <p className="text-muted mb-0">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                  <FiFolder className="text-primary fs-4" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Total Projects</h6>
                  <h2 className="mb-0 fw-bold">{stats.totalProjects}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                  <FiClock className="text-warning fs-4" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Pending</h6>
                  <h2 className="mb-0 fw-bold">{stats.pendingApprovals}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                  <FiCheckCircle className="text-success fs-4" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Approved</h6>
                  <h2 className="mb-0 fw-bold">{stats.approvedApprovals}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                  <FiXCircle className="text-danger fs-4" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Blocked</h6>
                  <h2 className="mb-0 fw-bold">{stats.blockedApprovals}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FiFolder className="me-2 text-primary" />
                  Projects
                </h5>
                <Link to="/projects" className="btn btn-sm btn-outline-primary">
                  View All Projects
                </Link>
              </div>
            </div>
            <div className="card-body">
              {projects.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No projects found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Project Name</th>
                        <th>Status</th>
                        <th>Clients</th>
                        <th>Created</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map(project => (
                        <tr key={project._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <FiFolder className="text-primary me-2" />
                              <span className="fw-bold">{project.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge bg-${project.status === 'active' ? 'success' : 'secondary'}`}>
                              {project.status || 'active'}
                            </span>
                          </td>
                          <td>{project.clientEmails?.length || 0}</td>
                          <td>{new Date(project.createdAt).toLocaleDateString()}</td>
                          <td className="text-end">
                            <Link 
                              to={`/projects/${project._id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <FiEye className="me-1" /> View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approvals Section */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FiCheckSquare className="me-2 text-primary" />
                  Recent Approvals
                </h5>
                <Link to="/approvals" className="btn btn-sm btn-outline-primary">
                  View All Approvals
                </Link>
              </div>
            </div>
            <div className="card-body">
              {approvals.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No approvals found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Project</th>
                        <th>Status</th>
                        <th>Type</th>
                        <th>Deadline</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvals.slice(0, 5).map(approval => (
                        <tr key={approval._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {getStatusIcon(approval.status)}
                              <span className="ms-2 fw-bold">{approval.title}</span>
                            </div>
                          </td>
                          <td>{approval.project?.name || '—'}</td>
                          <td>
                            <span className={`badge bg-${getStatusBadge(approval.status)}`}>
                              {approval.status}
                            </span>
                          </td>
                          <td className="text-capitalize">{approval.type || 'text'}</td>
                          <td>
                            {approval.deadline 
                              ? new Date(approval.deadline).toLocaleDateString()
                              : '—'
                            }
                          </td>
                          <td className="text-end">
                            <Link 
                              to={`/approvals/${approval._id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <FiEye className="me-1" /> View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;