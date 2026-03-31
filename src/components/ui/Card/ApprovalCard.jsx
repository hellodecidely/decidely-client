import React from 'react';
import { 
  FiCheck, 
  FiX, 
  FiEdit, 
  FiClock,
  FiMessageSquare,
  FiImage,
  FiFileText,
  FiLink
} from 'react-icons/fi';
import { format } from 'date-fns';

const ApprovalCard = ({ item, onAction }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return { color: 'success', icon: <FiCheck />, label: 'Approved' };
      case 'pending':
        return { color: 'warning', icon: <FiClock />, label: 'Pending' };
      case 'changes_requested':
        return { color: 'danger', icon: <FiEdit />, label: 'Changes' };
      case 'blocked':
        return { color: 'secondary', icon: <FiX />, label: 'Blocked' };
      default:
        return { color: 'warning', icon: <FiClock />, label: 'Pending' };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'image': return <FiImage className="text-primary" />;
      case 'document': return <FiFileText className="text-info" />;
      case 'link': return <FiLink className="text-success" />;
      case 'text': return <FiFileText className="text-secondary" />;
      default: return <FiFileText className="text-gray-500" />;
    }
  };

  const statusInfo = getStatusInfo(item.status);
  const isUrgent = item.deadline && new Date(item.deadline) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  return (
    <div className="card border-0 shadow-sm hover-shadow transition-all h-100">
      <div className="card-body d-flex flex-column">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center gap-2">
            {getTypeIcon(item.type)}
            <span className={`badge bg-${statusInfo.color} bg-opacity-10 text-${statusInfo.color}`}>
              {statusInfo.icon} {statusInfo.label}
            </span>
          </div>
          {isUrgent && (
            <span className="badge bg-danger">URGENT</span>
          )}
        </div>

        {/* Content */}
        <h6 className="card-title mb-2">{item.title}</h6>
        <p className="card-text text-muted small flex-grow-1 mb-3">
          {item.description || 'No description provided'}
        </p>

        {/* Meta info */}
        <div className="mb-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <small className="text-muted">Project:</small>
            <small className="fw-semibold">{item.projectName || 'Unknown'}</small>
          </div>
          
          {item.deadline && (
            <div className="d-flex align-items-center gap-2 mb-2">
              <FiClock className="text-gray-500" size={14} />
              <small className="text-muted">
                Due: {format(new Date(item.deadline), 'MMM d, yyyy')}
              </small>
            </div>
          )}
          
          <div className="d-flex align-items-center gap-2">
            <FiMessageSquare className="text-gray-500" size={14} />
            <small className="text-muted">
              {item.commentCount || 0} comments
            </small>
          </div>
        </div>

        {/* Assigned to */}
        {item.assignedTo && item.assignedTo.length > 0 && (
          <div className="mb-3">
            <small className="text-muted d-block mb-1">Waiting for:</small>
            <div className="d-flex gap-1">
              {item.assignedTo.slice(0, 3).map((email, idx) => (
                <span key={idx} className="badge bg-light text-dark">
                  {email.split('@')[0]}
                </span>
              ))}
              {item.assignedTo.length > 3 && (
                <span className="badge bg-light text-dark">
                  +{item.assignedTo.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="d-flex gap-2 mt-auto">
          {item.status === 'pending' && (
            <>
              <button 
                onClick={() => onAction('approve', item.id)}
                className="btn btn-sm btn-success flex-grow-1"
              >
                <FiCheck /> Approve
              </button>
              <button 
                onClick={() => onAction('request-changes', item.id)}
                className="btn btn-sm btn-outline-danger"
              >
                <FiEdit /> Changes
              </button>
            </>
          )}
          
          {item.status === 'changes_requested' && (
            <button 
              onClick={() => onAction('review', item.id)}
              className="btn btn-sm btn-primary flex-grow-1"
            >
              <FiEdit /> Review Changes
            </button>
          )}
          
          <button 
            onClick={() => onAction('view', item.id)}
            className="btn btn-sm btn-outline-secondary"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalCard;