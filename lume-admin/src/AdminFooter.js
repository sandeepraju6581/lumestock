import React from 'react';
import './AdminFooter.css';

function AdminFooter() {
  return (
    <footer className="admin-footer">
      <div className="admin-footer-container">
        &copy; {new Date().getFullYear()} LumeStock Admin Panel
      </div>
    </footer>
  );
}

export default AdminFooter;
