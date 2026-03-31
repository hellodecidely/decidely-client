import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../../utils/constants';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-vh-100 bg-gray-50 d-flex align-items-center justify-content-center p-3">
      <Container className="max-w-4xl">
        <Row className="align-items-center justify-content-center">
          {/* Left side - Branding & Info */}
          <Col lg={6} className="d-none d-lg-block pe-5">
            <div className="mb-5">
              <Link to="/" className="text-decoration-none">
                <h1 className="display-5 fw-bold text-primary mb-3">
                  {APP_NAME}
                </h1>
              </Link>
              <p className="text-muted mb-0">
                The simplest way for agencies to get client approvals
              </p>
            </div>

            <div className="mt-5">
              <h3 className="h4 fw-semibold mb-4">
                Stop chasing approvals. Start moving work forward.
              </h3>
              
              <div className="d-flex align-items-start mb-4">
                <div className="bg-primary text-white rounded-circle p-2 me-3">
                  <span className="fw-bold">1</span>
                </div>
                <div>
                  <h4 className="h6 fw-semibold mb-1">No login for clients</h4>
                  <p className="text-muted mb-0">
                    Clients review and approve with one simple link
                  </p>
                </div>
              </div>
              
              <div className="d-flex align-items-start mb-4">
                <div className="bg-primary text-white rounded-circle p-2 me-3">
                  <span className="fw-bold">2</span>
                </div>
                <div>
                  <h4 className="h6 fw-semibold mb-1">Clear approval status</h4>
                  <p className="text-muted mb-0">
                    Know exactly what's pending, approved, or needs changes
                  </p>
                </div>
              </div>
              
              <div className="d-flex align-items-start">
                <div className="bg-primary text-white rounded-circle p-2 me-3">
                  <span className="fw-bold">3</span>
                </div>
                <div>
                  <h4 className="h6 fw-semibold mb-1">Centralized feedback</h4>
                  <p className="text-muted mb-0">
                    No more lost feedback in emails, Slack, or WhatsApp
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-5 pt-5 border-top">
              <p className="text-muted small">
                Join thousands of agencies using {APP_NAME} to streamline their approval process
              </p>
            </div>
          </Col>
          
          {/* Right side - Auth Form */}
          <Col lg={6} xs={12} md={10}>
            <div className="bg-white rounded-3 shadow-lg p-4 p-md-5">
              <div className="text-center mb-5 d-lg-none">
                <Link to="/" className="text-decoration-none">
                  <h1 className="h2 fw-bold text-primary mb-2">
                    {APP_NAME}
                  </h1>
                </Link>
                <p className="text-muted">
                  The simplest way for agencies to get client approvals
                </p>
              </div>
              
              {title && (
                <div className="text-center mb-4">
                  <h2 className="h3 fw-bold text-gray-900 mb-2">{title}</h2>
                  {subtitle && (
                    <p className="text-muted mb-0">{subtitle}</p>
                  )}
                </div>
              )}
              
              {children}
            </div>
            
            <div className="text-center mt-4">
              <p className="text-muted small">
                © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AuthLayout;