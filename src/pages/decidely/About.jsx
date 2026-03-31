// pages/About.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiUsers, FiCheckCircle, FiZap, 
  FiHeart, FiTarget, FiEye, FiAward, FiMail,
  FiMessageCircle, FiShield, FiGlobe
} from 'react-icons/fi';

const About = () => {
  const navigate = useNavigate();

  const stats = [
    { value: '10+', label: 'Agencies Trust Us', icon: <FiUsers /> },
    { value: '100+', label: 'Projects Managed', icon: <FiCheckCircle /> },
    { value: '99.9%', label: 'Client Satisfaction', icon: <FiHeart /> },
    { value: '24/7', label: 'Support Available', icon: <FiZap /> },
  ];

  const values = [
    {
      title: 'Simple by Design',
      description: 'We believe approvals shouldn\'t be complicated. No accounts for clients, no email threads, no confusion. Just one link and clear decisions.',
      icon: <FiTarget className="text-primary" size={24} />,
    },
    {
      title: 'Built for Agencies',
      description: 'We know your pain—chasing clients for feedback, endless "what do you think?" emails. Decidely was born from that frustration.',
      icon: <FiEye className="text-primary" size={24} />,
    },
    {
      title: 'Privacy First',
      description: 'Your work is your work. Magic links expire automatically, files are stored securely on AWS, and we never share your data.',
      icon: <FiShield className="text-primary" size={24} />,
    },
    {
      title: 'Global by Nature',
      description: 'From Karachi to New York, agencies use Decidely to collaborate with clients across time zones. No barriers, just feedback.',
      icon: <FiGlobe className="text-primary" size={24} />,
    },
  ];

  const team = [
    {
      name: 'The Founder',
      role: 'Built Decidely because he was tired of chasing approvals',
      quote: 'I created Decidely to solve my own problem. Now it helps agencies worldwide.',
    },
  ];

  return (
    <div className="min-vh-100 bg-white">
      {/* Header with back button */}
      <div className="container py-1">
        <button 
          className="btn btn-link text-decoration-none p-0 mb-4 d-flex align-items-center"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft className="me-2" />
          Back
        </button>
      </div>

      {/* Hero Section */}
      <section className="position-relative overflow-hidden py-5">
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(13, 110, 253, 0.03) 0%, transparent 50%)',
          zIndex: 0
        }} />
        
        <div className="container position-relative py-5" style={{ zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-3 py-2 rounded-pill mb-3">
              👋 Meet Decidely
            </span>
            <h1 className="display-4 fw-bold mb-4">
              We're on a mission to <span className="text-primary">end approval chaos</span>
            </h1>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Decidely was built by an agency owner who was tired of chasing clients for feedback. 
              What started as a simple tool became a platform used by agencies worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Story - Simple Human Language */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="fw-bold mb-4">Here's the thing...</h2>
                <p className="fs-5 text-muted mb-4">
                  Have you ever sent a client an email with attachments, waited three days, 
                  and then got a reply saying "Can you resend? I can't find it"?
                </p>
                <p className="fs-5 text-muted mb-4">
                  Yeah, us too. That's exactly why Decidely exists.
                </p>
                <p className="fs-5 text-muted">
                  We wanted something simple. No client accounts. No passwords. 
                  Just a link that takes them directly to the work, with big buttons 
                  that say "Approve," "Changes," or "Block." That's it. That's Decidely.
                </p>
              </motion.div>
            </div>
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-4 shadow-lg p-5"
              >
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <FiMessageCircle className="text-primary" size={32} />
                  </div>
                  <div>
                    <h4 className="fw-bold mb-1">The "Aha!" Moment</h4>
                    <p className="text-muted mb-0">When we realized clients don't need another login</p>
                  </div>
                </div>
                <blockquote className="fs-4 fst-italic text-secondary border-start border-primary ps-4 py-2">
                  "Wait... what if they just click a link? No password, no account, just... click and approve?"
                </blockquote>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5">
        <div className="container py-4">
          <div className="row g-4">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="col-md-3 col-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                    <div className="text-primary">{stat.icon}</div>
                  </div>
                  <h3 className="display-5 fw-bold text-primary mb-1">{stat.value}</h3>
                  <p className="text-muted mb-0">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-3 py-2 rounded-pill mb-3">
              💭 What We Believe
            </span>
            <h2 className="fw-bold">The principles we live by</h2>
          </motion.div>

          <div className="row g-4">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="col-md-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                        {value.icon}
                      </div>
                      <h4 className="fw-bold mb-0">{value.title}</h4>
                    </div>
                    <p className="text-muted mb-0">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder's Note */}
      <section className="py-5">
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-primary text-white rounded-4 p-5 position-relative overflow-hidden"
              >
                <div className="position-absolute top-0 end-0 opacity-10" style={{ fontSize: '150px', transform: 'translate(20%, -20%)' }}>
                  <FiHeart />
                </div>
                <div className="position-relative" style={{ zIndex: 1 }}>
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-white bg-opacity-20 rounded-circle p-3">
                      <FiAward className="text-white" size={32} />
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1">A note from the founder</h4>
                      <p className="text-white-50 mb-0">Muhammad Saad, Founder of Decidely</p>
                    </div>
                  </div>
                  <p className="fs-5 mb-4">
                    "I built Decidely because I lived the problem. I was running a small agency 
                    and spent more time chasing approvals than actually doing the work. 
                    Now thousands of agencies use Decidely to get out of their inbox and back to creating."
                  </p>
                  <div className="d-flex gap-2">
                    <a href="/contact" className="btn btn-light rounded-pill px-4">
                      Say Hello
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-light">
        <div className="container py-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="fw-bold mb-3">Ready to stop chasing approvals?</h2>
            <p className="lead text-muted mb-4">Join agencies who save 10+ hours every week</p>
            <a href="/pricing" className="btn btn-primary btn-lg rounded-pill px-5">
              Get Started Free
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;