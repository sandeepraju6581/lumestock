import React from 'react';
import './AdminFooter.css';

function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="admin-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/admin/products">Manage Products</a></li>
            <li><a href="/admin/upload">Upload Product</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="#">Documentation</a></li>
            <li><a href="#">Help Center</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {currentYear} Lumestock Admin. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default AdminFooter;
