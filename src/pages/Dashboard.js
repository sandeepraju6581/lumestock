import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  FaShoppingCart,
  FaImages,
  FaUsers,
  FaChartLine,
  FaDownload
} from 'react-icons/fa';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalDownloads: 0,
    activeUsers: 0,
    recentSales: 0
  });

  const [recentProducts, setRecentProducts] = useState([]);
  const [topDownloads, setTopDownloads] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact' });

      // Fetch recent products
      const { data: recent } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch top downloaded products
      const { data: popular } = await supabase
        .from('products')
        .select('*')
        .order('downloads', { ascending: false })
        .limit(5);

      // Update stats
      setStats({
        totalProducts: productsCount || 0,
        totalDownloads: popular?.reduce((sum, product) => sum + (product.downloads || 0), 0) || 0,
        activeUsers: Math.floor(Math.random() * 100), // Replace with actual user stats
        recentSales: Math.floor(Math.random() * 1000) // Replace with actual sales data
      });

      setRecentProducts(recent || []);
      setTopDownloads(popular || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error.message);
    }
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Welcome to your admin dashboard</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaImages />
          </div>
          <div className="stat-details">
            <h3>Total Products</h3>
            <p className="stat-value">{stats.totalProducts}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaDownload />
          </div>
          <div className="stat-details">
            <h3>Total Downloads</h3>
            <p className="stat-value">{stats.totalDownloads}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-details">
            <h3>Active Users</h3>
            <p className="stat-value">{stats.activeUsers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <div className="stat-details">
            <h3>Recent Sales</h3>
            <p className="stat-value">${stats.recentSales}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Recent Products</h2>
          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Date Added</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map(product => (
                  <tr key={product.id}>
                    <td>{product.title}</td>
                    <td>${product.price}</td>
                    <td>{new Date(product.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Top Downloads</h2>
          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Downloads</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topDownloads.map(product => (
                  <tr key={product.id}>
                    <td>{product.title}</td>
                    <td>{product.downloads || 0}</td>
                    <td>${(product.price * (product.downloads || 0)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
