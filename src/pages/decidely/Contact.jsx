// pages/Contact.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiMail, FiMessageCircle, FiSend,
  FiMapPin, FiPhone, FiClock, FiCheckCircle,
  FiUser, FiBriefcase, FiHelpCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init('qEFrZZsLilOHxUySc'); // Replace with your actual public key

const Contact = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        company: formData.company || 'Not provided',
        message: formData.message,
        reply_to: formData.email
      };

      await emailjs.send(
        'service_p6skxd4',      // Replace with your Service ID
        'template_ujkuuod',     // Replace with your Template ID
        templateParams
      );

      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch (error) {
      console.error('Email error:', error);
      toast.error('Failed to send message. Please email us directly at hello@decidely.app');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <FiMail size={20} />,
      title: 'Email Us',
      content: 'hello.decidely@gmail.com',
      link: 'mailto:hello.decidely@gmail.com',
      response: 'Replies within 24h'
    },
    {
      icon: <FiHelpCircle size={20} />,
      title: 'Support',
      content: 'hello.decidely@gmail.com',
      link: 'mailto:hello.decidely@gmail.com',
      response: '24/7 Priority support'
    },
    {
      icon: <FiMapPin size={20} />,
      title: 'Location',
      content: 'Islamabad, Pakistan',
      link: null,
      response: 'Serving agencies worldwide'
    },
    {
      icon: <FiClock size={20} />,
      title: 'Response Time',
      content: 'Within 24 hours',
      link: null,
      response: 'Usually much faster'
    }
  ];

  const faqs = [
    {
      question: 'How fast do you reply?',
      answer: 'We typically respond within a few hours, definitely within 24 hours. For Pro and Agency customers, priority support is even faster.'
    },
    {
      question: 'Can you help me set up?',
      answer: 'Absolutely! We offer free onboarding calls for Agency plan customers. For everyone else, our docs and email support have you covered.'
    },
    {
      question: 'Do you offer custom plans?',
      answer: 'Yes! If you need custom limits or have specific requirements, just let us know and we\'ll work something out.'
    }
  ];

  return (
    <div className="min-vh-100 bg-white">
      {/* Header */}
      <div className="container py-4">
        <button 
          className="btn btn-link text-decoration-none p-0 mb-4 d-flex align-items-center"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft className="me-2" />
          Back
        </button>
      </div>

      <div className="container py-4">
        <div className="row g-5">
          {/* Left Column - Contact Info & Form */}
          <div className="col-lg-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-3 py-2 rounded-pill mb-3">
                👋 Get in Touch
              </span>
              <h1 className="display-5 fw-bold mb-4">We'd love to hear from you</h1>
              <p className="lead text-muted mb-5">
                Have a question? Need help? Just want to say hi? We're here for you.
              </p>

              {/* Contact Info Cards */}
              <div className="row g-3 mb-5">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={index}
                    className="col-md-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <div className="bg-primary bg-opacity-10 rounded-3 p-2">
                            <div className="text-primary">{item.icon}</div>
                          </div>
                          <h6 className="fw-semibold mb-0">{item.title}</h6>
                        </div>
                        {item.link ? (
                          <a href={item.link} className="text-decoration-none">
                            <p className="text-primary fw-medium mb-1">{item.content}</p>
                          </a>
                        ) : (
                          <p className="fw-medium mb-1">{item.content}</p>
                        )}
                        <small className="text-muted">{item.response}</small>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="card border-0 shadow-lg rounded-4"
              >
                <div className="card-body p-4 p-md-5">
                  <h4 className="fw-bold mb-4">Send us a message</h4>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="row g-4">
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
                            onChange={handleChange}
                            placeholder="Muhammad Ali"
                            required
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
                            onChange={handleChange}
                            placeholder="ali@agency.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold">Company Name</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">
                            <FiBriefcase className="text-muted" />
                          </span>
                          <input
                            type="text"
                            className="form-control border-0 bg-light"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Your Agency"
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold">Message *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">
                            <FiMessageCircle className="text-muted" />
                          </span>
                          <textarea
                            className="form-control border-0 bg-light"
                            rows="5"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Tell us how we can help..."
                            required
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-primary w-100 py-3 fw-semibold rounded-3"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <FiSend className="me-2" />
                              Send Message
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column - FAQ */}
          <div className="col-lg-5">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky-top" style={{ top: '100px' }}
            >
              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-body p-4 p-md-5">
                  <h4 className="fw-bold mb-4">Frequently Asked Questions</h4>
                  
                  <div className="vstack gap-3">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-bottom pb-3">
                        <h6 className="fw-semibold mb-2 d-flex align-items-center">
                          <FiHelpCircle className="text-primary me-2" size={16} />
                          {faq.question}
                        </h6>
                        <p className="text-muted small mb-0">{faq.answer}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-primary bg-opacity-10 rounded-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-primary rounded-circle p-2">
                        <FiCheckCircle className="text-white" size={18} />
                      </div>
                      <div>
                        <h6 className="fw-semibold mb-1">We're here to help</h6>
                        <p className="text-muted small mb-0">
                          All messages get a reply within 24 hours, usually faster.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;