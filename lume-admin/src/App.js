import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';
import AdminFooter from './components/AdminFooter';
import AdminUpload from './AdminUpload';
import AdminProducts from './AdminProducts';
import AdminBulkUpload from './pages/AdminBulkUpload';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { initializeStorage } from './storageUtils';
import './App.css';
import './components/common.css';

function App() {
  useEffect(() => {
    const setupStorage = async () => {
      console.log('Checking storage setup...');
      try {
        await initializeStorage();
      } catch (error) {
        console.warn('Storage initialization warning:', error.message);
        console.log('App will continue to run. Upload functionality depends on Supabase bucket configuration.');
      }
    };

    setupStorage();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <div className="admin-app">
                <AdminNavbar />
                <div className="admin-content-wrapper">
                  <main className="admin-main">
                    <Dashboard />
                  </main>
                  <AdminFooter />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="admin-app">
                <AdminNavbar />
                <div className="admin-content-wrapper">
                  <main className="admin-main">
                    <Navigate to="/admin/dashboard" replace />
                  </main>
                  <AdminFooter />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/upload"
          element={
            <ProtectedRoute>
              <div className="admin-app">
                <AdminNavbar />
                <div className="admin-content-wrapper">
                  <main className="admin-main">
                    <AdminUpload />
                  </main>
                  <AdminFooter />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <div className="admin-app">
                <AdminNavbar />
                <div className="admin-content-wrapper">
                  <main className="admin-main">
                    <AdminProducts />
                  </main>
                  <AdminFooter />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bulk-upload"
          element={
            <ProtectedRoute>
              <div className="admin-app">
                <AdminNavbar />
                <div className="admin-content-wrapper">
                  <main className="admin-main">
                    <AdminBulkUpload />
                  </main>
                  <AdminFooter />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;