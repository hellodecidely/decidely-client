import React from 'react';
import { FiUsers, FiClock, FiCheckCircle, FiMoreVertical } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'archived': return 'secondary';
      default: return 'warning';
    }
  };

  return (
    <div className="card border-0 shadow-sm hover-shadow transition-all">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <span className={`badge bg-${getStatusColor(project.status)} mb-2`}>
              {project.status}
            </span>
            <h5 className="card-title mb-1">{project.name}</h5>
            <p className="card-text text-muted small mb-0">{project.description}</p>
          </div>
          <button className="btn btn-link text-gray-500">
            <FiMoreVertical />
          </button>
        </div>

        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <FiUsers className="text-gray-500" />
            <small className="text-muted">
              {project.clientCount || 0} clients
            </small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <FiCheckCircle className="text-gray-500" />
            <small className="text-muted">
              {project.approvedCount || 0}/{project.totalItems || 0} approved
            </small>
          </div>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between mb-1">
            <small className="text-muted">Progress</small>
            <small className="fw-semibold">{project.progress || 0}%</small>
          </div>
          <div className="progress" style={{ height: '6px' }}>
            <div 
              className="progress-bar bg-primary" 
              style={{ width: `${project.progress || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <FiClock className="text-gray-500" size={14} />
            <small className="text-muted">
              Updated {project.lastUpdated || 'today'}
            </small>
          </div>
          <Link 
            to={`/projects/${project.id}`}
            className="btn btn-sm btn-outline-primary"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;