// components/PricingSection.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiMail, FiSend, FiUser, FiBriefcase, FiMessageCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import { useAuth } from '../../contexts/AuthContext';

// Initialize EmailJS
emailjs.init('qEFrZZsLilOHxUySc'); // Replace with your actual public key

const PricingSection = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    plan: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for freelancers testing the waters',
      features: [
        { name: '2 workspaces', included: true },
        { name: '2 projects', included: true },
        { name: '20 approvals per month', included: true },
        { name: 'Video uploads up to 20MB', included: true },
        { name: 'Images and Document uploads up to 10MB', included: true },
        { name: 'Magic links', included: true },
        { name: 'Email notifications', included: true },
      ],
      cta: 'Start Free',
      highlight: false,
      action: 'free'
    },
    {
      name: 'Pro',
      price: '$19.99',
      period: 'per month',
      description: 'For growing agencies that need more power',
      features: [
        { name: '20 workspaces', included: true },
        { name: '20 projects', included: true },
        { name: '200 approvals per month', included: true },
        { name: 'Video uploads up to 40MB', included: true },
        { name: 'Images and Document uploads up to 20MB', included: true },
        { name: 'Magic links', included: true },
        { name: 'Email notifications', included: true },
      ],
      cta: 'Start Free Trial',
      highlight: true,
      action: 'upgrade'
    },
    {
      name: 'Agency',
      price: '$49.99',
      period: 'per month',
      description: 'For established agencies and larger teams',
      features: [
        { name: 'Unlimited workspaces', included: true },
        { name: 'Unlimited projects', included: true },
        { name: 'Unlimited approvals', included: true },
        { name: 'Video uploads up to 60MB', included: true },
        { name: 'Images and Document uploads up to 40MB', included: true },
        { name: 'Magic links', included: true },
        { name: 'Email notifications', included: true },
      ],
      cta: 'Upgrade to Agency',
      highlight: false,
      action: 'upgrade'
    }
  ];

  const handleUpgradeClick = (plan) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=pricing');
      toast.info('Please log in to upgrade your plan');
      return;
    }

    setSelectedPlan(plan);
    setFormData({ 
      ...formData, 
      plan: plan.name,
      name: user?.name || '',
      email: user?.email || '',
      company: user?.company || ''
    });
    setShowUpgradeModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Please fill in your name and email');
      return;
    }

    setSubmitting(true);

    try {
      const templateParams = {
        to_name: 'Decidely Team',
        from_name: formData.name,
        from_email: formData.email,
        company: formData.company || 'Not provided',
        plan: formData.plan,
        message: formData.message || 'No additional message',
        user_id: user?.id || 'Not logged in',
        reply_to: formData.email
      };

      await emailjs.send(
        'service_p6skxd4',      // Replace with your EmailJS service ID
        'template_pczup4k',      // Replace with your EmailJS template ID
        templateParams
      );

      toast.success('Upgrade request sent! We\'ll email you a payment link within 24 hours.');
      setShowUpgradeModal(false);
      
      setFormData({
        name: '',
        email: '',
        company: '',
        plan: '',
        message: ''
      });
    } catch (error) {
      console.error('EmailJS error:', error);
      toast.error('Failed to send request. Please email us directly at hello@decidely.app');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section id="pricing" className="py-5 position-relative overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{
          background: 'radial-gradient(circle at 0% 100%, rgba(13,110,253,0.03) 0%, transparent 50%)',
          zIndex: 0
        }} />
        
        <div className="container position-relative py-5" style={{ zIndex: 1 }}>
          <motion.div 
            className="text-center mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-3 py-2 rounded-pill mb-3">
              💰 Simple Pricing
            </span>
            <h2 className="display-6 fw-bold mb-3">Plans for Every Agency</h2>
            <p className="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
              Start free, upgrade when you need more. No hidden fees, no surprises.
            </p>
          </motion.div>

          <div className="row g-4 align-items-stretch">
            {plans.map((plan, index) => (
              <motion.div 
                key={index} 
                className="col-lg-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`card h-100 border-0 rounded-4 overflow-hidden ${plan.highlight ? 'shadow-lg scale-up' : 'shadow'}`}>
                  {plan.highlight && (
                    <div className="bg-primary text-white text-center py-2 fw-semibold small">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="card-body p-4">
                    <h3 className="h4 fw-bold mb-2">{plan.name}</h3>
                    <div className="mb-3">
                      <span className="display-5 fw-bold">{plan.price}</span>
                      {plan.price !== '$0' && <span className="text-muted ms-2 small">{plan.period}</span>}
                    </div>
                    <p className="text-muted small mb-4">{plan.description}</p>
                    
                    <ul className="list-unstyled mb-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="mb-3 d-flex align-items-start">
                          {feature.included ? (
                            <FiCheck className="text-success me-2 flex-shrink-0 mt-1" size={18} />
                          ) : (
                            <FiX className="text-danger me-2 flex-shrink-0 mt-1" size={18} />
                          )}
                          <span className={feature.included ? 'text-dark' : 'text-muted text-decoration-line-through'}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button 
                      className={`btn w-100 py-3 fw-semibold rounded-3 ${plan.highlight ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleUpgradeClick(plan)}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upgrade Request Modal - Same Styling as Pricing.jsx */}
      {showUpgradeModal && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                {/* Modal Header with Gradient */}
                <div className="modal-header border-0 p-4" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-white bg-opacity-20 rounded-circle p-3">
                      <FiMail className="text-white" size={24} />
                    </div>
                    <div>
                      <h5 className="modal-title text-white fw-bold fs-4 mb-1">
                        Upgrade to {selectedPlan?.name}
                      </h5>
                      <p className="text-white text-opacity-90 small mb-0">
                        {isAuthenticated 
                          ? "Complete the form below and we'll send you a payment link"
                          : "Please log in to upgrade your plan"}
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setShowUpgradeModal(false)}
                  />
                </div>
                
                <form onSubmit={handleSubmitRequest}>
                  <div className="modal-body p-4">
                    {/* Plan Summary Card */}
                    <div className="bg-light rounded-3 p-3 mb-4 d-flex align-items-center gap-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                        <FiBriefcase className="text-primary" size={20} />
                      </div>
                      <div>
                        <span className="fw-semibold d-block">Selected Plan: {selectedPlan?.name}</span>
                        <span className="text-muted small">{selectedPlan?.price} {selectedPlan?.period}</span>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Your Name *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">
                            <FiUser className="text-muted" />
                          </span>
                          <input
                            type="text"
                            className="form-control border-0 bg-light"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Muhammad Ali"
                            disabled={!isAuthenticated}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Email Address *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">
                            <FiMail className="text-muted" />
                          </span>
                          <input
                            type="email"
                            className="form-control border-0 bg-light"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="you@agency.com"
                            disabled={!isAuthenticated}
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold">Agency Name</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">
                            <FiBriefcase className="text-muted" />
                          </span>
                          <input
                            type="text"
                            className="form-control border-0 bg-light"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Your Agency"
                            disabled={!isAuthenticated}
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold">Message (Optional)</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">
                            <FiMessageCircle className="text-muted" />
                          </span>
                          <textarea
                            className="form-control border-0 bg-light"
                            rows="3"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Tell us about your needs..."
                            disabled={!isAuthenticated}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-primary bg-opacity-10 rounded-3 p-3 mt-4">
                      <div className="d-flex align-items-start gap-3">
                      
                        <div>
                          <p className="small text-primary fw-semibold mb-1">How it works:</p>
                          <ol className="small text-muted ps-3 mb-0">
                            <li>You submit this upgrade request</li>
                            <li>We email you a secure SadaPay payment link within 24 hours</li>
                            <li>Complete payment via bank transfer or card</li>
                            <li>Your account is manually upgraded within 24 hours of payment</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {!isAuthenticated && (
                      <div className="alert alert-warning mt-3 mb-0">
                        <FiMail className="me-2" />
                        Please <a href="/login?redirect=pricing" className="alert-link">log in</a> to upgrade your plan
                      </div>
                    )}
                  </div>

                  <div className="modal-footer border-0 bg-light p-3">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary rounded-pill px-4"
                      onClick={() => setShowUpgradeModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary rounded-pill px-5"
                      disabled={submitting || !isAuthenticated}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FiSend className="me-2" />
                          {isAuthenticated ? 'Send Request' : 'Login Required'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default PricingSection;