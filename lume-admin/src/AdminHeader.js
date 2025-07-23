import React from 'react';

function AdminHeader() {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="LumeStock Logo" />
        <span>LumeStock Admin</span>
      </div>
      {/* Add navigation items here if needed */}
    </aside>
  );
}

export default AdminHeader;
