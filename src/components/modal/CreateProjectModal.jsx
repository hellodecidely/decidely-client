import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { projectAPI } from '../../services/api/project';
import { workspaceAPI } from '../../services/api/workspace';

const CreateProjectModal = ({ isOpen, onClose, workspaceId, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workspaceId: workspaceId || ''
  });
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        name: '',
        description: '',
        workspaceId: workspaceId || ''
      });
      
      // Fetch workspaces if no workspaceId provided
      if (!workspaceId) {
        fetchWorkspaces();
      } else {
        // If workspaceId is provided, verify it exists
        verifyWorkspace(workspaceId);
      }
    }
  }, [isOpen, workspaceId]);

  // In fetchWorkspaces function:
const fetchWorkspaces = async () => {
  try {
    const response = await workspaceAPI.getAllWorkspaces(); 
    if (response.success) {
      setWorkspaces(response.data || []);
      // Auto-select first workspace if none selected
      if (!formData.workspaceId && response.data.length > 0) {
        setFormData(prev => ({ ...prev, workspaceId: response.data[0]._id }));
      }
    }
  } catch (error) {
    console.error('Failed to load workspaces:', error);
    toast.error('Failed to load workspaces');
  }
};

  const verifyWorkspace = async (id) => {
    try {
      const response = await workspaceAPI.getWorkspace(id);
      if (!response.success) {
        toast.error('Selected workspace not found');
        onClose();
      }
    } catch (error) {
      toast.error('Invalid workspace');
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    
    if (!formData.workspaceId) {
      toast.error('Please select a workspace');
      return;
    }

    try {
      setLoading(true);
      const response = await projectAPI.createProject(formData.workspaceId, {
        name: formData.name,
        description: formData.description
      });
      
      if (response.success) {
        toast.success('Project created successfully');
        setFormData({ name: '', description: '', workspaceId: workspaceId || '' });
        onProjectCreated?.(response.data);
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header border-0">
              <h5 className="modal-title">Create New Project</h5>
              <button 
                type="button" 
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Project Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Website Redesign"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    autoFocus
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Brief description of the project..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                {/* Workspace Selection - Show if no workspaceId provided */}
                {!workspaceId && (
                  <div className="mb-3">
                    <label className="form-label">Select Workspace *</label>
                    <select
                      className="form-select"
                      value={formData.workspaceId}
                      onChange={(e) => setFormData({...formData, workspaceId: e.target.value})}
                      required
                    >
                      <option value="">Choose a workspace...</option>
                      {workspaces.map(workspace => (
                        <option key={workspace._id} value={workspace._id}>
                          {workspace.name} ({workspace.projectCount || 0} projects)
                        </option>
                      ))}
                    </select>
                    {workspaces.length === 0 && (
                      <div className="form-text text-warning">
                        No workspaces found. Please create a workspace first.
                      </div>
                    )}
                  </div>
                )}
                
                {/* Show selected workspace name if workspaceId is provided */}
                {workspaceId && workspaces.length > 0 && (
  <div className="mb-3">
    <label className="form-label">Workspace</label>
    <div className="form-control bg-light">
      {workspaces.find(w => w._id === workspaceId)?.name || 'Loading...'}
    </div>
    <div className="form-text">
      Project will be created in this workspace
    </div>
  </div>
)}
              </div>
              <div className="modal-footer border-0">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || (!workspaceId && workspaces.length === 0)}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Creating...
                    </>
                  ) : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateProjectModal;