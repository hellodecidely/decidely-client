import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiFolder, 
  FiCheckSquare, 
  FiUsers, 
  FiSettings,
  FiLink,
  FiFileText,
  FiExternalLink,
  FiBarChart2
} from 'react-icons/fi';
import { APP_NAME } from '../../utils/constants';

const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/workspaces', icon: <FiFolder />, label: 'Workspaces' },
    { path: '/projects', icon: <FiFileText />, label: 'Projects' },
    { path: '/approvals', icon: <FiCheckSquare />, label: 'Approvals' },
    { path: '/magic-links', icon: <FiLink />, label: 'Magic Links' },
    { path: '/clients', icon: <FiExternalLink />, label: 'Clients' }, // Changed to /clients
    { path: '/settings', icon: <FiSettings />, label: 'Settings' },
    { path: '/usage', icon: <FiBarChart2 />, label: 'Usage & Limits' },
  ];

  return (
    <aside 
      className={`bg-white border-end shadow-sm fixed-start h-100 transition-all ${collapsed ? 'w-16' : 'w-64'}`}
      style={{ paddingTop: '70px', zIndex: 1020 }}
    >
      {/* Brand - Only show when not collapsed */}
      {!collapsed && (
        <div className="p-4 border-bottom">
          <h2 className="h5 fw-bold text-primary mb-0">{APP_NAME}</h2>
          <p className="text-muted small mb-0">Agency Approval System</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-3">
        <ul className="nav nav-pills flex-column">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item mb-1">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center gap-3 rounded-2 ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover-bg-gray-100'}`
                }
              >
                <span className="fs-5">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;