import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FiUsers, FiMail, FiUser, FiBriefcase, FiPlus,
  FiEdit, FiTrash2, FiCheck, FiX, FiSearch,
  FiFilter, FiDownload, FiShare2, FiExternalLink
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import clientAPI from '../../services/api/client';
import {projectAPI} from '../../services/api/project';
import magicAPI from '../../services/api/magic';

const ClientView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('global'); // 'project' or 'global'
  
  // Project clients state
  const [project, setProject] = useState(null);
  const [projectClients, setProjectClients] = useState([]);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClient, setNewClient] = useState({
    email: '',
    name: '',
    company: '',
    sendInvitation: true,
  });
  const [addingClient, setAddingClient] = useState(false);
  
  // Global clients state
  const [globalClients, setGlobalClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  
  // Magic links state


  useEffect(() => {
    if (projectId) {
      fetchProjectData();
      fetchProjectClients();
    } else {
      fetchGlobalClients();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const response = await projectAPI.getProject(projectId);
      if (response.success) {
        setProject(response.data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
    }
  };

  const fetchProjectClients = async () => {
    try {
      const response = await clientAPI.getProjectClients(projectId);
      if (response.success) {
        setProjectClients(response.data);
      }
    } catch (error) {
      console.error('Error fetching project clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalClients = async () => {
    try {
      const response = await clientAPI.getAllClients();
      if (response.success) {
        setGlobalClients(response.data);
      }
    } catch (error) {
      console.error('Error fetching global clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async () => {
  if (!newClient.email) {
    toast.error('Email is required');
    return;
  }

  try {
    setAddingClient(true);
    
    console.log('Adding client:', newClient.email);
    console.log('Project ID:', projectId);
    
    const response = await clientAPI.addClient(projectId, newClient);
    
    console.log('Add client response:', response);
    
    if (response.success) {
      toast.success(response.data.message || 'Client added successfully');
      
      // Check if invitation email was sent
      if (response.data.invitationSent) {
        toast.success(`📧 Invitation email sent to ${newClient.email}`);
      }
      
      // Close modal and reset form
      setShowAddClientModal(false);
      setNewClient({
        email: '',
        name: '',
        company: '',
        sendInvitation: true,
      });
      
      // Refresh the client list
      fetchProjectClients();
      
    } else {
      toast.error(response.error || 'Failed to add client');
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

  const handleRemoveClient = async (clientId, clientEmail) => {
    if (!window.confirm(`Remove ${clientEmail} from this project?`)) {
      return;
    }

    try {
      const response = await clientAPI.removeClient(projectId, clientId);
      if (response.success) {
        toast.success('Client removed');
        fetchProjectClients();
      }
    } catch (error) {
      console.error('Error removing client:', error);
      toast.error('Failed to remove client');
    }
  };

  const handleViewClientDetails = (client) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  const filteredClients = globalClients.filter(client =>
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h1 className="h2 fw-bold mb-1">
            {projectId ? `Clients - ${project?.name}` : 'Client Directory'}
          </h1>
          <p className="text-muted mb-0">
            {projectId 
              ? `Manage clients for ${project?.name}`
              : 'View and manage all clients across your agency'
            }
          </p>
        </div>
        
        <div className="d-flex gap-2">
          {projectId && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddClientModal(true)}
            >
              <FiPlus className="me-2" />
              Add Client
            </button>
          )}
          
          
        </div>
      </div>

      {/* Tabs for project/global view */}
      {!projectId && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-0">
            <ul className="nav nav-tabs border-0">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeView === 'global' ? 'active' : ''}`}
                  onClick={() => setActiveView('global')}
                >
                  <FiUsers className="me-2" />
                  All Clients
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeView === 'project' ? 'active' : ''}`}
                  onClick={() => navigate('/projects')}
                >
                  <FiBriefcase className="me-2" />
                  By Project
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="row">
        <div className="col-12">
          {/* Project Clients View */}
          {projectId && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">
                    {projectClients.length} Client{projectClients.length !== 1 ? 's' : ''}
                  </h5>
                  <div className="d-flex gap-2">
                    <div className="input-group" style={{ width: '300px' }}>
                      <span className="input-group-text">
                        <FiSearch />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {projectClients.length === 0 ? (
                  <div className="text-center py-5">
                    <FiUsers size={48} className="text-muted mb-3" />
                    <h5>No clients added yet</h5>
                    <p className="text-muted mb-4">
                      Add clients to this project to share approvals and collaborate
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowAddClientModal(true)}
                    >
                      <FiPlus className="me-2" />
                      Add First Client
                    </button>
                  </div>
                ) : (
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
                        {projectClients
                          .filter(client =>
                            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase()))
                          )
                          .map((client) => (
                            <tr key={client._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                                    <FiUser className="text-primary" />
                                  </div>
                                  <div>
                                    <div className="fw-bold">{client.name || 'No name'}</div>
                                    <small className="text-muted">
                                      Added by {client.addedBy?.name || 'Team'}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <FiMail className="me-2 text-muted" />
                                  {client.email}
                                </div>
                              </td>
                              <td>
                                {client.company || '—'}
                              </td>
                              <td>
                                {new Date(client.addedAt).toLocaleDateString()}
                              </td>
                              <td>
                                <div className="d-flex justify-content-end gap-2">
                                  
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handleViewClientDetails(client)}
                                    title="View Details"
                                  >
                                    <FiExternalLink size={14} />
                                  </button>
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
                )}
              </div>
            </div>
          )}

          {/* Global Clients View */}
          {!projectId && activeView === 'global' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">
                    {filteredClients.length} Client{filteredClients.length !== 1 ? 's' : ''} Found
                  </h5>
                  <div className="d-flex gap-2">
                    <div className="input-group" style={{ width: '300px' }}>
                      <span className="input-group-text">
                        <FiSearch />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by email, name, or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button className="btn btn-outline-secondary">
                      <FiFilter className="me-2" />
                      Filter
                    </button>
                  </div>
                </div>

                {filteredClients.length === 0 ? (
                  <div className="text-center py-5">
                    <FiUsers size={48} className="text-muted mb-3" />
                    <h5>No clients found</h5>
                    <p className="text-muted mb-4">
                      {searchTerm 
                        ? 'No clients match your search'
                        : 'Start by adding clients to your projects'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {filteredClients.map((client) => (
                      <div key={client.email} className="col">
                        <div className="card h-100 border">
                          <div className="card-body">
                            <div className="d-flex align-items-start mb-3">
                              <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                                <FiUser className="text-primary" />
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="card-title mb-1">
                                  {client.name || 'Unnamed Client'}
                                </h6>
                                <div className="d-flex align-items-center mb-2">
                                  <FiMail className="me-1 text-muted" size={12} />
                                  <small className="text-muted">{client.email}</small>
                                </div>
                                {client.company && (
                                  <div className="d-flex align-items-center">
                                    <FiBriefcase className="me-1 text-muted" size={12} />
                                    <small>{client.company}</small>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <small className="text-muted d-block mb-1">Projects ({client.projects.length})</small>
                              <div className="d-flex flex-wrap gap-1">
                                {client.projects.slice(0, 3).map((project, idx) => (
                                  <span key={idx} className="badge bg-light text-dark border">
                                    {project.name}
                                  </span>
                                ))}
                                {client.projects.length > 3 && (
                                  <span className="badge bg-light text-dark border">
                                    +{client.projects.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="d-flex gap-2 mt-3">
                              <button
                                className="btn btn-sm btn-outline-primary flex-fill"
                                onClick={() => navigate('/projects')}
                              >
                                <FiPlus className="me-1" />
                                Add to Project
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleViewClientDetails(client)}
                                title="View Details"
                              >
                                <FiExternalLink />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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
                        sendInvitation: true,
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
                        sendInvitation: true,
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
                        Adding Client...
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

      {/* Client Details Modal */}
      {showClientDetails && selectedClient && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-0">
                  <h5 className="modal-title">Client Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowClientDetails(false);
                      setSelectedClient(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-4 text-center mb-4 mb-md-0">
                      <div className="bg-primary bg-opacity-10 p-4 rounded-circle d-inline-block">
                        <FiUser className="text-primary" size={48} />
                      </div>
                      <h5 className="mt-3 mb-1">{selectedClient.name || 'Unnamed Client'}</h5>
                      <p className="text-muted mb-0">{selectedClient.email}</p>
                      {selectedClient.company && (
                        <p className="mb-0">
                          <FiBriefcase className="me-1" />
                          {selectedClient.company}
                        </p>
                      )}
                    </div>
                    
                    <div className="col-md-8">
                      <h6 className="mb-3">Projects</h6>
                      <div className="list-group">
                        {selectedClient.projects?.map((project, idx) => (
                          <div key={idx} className="list-group-item border-0 px-0 py-2">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <div className="fw-bold">{project.name}</div>
                                <small className="text-muted">Project ID: {project.id}</small>
                              </div>
                              <div>
                                <button
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                  View Project
                                </button>
                                
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {selectedClient.projects?.length === 0 && (
                        <div className="text-center py-4">
                          <FiBriefcase size={32} className="text-muted mb-2" />
                          <p className="text-muted mb-0">Not assigned to any projects yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setShowClientDetails(false);
                      setSelectedClient(null);
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate('/projects')}
                  >
                    <FiPlus className="me-2" />
                    Add to New Project
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

export default ClientView;