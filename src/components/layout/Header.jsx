import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiMenu, FiSearch, FiLogOut, FiX, FiFolder, 
  FiCheckSquare, FiArrowRight, FiUser
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { APP_NAME } from '../../utils/constants';
import { projectAPI } from '../../services/api/project';
import { approvalAPI } from '../../services/api/approval';
import { useDebounce } from '../../hooks/useDebounce';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ projects: [], approvals: [] });
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Search effect
  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      performSearch();
    } else {
      setSearchResults({ projects: [], approvals: [] });
    }
  }, [debouncedSearch]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async () => {
    if (!debouncedSearch || debouncedSearch.length < 2) return;
    
    setLoading(true);
    try {
      // Search projects
      const projectsRes = await projectAPI.getProjects();
      const filteredProjects = projectsRes.success 
        ? projectsRes.data.filter(p => 
            p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            p.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
          ).slice(0, 5)
        : [];

      // Search approvals
      const approvalsRes = await approvalAPI.getAllApprovals();
      const filteredApprovals = approvalsRes.success
        ? approvalsRes.data.filter(a =>
            a.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            a.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
          ).slice(0, 5)
        : [];

      setSearchResults({
        projects: filteredProjects,
        approvals: filteredApprovals
      });
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults({ projects: [], approvals: [] });
    setShowResults(false);
  };

  const handleSearchFocus = () => {
    if (searchQuery.length >= 2) {
      setShowResults(true);
    }
  };

  const handleResultClick = (type, id) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(`/${type}/${id}`);
  };

  const handleViewAllResults = () => {
    setShowResults(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Get initials for avatar
  const getInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="bg-white shadow-sm border-bottom fixed-top" style={{ zIndex: 1030 }}>
      <div className="container-fluid px-3">
        <div className="d-flex align-items-center justify-content-between" style={{ height: '64px' }}>
          {/* Left Section - Logo and Menu */}
          <div className="d-flex align-items-center">
            <button
              onClick={toggleSidebar}
              className="btn btn-link text-dark p-1 me-3 d-lg-none"
              style={{ minWidth: '32px' }}
            >
              <FiMenu size={20} />
            </button>
            
            <Link to="/dashboard" className="text-decoration-none d-flex align-items-center">
              <span className="fw-bold text-primary" style={{ fontSize: '1.25rem' }}>{APP_NAME}</span>
            </Link>
          </div>

          {/* Center Section - Search Bar */}
          <div className="flex-grow-1 mx-4" style={{ maxWidth: '500px' }} ref={searchRef}>
            <div className="position-relative">
              <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" size={16} />
              <input
                type="search"
                className="form-control form-control-sm border-0 bg-light rounded-pill ps-5 pe-5"
                placeholder="Search projects, approvals..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                style={{ height: '38px' }}
              />
              {searchQuery && (
                <button
                  className="position-absolute top-50 end-0 translate-middle-y btn btn-link text-secondary p-0 me-2"
                  onClick={handleClearSearch}
                  style={{ lineHeight: 1 }}
                >
                  <FiX size={16} />
                </button>
              )}

              {/* Search Results Dropdown */}
              {showResults && (searchResults.projects.length > 0 || searchResults.approvals.length > 0) && (
                <div className="position-absolute w-100 mt-2 bg-white shadow-lg rounded-3 border" style={{ zIndex: 1050 }}>
                  <div className="p-2">
                    {/* Projects */}
                    {searchResults.projects.map(project => (
                      <button
                        key={project._id}
                        className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2"
                        onClick={() => handleResultClick('projects', project._id)}
                      >
                        <FiFolder className="text-primary" size={14} />
                        <div className="flex-grow-1">
                          <div className="fw-semibold small">{project.name}</div>
                          {project.description && (
                            <small className="text-muted">{project.description.substring(0, 40)}...</small>
                          )}
                        </div>
                      </button>
                    ))}

                    {/* Approvals */}
                    {searchResults.approvals.map(approval => (
                      <button
                        key={approval._id}
                        className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2"
                        onClick={() => handleResultClick('approvals', approval._id)}
                      >
                        <FiCheckSquare className="text-success" size={14} />
                        <div className="flex-grow-1">
                          <div className="fw-semibold small">{approval.title}</div>
                          <small className="text-muted">{approval.project?.name}</small>
                        </div>
                      </button>
                    ))}

                    {/* View All */}
                    <div className="border-top mt-2 pt-2">
                      <button
                        className="dropdown-item d-flex align-items-center justify-content-between text-primary py-2 px-3 rounded-2"
                        onClick={handleViewAllResults}
                      >
                        <span className="small fw-semibold">View all results</span>
                        <FiArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="position-absolute w-100 mt-2 bg-white shadow-lg rounded-3 border p-3 text-center">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className="ms-2 text-muted small">Searching...</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - User Info and Logout */}
          <div className="d-flex align-items-center gap-3">
            <Link to="/about" className="nav-link px-3 fw-medium text-dark">
    About
  </Link>
            <Link to="/contact" className="nav-link px-3 fw-medium text-dark">
    Contact
  </Link>
            <Link to="/pricing" className="nav-link px-3 fw-medium text-dark">
    Pricing
  </Link>
            {/* User Profile - All in one line */}
            <div className="d-flex align-items-center gap-2">
              {/* Profile Picture */}
              <div 
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '36px', height: '36px', fontSize: '16px', fontWeight: '500' }}
              >
                {getInitials()}
              </div>

              
              {/* Name and Company - Hidden on mobile */}
              <div className="d-none d-md-block">
                <div className="fw-semibold small">{user?.name || 'User'}</div>
                <div className="text-muted small" style={{ fontSize: '11px', lineHeight: 1.2 }}>
                  {user?.company || 'Agency'}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn btn-link text-secondary p-0 d-flex align-items-center"
              title="Logout"
              style={{ minWidth: '32px' }}
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;