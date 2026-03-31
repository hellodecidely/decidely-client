import React, { useState } from 'react';
import { 
  FiImage, FiVideo, FiFile, FiExternalLink, 
  FiDownload, FiMaximize, FiX 
} from 'react-icons/fi';

const AWSViewer = ({ media }) => {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!media) return null;

  const { url, filename, mimetype, size, category } = media;

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = () => {
    if (category === 'image') return <FiImage size={24} className="text-primary" />;
    if (category === 'video') return <FiVideo size={24} className="text-primary" />;
    return <FiFile size={24} className="text-secondary" />;
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  // Image Display
  if (category === 'image') {
    return (
      <>
        <div className="border rounded p-3">
          <div className="text-center">
            <img 
              src={url} 
              alt={filename}
              className="img-fluid rounded cursor-pointer"
              style={{ maxHeight: '400px', maxWidth: '100%', objectFit: 'contain' }}
              onClick={() => setShowFullscreen(true)}
              onLoad={() => setLoading(false)}
            />
            {loading && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status" />
              </div>
            )}
          </div>
          
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <p className="mb-0 fw-semibold small">{filename}</p>
              <small className="text-muted">
                {formatFileSize(size)} • AWS S3
              </small>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowFullscreen(true)}
                title="Fullscreen"
              >
                <FiMaximize size={14} />
              </button>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-primary"
                title="Open Original"
              >
                <FiExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Fullscreen Modal */}
        {showFullscreen && (
          <>
            <div className="modal-backdrop fade show" />
            <div className="modal fade show d-block" tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content bg-dark">
                  <div className="modal-header border-0">
                    <h5 className="modal-title text-white">{filename}</h5>
                    <button 
                      type="button" 
                      className="btn-close btn-close-white"
                      onClick={() => setShowFullscreen(false)}
                    />
                  </div>
                  <div className="modal-body text-center p-0">
                    <img 
                      src={url} 
                      alt={filename}
                      className="img-fluid"
                      style={{ maxHeight: '80vh', maxWidth: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  // Video Display
  if (category === 'video') {
    return (
      <div className="border rounded p-3">
        <video 
          controls 
          className="w-100 rounded"
          style={{ maxHeight: '400px' }}
        >
          <source src={url} type={mimetype || 'video/mp4'} />
          Your browser doesn't support video playback.
        </video>
        
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <p className="mb-0 fw-semibold small">{filename}</p>
            <small className="text-muted">
              {formatFileSize(size)} • AWS S3
            </small>
          </div>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline-primary"
          >
            <FiExternalLink className="me-1" /> Open
          </a>
        </div>
      </div>
    );
  }

  // Document/PDF Display
  if (category === 'document' && mimetype === 'application/pdf') {
    return (
      <div className="border rounded p-3">
        <iframe 
          src={`${url}#toolbar=0`}
          className="w-100 rounded"
          style={{ height: '500px' }}
          title={filename}
        />
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <p className="mb-0 fw-semibold small">{filename}</p>
            <small className="text-muted">
              {formatFileSize(size)} • AWS S3
            </small>
          </div>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline-primary"
          >
            <FiExternalLink className="me-1" /> Open
          </a>
        </div>
      </div>
    );
  }

  // Other file types
  return (
    <div className="border rounded p-3">
      <div className="d-flex align-items-center">
        <div className="me-3">
          {getFileIcon()}
        </div>
        <div className="flex-grow-1">
          <p className="mb-0 fw-semibold small">{filename || 'Document'}</p>
          <small className="text-muted">
            {formatFileSize(size)} • AWS S3
          </small>
        </div>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline-primary"
        >
          <FiExternalLink className="me-1" /> Open
        </a>
      </div>
    </div>
  );
};

export default AWSViewer;