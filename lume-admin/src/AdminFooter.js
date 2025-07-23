import React from 'react';

function AdminFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <p className="text-center text-gray-600">&copy; {new Date().getFullYear()} LumeStock Admin Panel</p>
      </div>
    </footer>
  );
}

export default AdminFooter;
