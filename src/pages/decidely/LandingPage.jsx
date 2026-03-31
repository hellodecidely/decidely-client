// pages/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiCheckCircle, FiClock, FiUsers, FiShield, 
  FiMail, FiArrowRight, FiStar, FiPlayCircle,
  FiMessageSquare, FiLink, FiImage, FiVideo,
  FiZap, FiLock, FiTrendingUp, FiGithub,
  FiTwitter, FiLinkedin, FiSend, FiCheck,
  FiMenu, FiX
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import PricingSection from '../../components/layout/PricingSection';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-vh-100 bg-white">
      {/* Navigation */}
      <nav className={`navbar navbar-expand-lg fixed-top py-3 transition-all ${scrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
            <span className="bg-primary text-white fw-bold rounded-3 p-2 fs-5">D</span>
            <span className="fw-bold fs-3 text-dark">decidely</span>
          </Link>
          
          <button 
            className="navbar-toggler border-0" 
            type="button" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav mx-auto align-items-center gap-3">
              <li className="nav-item"><a href="#features" className="nav-link px-3 fw-medium text-dark">Features</a></li>
              <li className="nav-item"><a href="#how-it-works" className="nav-link px-3 fw-medium text-dark">How It Works</a></li>
              <li className="nav-item"><a href="#pricing" className="nav-link px-3 fw-medium text-dark">Pricing</a></li>
              <li className="nav-item"><a href="/about" className="nav-link px-3 fw-medium text-dark">About</a></li>
              <li className="nav-item"><a href="/contact" className="nav-link px-3 fw-medium text-dark">Contact</a></li>
              {/* <li className="nav-item"><a href="#testimonials" className="nav-link px-3 fw-medium text-dark">Testimonials</a></li> */}
            </ul>
            <div className="d-flex gap-3">
              <Link to="/login" className="btn btn-outline-dark px-4 py-2 fw-medium">Log In</Link>
              <Link to="/register" className="btn btn-primary px-4 py-2 fw-medium">Start Free</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="position-relative overflow-hidden" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        {/* Background gradient */}
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{
          background: 'radial-gradient(circle at 10% 30%, rgba(13, 110, 253, 0.05) 0%, transparent 30%), radial-gradient(circle at 90% 70%, rgba(13, 110, 253, 0.05) 0%, transparent 30%)',
          zIndex: 0
        }} />
        
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center min-vh-50">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="d-inline-flex align-items-center gap-2 bg-primary bg-opacity-10 rounded-pill px-3 py-1 mb-4">
                  <FiZap className="text-primary" size={16} />
                  <span className="small fw-semibold text-primary">The #1 Approval Platform for Agencies</span>
                </div>
                
                <h1 className="display-4 fw-bold mb-4 lh-1">
                  Stop Chasing Clients for{' '}
                  <span className="text-primary">Approvals</span>
                </h1>
                
                <p className="lead text-muted mb-4" style={{ fontSize: '1.25rem' }}>
                  Decidely helps agencies get clear feedback in one place. 
                  Share work, collect decisions, and move projects forward—without the endless email chains.
                </p>
                
                <div className="d-flex flex-wrap gap-3 mb-4">
                  <Link to="/register" className="btn btn-primary btn-lg px-5 py-3 fw-semibold">
                    Start Free Trial
                    <FiArrowRight className="ms-2" />
                  </Link>
                  
                </div>
                
                <div className="d-flex align-items-center gap-4">
                  <div className="d-flex align-items-center">
                    <FiCheckCircle className="text-success me-2" />
                    <span className="text-muted">No credit card</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FiLock className="text-success me-2" />
                    <span className="text-muted">Secure & private</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="position-relative"
              >
                {/* Main dashboard preview */}
                <div className="bg-white rounded-4 shadow-xl overflow-hidden border">
                  <div className="bg-light p-3 border-bottom d-flex align-items-center gap-2">
                    <div className="d-flex gap-2">
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }} />
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }} />
                    </div>
                    <span className="small text-muted ms-2">decidely.app/projects/website</span>
                  </div>
                  
                </div>
                
                {/* Floating elements */}
                <div className="position-absolute top-0 end-0 translate-middle-y bg-white rounded-3 shadow p-3 d-none d-lg-block" style={{ right: '-20px', top: '50px' }}>
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-success bg-opacity-10 p-2 rounded">
                      <FiCheckCircle className="text-success" />
                    </div>
                    <div>
                      <small className="text-muted d-block">Client approved</small>
                      <span className="fw-bold">Website design</span>
                    </div>
                  </div>
                </div>
                
                <div className="position-absolute bottom-0 start-0 translate-middle-y bg-white rounded-3 shadow p-3 d-none d-lg-block" style={{ left: '-20px', bottom: '50px' }}>
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-warning bg-opacity-10 p-2 rounded">
                      <FiClock className="text-warning" />
                    </div>
                    <div>
                      <small className="text-muted d-block">Needs review</small>
                      <span className="fw-bold">Mobile app screens</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      {/* <section className="py-5 bg-light">
        <div className="container">
          <p className="text-center text-muted mb-5 fw-medium">Trusted by innovative agencies worldwide</p>
          <div className="row justify-content-center align-items-center g-4 opacity-50">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="col-6 col-md-2 text-center">
                <div className="bg-white rounded-3 p-3 shadow-sm">
                  <span className="fw-bold text-dark">AGENCY {i}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section id="features" className="py-5 position-relative overflow-hidden">
        <div className="position-absolute top-50 start-0 translate-middle-y" style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(13,110,253,0.03) 0%, transparent 70%)',
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
              ✨ Powerful Features
            </span>
            <h2 className="display-6 fw-bold mb-3">Everything You Need to Get Approvals Fast</h2>
            <p className="lead text-muted mx-auto" style={{maxWidth: '700px'}}>
              Decidely combines simple sharing with clear feedback—so you can focus on creating, not chasing.
            </p>
          </motion.div>

          <div className="row g-4">
            <FeatureCard 
              icon={<FiLink size={28} />}
              title="Magic Links"
              description="Share work with one click. Clients review without creating accounts—no passwords needed. Links expire automatically for security."
              delay={0.1}
            />
            <FeatureCard 
              icon={<FiMessageSquare size={28} />}
              title="Clear Decisions"
              description="Approve, request changes, or block. No more ambiguous emails—clients choose exactly with one click."
              delay={0.2}
            />
            <FeatureCard 
              icon={<FiImage size={28} />}
              title="Rich Media Support"
              description="Upload images, videos, PDFs up to 50MB, or add external links. All file types work seamlessly in one place."
              delay={0.3}
            />
            <FeatureCard 
              icon={<FiUsers size={28} />}
              title="Client Management"
              description="Add clients to projects, track all feedback, and see approval history—everything organized by project."
              delay={0.4}
            />
            <FeatureCard 
              icon={<FiShield size={28} />}
              title="Enterprise Security"
              description="Magic links expire automatically. Your work stays safe with AWS S3 encryption and secure authentication."
              delay={0.5}
            />
            <FeatureCard 
              icon={<FiTrendingUp size={28} />}
              title="Real-time Updates"
              description="See client decisions the moment they're made. Never refresh to check status—instant notifications."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-5 bg-light">
        <div className="container py-5">
          <motion.div 
            className="text-center mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-3 py-2 rounded-pill mb-3">
              🚀 Simple 3-Step Process
            </span>
            <h2 className="display-6 fw-bold mb-3">How Decidely Works</h2>
            <p className="lead text-muted">From upload to approval in minutes, not days</p>
          </motion.div>

          <div className="row g-4 position-relative">
            {/* Connector line */}
            <div className="position-absolute top-50 start-0 w-100 d-none d-md-block" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #0d6efd, transparent)', transform: 'translateY(-50%)', zIndex: 0 }} />
            
            <StepCard 
              number="01"
              title="Create & Upload"
              description="Create approval items in any project. Upload images, videos, documents up to 50MB, or add external links."
              delay={0.1}
            />
            <StepCard 
              number="02"
              title="Share Magic Link"
              description="Generate a secure link and email it to your client. No account needed on their side—just one click to review."
              delay={0.2}
            />
            <StepCard 
              number="03"
              title="Get Clear Feedback"
              description="Clients click Approve, Changes, or Block with optional comments. You see decisions instantly in your dashboard."
              delay={0.3}
            />
          </div>

          <motion.div 
            className="text-center mt-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link to="/register" className="btn btn-primary btn-lg px-5 py-3 fw-semibold">
              Start Your Free Trial
              <FiArrowRight className="ms-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials */}
      {/* <section id="testimonials" className="py-5 bg-light">
        <div className="container py-5">
          <motion.div 
            className="text-center mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-3 py-2 rounded-pill mb-3">
              ⭐ Trusted by Agencies
            </span>
            <h2 className="display-6 fw-bold mb-3">Loved by Creatives</h2>
            <p className="lead text-muted">Join hundreds of agencies saving hours every week</p>
          </motion.div>

          <div className="row g-4">
            <TestimonialCard 
              quote="Decidely cut our client feedback time from days to hours. The magic links are genius—clients love that they don't need another account."
              author="Sarah Johnson"
              role="Creative Director, DesignStudio"
              rating={5}
              delay={0.1}
            />
            <TestimonialCard 
              quote="We were drowning in email chains. Decidely gave us a clean system where clients can actually make clear decisions. Game changer."
              author="Michael Chen"
              role="Founder, Chen Creative"
              rating={5}
              delay={0.2}
            />
            <TestimonialCard 
              quote="The free tier was perfect to test it out. Upgraded to Pro within a week. Best decision for our workflow this year."
              author="Priya Patel"
              role="Partner, Pixel & Co"
              rating={5}
              delay={0.3}
            />
          </div>
        </div>
      </section> */}

      {/* Final CTA */}
      <section className="py-5 position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #034cb9 0%, #0b5ed7 100%)'
      }}>
        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '30px 30px'
        }} />
        
        <div className="container position-relative py-5" style={{ zIndex: 1 }}>
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center text-white">
              <h2 className="display-6 fw-bold mb-4">Ready to Stop Chasing Approvals?</h2>
              <p className="lead mb-5 opacity-90">
                Join agencies who save 10+ hours every week with Decidely. Start your free trial today.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/register" className="btn btn-light btn-lg px-5 py-3 fw-semibold">
                  Get Started Free
                  <FiArrowRight className="ms-2" />
                </Link>
                <a href="#pricing" className="btn btn-outline-light btn-lg px-5 py-3 fw-semibold">
                  View Pricing
                </a>
              </div>
              <p className="mt-4 small opacity-75">
                No credit card required • Free forever plan included
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-4">
              <div className="d-flex align-items-center gap-2 mb-4">
                <span className="bg-primary text-white fw-bold rounded-3 p-2 fs-5">D</span>
                <span className="fw-bold fs-3 text-white">decidely</span>
              </div>
              <p className="text-white-50 mb-4">Simple approval workflows for agencies and their clients. Stop chasing, start creating.</p>
              {/* <div className="d-flex gap-3">
                <a href="#" className="text-white-50 hover-white"><FiTwitter size={20} /></a>
                <a href="#" className="text-white-50 hover-white"><FiLinkedin size={20} /></a>
                <a href="#" className="text-white-50 hover-white"><FiGithub size={20} /></a>
              </div> */}
            </div>
            
            <div className="col-lg-2 col-md-4">
              <h6 className="text-white fw-bold mb-4">Product</h6>
              <ul className="list-unstyled">
                <li className="mb-3"><a href="#features" className="text-white-50 text-decoration-none hover-white">Features</a></li>
                <li className="mb-3"><a href="#pricing" className="text-white-50 text-decoration-none hover-white">Pricing</a></li>
                <li className="mb-3"><a href="#how-it-works" className="text-white-50 text-decoration-none hover-white">How It Works</a></li>
                {/* <li className="mb-3"><a href="#testimonials" className="text-white-50 text-decoration-none hover-white">Testimonials</a></li> */}
            </ul>
            </div>
            
            <div className="col-lg-2 col-md-4">
              <h6 className="text-white fw-bold mb-4">Company</h6>
              <ul className="list-unstyled">
                <li className="mb-3"><a href="/about" className="text-white-50 text-decoration-none hover-white">About</a></li>
                {/* <li className="mb-3"><a href="/blog" className="text-white-50 text-decoration-none hover-white">Blog</a></li>
                <li className="mb-3"><a href="/careers" className="text-white-50 text-decoration-none hover-white">Careers</a></li> */}
                <li className="mb-3"><a href="/contact" className="text-white-50 text-decoration-none hover-white">Contact</a></li>
              </ul>
            </div>
            
            
          </div>
          
          <hr className="border-secondary mt-5 mb-4" />
          
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="text-white-50 small mb-0">
                © 2026 Decidely. All rights reserved. Made with ❤️ for agencies.
              </p>
            </div>
            
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper Components with animations
const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div 
    className="col-md-4"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
  >
    <div className="card h-100 border-0 shadow-hover rounded-4 p-3">
      <div className="card-body">
        <div className="bg-primary bg-opacity-10 text-primary rounded-3 d-inline-flex p-3 mb-4">
          {icon}
        </div>
        <h5 className="card-title fw-bold fs-5 mb-3">{title}</h5>
        <p className="card-text text-muted mb-0">{description}</p>
      </div>
    </div>
  </motion.div>
);

const StepCard = ({ number, title, description, delay }) => (
  <motion.div 
    className="col-md-4 position-relative"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
  >
    <div className="card h-100 border-0 bg-transparent">
      <div className="card-body text-center p-4">
        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px', fontSize: '28px', fontWeight: 'bold' }}>
          {number}
        </div>
        <h5 className="fw-bold fs-5 mb-3">{title}</h5>
        <p className="text-muted mb-0">{description}</p>
      </div>
    </div>
  </motion.div>
);

const TestimonialCard = ({ quote, author, role, rating, delay }) => (
  <motion.div 
    className="col-md-4"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
  >
    <div className="card h-100 border-0 shadow-hover rounded-4">
      <div className="card-body p-4">
        <div className="d-flex gap-1 text-warning mb-3">
          {[...Array(rating)].map((_, i) => (
            <FiStar key={i} size={18} fill="currentColor" />
          ))}
        </div>
        <p className="text-muted mb-4">"{quote}"</p>
        <div className="d-flex align-items-center">
          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', fontSize: '18px', fontWeight: 'bold' }}>
            {author.charAt(0)}
          </div>
          <div>
            <h6 className="fw-bold mb-1">{author}</h6>
            <small className="text-muted">{role}</small>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default LandingPage;