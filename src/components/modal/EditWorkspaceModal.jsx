import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { workspaceAPI } from '../../services/api/workspace';

const EditWorkspaceModal = ({ isOpen, onClose, workspace, onWorkspaceUpdated }) => {
  const [name, setName] = useState(workspace?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await workspaceAPI.updateWorkspace(workspace._id, { name });
      
      if (response.success) {
        toast.success('Workspace updated successfully');
        onWorkspaceUpdated?.();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update workspace');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !workspace) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header border-0">
              <h5 className="modal-title">Edit Workspace</h5>
              <button 
                type="button" 
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Workspace Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
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
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditWorkspaceModal;