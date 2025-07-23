import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './AdminNavbar.css';
import { FaUpload, FaFileUpload, FaBoxOpen, FaSignOutAlt, FaChartBar } from 'react-icons/fa';

import logo from '../logo.svg';

function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="admin-sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="LumeStock Admin" />
        <span className="logo-text">LumeStock</span>
      </div>
      <ul className="sidebar-nav">
        <li className="nav-item">
          <Link 
            to="/admin/dashboard" 
            className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
          >
            <FaChartBar className="nav-icon" />
            <span>Dashboard</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            to="/admin/products" 
            className={`nav-link ${isActive('/admin/products') ? 'active' : ''}`}
          >
            <FaBoxOpen className="nav-icon" />
            <span>Products</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            to="/admin/upload" 
            className={`nav-link ${isActive('/admin/upload') ? 'active' : ''}`}
          >
            <FaUpload className="nav-icon" />
            <span>Upload</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            to="/admin/bulk-upload" 
            className={`nav-link ${isActive('/admin/bulk-upload') ? 'active' : ''}`}
          >
            <FaFileUpload className="nav-icon" />
            <span>Bulk Upload</span>
          </Link>
        </li>
        <li className="nav-item logout-item">
          <button onClick={handleLogout} className="nav-link logout-btn">
            <FaSignOutAlt className="nav-icon" />
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default AdminNavbar;
