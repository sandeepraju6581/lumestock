import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  FaImages,
  FaUsers,
  FaChartLine,
  FaDownload,
  FaPlus,
  FaEye
} from 'react-icons/fa';

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600 text-lg">Welcome to your LumeStock admin dashboard</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                <FaPlus className="mr-2" /> Add Product
              </button>
              <button className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <FaEye className="mr-2" /> View Store
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
                <div className="text-gray-600 text-sm font-medium">Total Products</div>
                <div className="text-green-500 text-xs font-semibold mt-1">+1 this week</div>
              </div>
              <FaImages className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalDownloads}</div>
                <div className="text-gray-600 text-sm font-medium">Total Downloads</div>
                <div className="text-green-500 text-xs font-semibold mt-1">+{Math.floor(Math.random() * 50)} this month</div>
              </div>
              <FaDownload className="text-4xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.activeUsers}</div>
                <div className="text-gray-600 text-sm font-medium">Active Users</div>
                <div className="text-green-500 text-xs font-semibold mt-1">+{Math.floor(Math.random() * 10)} today</div>
              </div>
              <FaUsers className="text-4xl text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">${stats.recentSales}</div>
                <div className="text-gray-600 text-sm font-medium">Revenue</div>
                <div className="text-green-500 text-xs font-semibold mt-1">+${Math.floor(Math.random() * 200)} this week</div>
              </div>
              <FaChartLine className="text-4xl text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Recent Products</h2>
                <button className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all duration-200">
                  View All
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentProducts.length > 0 ? recentProducts.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{product.title}</div>
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${product.new_price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Top Downloads</h2>
                <button className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all duration-200">
                  View Analytics
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topDownloads.length > 0 ? topDownloads.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{product.title}</div>
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{product.downloads || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">
                          ${((product.new_price || 0) * (product.downloads || 0)).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <FaChartLine className="mr-1" /> Trending
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        No download data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <FaPlus className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New Product</h3>
              <p className="text-gray-600 text-sm mb-4">Upload and manage your digital products</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Get Started
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <FaImages className="text-4xl text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Products</h3>
              <p className="text-gray-600 text-sm mb-4">Edit, update, or remove existing products</p>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                View Products
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <FaDownload className="text-4xl text-yellow-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bulk Upload</h3>
              <p className="text-gray-600 text-sm mb-4">Upload multiple products at once</p>
              <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200">
                Bulk Upload
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <FaChartLine className="text-4xl text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm mb-4">View detailed sales and download reports</p>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
