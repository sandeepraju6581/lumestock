import React from 'react';

function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/admin/products" className="text-gray-600 hover:text-blue-600 transition-colors">Manage Products</a></li>
              <li><a href="/admin/upload" className="text-gray-600 hover:text-blue-600 transition-colors">Upload Product</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Help Center</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-6 mt-8">
          <p className="text-center text-gray-600">&copy; {currentYear} Lumestock Admin. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default AdminFooter;
