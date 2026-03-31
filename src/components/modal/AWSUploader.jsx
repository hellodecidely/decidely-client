// components/AWSUploader.jsx
import React, { useState, useRef } from 'react';
import { 
  FiUpload, FiX, FiImage, FiVideo, FiFile, 
  FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const AWSUploader = ({ 
  onFileSelect, 
  onFileRemove,
  acceptedTypes = 'image/*,video/*,application/pdf',
  maxSize = 20 * 1024 * 1024,
  buttonText = 'Choose File',
  showPreview = true,
  className = '',
  selectedFile = null,
  error = null,
  disabled = false
}) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > maxSize) {
      toast.error(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    const isImage = selectedFile.type.startsWith('image/');
    const isVideo = selectedFile.type.startsWith('video/');
    const isPdf = selectedFile.type === 'application/pdf';
    
    if (!isImage && !isVideo && !isPdf) {
      toast.error('File type not supported');
      return;
    }

    if (showPreview && isImage) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }

    // Determine category
    let category = 'other';
    if (isImage) category = 'image';
    else if (isVideo) category = 'video';
    else if (isPdf) category = 'document';

    // Notify parent with full file data
    onFileSelect({
      file: selectedFile,
      filename: selectedFile.name,
      mimetype: selectedFile.type,
      size: selectedFile.size,
      category
    });
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove();
  };

  const getFileIcon = (file) => {
    if (!file) return <FiFile size={24} />;
    if (file.type.startsWith('image/')) return <FiImage size={24} className="text-primary" />;
    if (file.type.startsWith('video/')) return <FiVideo size={24} className="text-primary" />;
    return <FiFile size={24} className="text-primary" />;
  };

  return (
    <div className={`aws-uploader ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="d-none"
        id="file-upload-input"
        disabled={disabled} 
      />

      {!selectedFile ? (
        /* File Selection Area - Empty State */
        <div 
          className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-light transition-all"
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            minHeight: '120px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderColor: error ? '#dc3545' : '#dee2e6'
          }}
        >
          <div>
            <FiUpload size={32} className={error ? 'text-danger' : 'text-muted'} />
            <p className="mb-1 fw-semibold mt-2">{buttonText}</p>
            <p className="text-muted small mb-0">
              Max size: {maxSize / (1024 * 1024)}MB
            </p>
            {error && (
              <p className="text-danger small mt-2">
                <FiAlertCircle className="me-1" />
                {error}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* File Selected Area - Shows selected file */
        <div className="border rounded-lg p-3 bg-light">
          <div className="d-flex align-items-center">
            {/* Preview Image or Icon */}
            {preview ? (
              <img 
                src={preview} 
                alt="Preview" 
                className="rounded me-3"
                style={{ width: '48px', height: '48px', objectFit: 'cover' }}
              />
            ) : (
              <div className="me-3">{getFileIcon(selectedFile)}</div>
            )}
            
            {/* File Details */}
            <div className="flex-grow-1">
              <p className="mb-0 fw-semibold small text-truncate" style={{ maxWidth: '200px' }}>
                {selectedFile.name}
              </p>
              <p className="text-muted small mb-0">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            {/* Remove Button */}
            {!disabled && (
              <button 
                className="btn btn-link text-danger p-0"
                onClick={handleRemove}
                title="Remove file"
              >
                <FiX size={20} />
              </button>
            )}

          </div>

          {/* Ready Indicator */}
          {!disabled && (
            <div className="mt-2 text-success small d-flex align-items-center">
              <FiCheckCircle className="me-1" size={14} />
              File selected - ready to upload with approval
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AWSUploader;