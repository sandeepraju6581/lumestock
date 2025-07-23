import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
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
    <nav className="bg-white shadow-lg border-r border-gray-200 w-64 fixed left-0 top-0 h-full z-40">
      <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
        <img src={logo} alt="LumeStock Admin" className="w-10 h-10" />
        <span className="text-xl font-bold text-blue-900">LumeStock</span>
      </div>
      <ul className="py-4 space-y-2">
        <li>
          <Link 
            to="/admin/dashboard" 
            className={`flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors duration-200 ${
              isActive('/admin/dashboard') ? 'bg-blue-100 text-blue-900 border-r-4 border-blue-600' : ''
            }`}
          >
            <FaChartBar className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link 
            to="/admin/products" 
            className={`flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors duration-200 ${
              isActive('/admin/products') ? 'bg-blue-100 text-blue-900 border-r-4 border-blue-600' : ''
            }`}
          >
            <FaBoxOpen className="w-5 h-5" />
            <span className="font-medium">Products</span>
          </Link>
        </li>
        <li>
          <Link 
            to="/admin/upload" 
            className={`flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors duration-200 ${
              isActive('/admin/upload') ? 'bg-blue-100 text-blue-900 border-r-4 border-blue-600' : ''
            }`}
          >
            <FaUpload className="w-5 h-5" />
            <span className="font-medium">Upload</span>
          </Link>
        </li>
        <li>
          <Link 
            to="/admin/bulk-upload" 
            className={`flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors duration-200 ${
              isActive('/admin/bulk-upload') ? 'bg-blue-100 text-blue-900 border-r-4 border-blue-600' : ''
            }`}
          >
            <FaFileUpload className="w-5 h-5" />
            <span className="font-medium">Bulk Upload</span>
          </Link>
        </li>
        <li className="pt-4 border-t border-gray-200 mt-4">
          <button 
            onClick={handleLogout} 
            className="flex items-center space-x-3 px-6 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default AdminNavbar;
