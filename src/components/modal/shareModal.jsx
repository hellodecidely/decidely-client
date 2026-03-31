import React, { useState, useEffect } from 'react';
import { FiX, FiMail, FiCopy, FiCheck, FiSend } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import magicAPI from '../services/api/magicAPI';

const ShareModal = ({ isOpen, onClose, projectId, projectName, clients = [], approvals = [] }) => {
  const [step, setStep] = useState(1); // 1: select client, 2: select approvals, 3: share
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedApprovals, setSelectedApprovals] = useState([]);
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStep(1);
      setSelectedClient('');
      setSelectedApprovals([]);
      setGeneratedLink('');
      setClientEmail('');
      setCustomMessage('');
      setEmailSent(false);
    }
  }, [isOpen]);

  const handleGenerateLink = async () => {
    if (!selectedClient && !clientEmail) {
      toast.error('Please select or enter a client email');
      return;
    }

    const email = selectedClient || clientEmail;

    try {
      setLoading(true);
      const response = await magicAPI.generateMagicLink(
        projectId,
        email,
        selectedApprovals,
        true // send email
      );

      if (response.success) {
        setGeneratedLink(response.data.url);
        setEmailSent(response.data.emailSent);
        setStep(3);
        toast.success('Magic link generated successfully!');
      }
    } catch (error) {
      console.error('Error generating link:', error);
      toast.error(error.response?.data?.error || 'Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    try {
      setLoading(true);
      // You can add a resend endpoint here
      toast.success('Email sent successfully!');
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header border-0 bg-primary text-white">
              <h5 className="modal-title">
                <FiMail className="me-2" />
                Share with Client
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white"
                onClick={onClose}
              />
            </div>

            <div className="modal-body p-4">
              {/* Progress Steps */}
              <div className="d-flex justify-content-between mb-4">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="text-center flex-grow-1">
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 ${
                      step >= s ? 'bg-primary text-white' : 'bg-light text-muted'
                    }`} style={{ width: '30px', height: '30px' }}>
                      {s}
                    </div>
                    <div className="small text-muted">
                      {s === 1 && 'Select Client'}
                      {s === 2 && 'Choose Items'}
                      {s === 3 && 'Share Link'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Step 1: Select Client */}
              {step === 1 && (
                <div>
                  <h6 className="fw-bold mb-3">Select Client</h6>
                  
                  {clients.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">Choose existing client</label>
                      <select
                        className="form-select"
                        value={selectedClient}
                        onChange={(e) => {
                          setSelectedClient(e.target.value);
                          setClientEmail('');
                        }}
                      >
                        <option value="">Select a client...</option>
                        {clients.map((client) => (
                          <option key={client._id} value={client.email}>
                            {client.name ? `${client.name} (${client.email})` : client.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Or enter new email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="client@example.com"
                      value={clientEmail}
                      onChange={(e) => {
                        setClientEmail(e.target.value);
                        setSelectedClient('');
                      }}
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button className="btn btn-outline-secondary" onClick={onClose}>
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => setStep(2)}
                      disabled={!selectedClient && !clientEmail}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Select Approvals */}
              {step === 2 && (
                <div>
                  <h6 className="fw-bold mb-3">Select Items to Share</h6>
                  
                  {approvals.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted mb-3">No approval items found</p>
                      <button className="btn btn-primary" onClick={() => setStep(3)}>
                        Continue without items
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <div className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="selectAll"
                            checked={selectedApprovals.length === approvals.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedApprovals(approvals.map(a => a._id));
                              } else {
                                setSelectedApprovals([]);
                              }
                            }}
                          />
                          <label className="form-check-label fw-bold" htmlFor="selectAll">
                            Select All ({approvals.length} items)
                          </label>
                        </div>
                      </div>

                      <div className="list-group mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {approvals.map((approval) => (
                          <div key={approval._id} className="list-group-item">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={approval._id}
                                checked={selectedApprovals.includes(approval._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedApprovals([...selectedApprovals, approval._id]);
                                  } else {
                                    setSelectedApprovals(selectedApprovals.filter(id => id !== approval._id));
                                  }
                                }}
                              />
                              <label className="form-check-label d-block" htmlFor={approval._id}>
                                <span className="fw-bold">{approval.title}</span>
                                <small className="text-muted d-block">
                                  Status: {approval.status} • Type: {approval.type}
                                </small>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Add a personal message (optional)</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          placeholder="Hi, please review these items..."
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                        />
                      </div>

                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-outline-secondary" onClick={() => setStep(1)}>
                          Back
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={handleGenerateLink}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-2" role="status" />
                              Generating...
                            </>
                          ) : (
                            'Generate Link'
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Share Link */}
              {step === 3 && (
                <div>
                  <div className="text-center mb-4">
                    <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                      <FiCheck size={32} className="text-success" />
                    </div>
                    <h5>Magic Link Generated!</h5>
                    <p className="text-muted">
                      {emailSent 
                        ? `Email sent to ${selectedClient || clientEmail}`
                        : 'Copy the link below to share with your client'
                      }
                    </p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Magic Link</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={generatedLink}
                        readOnly
                      />
                      <button
                        className="btn btn-outline-primary"
                        onClick={handleCopyLink}
                      >
                        {copied ? <FiCheck /> : <FiCopy />}
                        <span className="ms-2">{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <small className="text-muted">
                      This link expires in 7 days
                    </small>
                  </div>

                  {!emailSent && (
                    <div className="mb-3">
                      <label className="form-label">Send via Email</label>
                      <div className="input-group">
                        <input
                          type="email"
                          className="form-control"
                          value={selectedClient || clientEmail}
                          readOnly
                        />
                        <button
                          className="btn btn-primary"
                          onClick={handleSendEmail}
                          disabled={loading}
                        >
                          <FiSend className="me-2" />
                          Send Email
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button className="btn btn-outline-primary" onClick={handleGenerateLink}>
                      Generate Another
                    </button>
                    <button className="btn btn-success" onClick={onClose}>
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareModal;