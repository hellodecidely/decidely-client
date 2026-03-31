import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-vh-100 bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />
      <div className="d-flex">
        <Sidebar collapsed={sidebarCollapsed} />
        <main 
          className={`flex-grow-1 transition-all ${sidebarCollapsed ? 'ms-16' : 'ms-64'}`}
          style={{ paddingTop: '70px' }}
        >
          <div className="container-fluid py-4 px-3 px-md-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;