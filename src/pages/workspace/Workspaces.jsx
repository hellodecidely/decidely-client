import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiUsers, FiFolder, FiMoreVertical, FiEdit, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { workspaceAPI } from '../../services/api/workspace';
import CreateWorkspaceModal from '../../components/modal/CreateWorkspaceModal';
import EditWorkspaceModal from '../../components/modal/EditWorkspaceModal';

const Workspaces = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await workspaceAPI.getAllWorkspaces();
      if (response.success) {
        setWorkspaces(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast.error('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId, workspaceName) => {
    if (window.confirm(`Are you sure you want to delete workspace "${workspaceName}"? This will also delete all your projects in it.`)) {
      try {
        const response = await workspaceAPI.deleteWorkspace(workspaceId);
        if (response.success) {
          toast.success('Workspace deleted successfully');
          fetchWorkspaces();
        }
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete workspace');
      }
    }
    setMenuOpen(null);
  };

  const handleOpenWorkspace = (workspaceId) => {
    navigate(`/workspaces/${workspaceId}`);
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
          <h1 className="h2 fw-bold mb-1">Workspaces</h1>
          <p className="text-muted mb-0">Manage your agency workspaces and teams</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus className="me-2" />
          Create Workspace
        </button>
      </div>

      {/* Workspaces Grid */}
      <div className="row g-4">
        {workspaces.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <FiFolder size={64} className="text-muted mb-3" />
                <h4>No workspaces yet</h4>
                <p className="text-muted mb-4">Create your first workspace to start managing projects</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <FiPlus className="me-2" />
                  Create First Workspace
                </button>
              </div>
            </div>
          </div>
        ) : (
          workspaces.map((workspace) => (
            <div key={workspace._id} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100 hover-shadow">
                <div className="card-body position-relative">
                  {/* Three-dot Menu */}
                  <div className="position-absolute top-0 end-0 mt-3 me-3">
                    <div className="dropdown">
                      <button 
                        className="btn btn-link text-muted p-0"
                        onClick={() => setMenuOpen(menuOpen === workspace._id ? null : workspace._id)}
                      >
                        <FiMoreVertical size={20} />
                      </button>
                      
                      {menuOpen === workspace._id && (
                        <div className="dropdown-menu show" style={{
                          position: 'absolute',
                          right: 0,
                          top: '100%',
                          zIndex: 1000
                        }}>
                          <button 
                            className="dropdown-item d-flex align-items-center"
                            onClick={() => {
                              setSelectedWorkspace(workspace);
                              setShowEditModal(true);
                              setMenuOpen(null);
                            }}
                          >
                            <FiEdit className="me-2" /> Edit
                          </button>
                          <button 
                            className="dropdown-item d-flex align-items-center text-danger"
                            onClick={() => handleDeleteWorkspace(workspace._id, workspace.name)}
                          >
                            <FiTrash2 className="me-2" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h5 className="card-title mb-1">{workspace.name}</h5>
                    <p className="text-muted small mb-0">
                      Created {new Date(workspace.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FiUsers className="text-muted" />
                      <span className="text-muted">
                        {workspace.members?.length || 1} members
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <FiFolder className="text-muted" />
                      <span className="text-muted">
                        {workspace.projectCount || 0} projects
                      </span>
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-primary btn-sm flex-grow-1"
                      onClick={() => handleOpenWorkspace(workspace._id)}
                    >
                      Open Workspace
                    </button>
                    
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onWorkspaceCreated={fetchWorkspaces}
      />

      {/* Edit Workspace Modal */}
      {selectedWorkspace && (
        <EditWorkspaceModal 
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedWorkspace(null);
          }}
          workspace={selectedWorkspace}
          onWorkspaceUpdated={fetchWorkspaces}
        />
      )}
    </div>
  );
};

export default Workspaces;