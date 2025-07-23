import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [licenseFilter, setLicenseFilter] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, licenseFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (err) {
      setError('Failed to fetch products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.tags && product.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    if (licenseFilter) {
      filtered = filtered.filter(product => product.license === licenseFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      fetchProducts();
    } catch (err) {
      setError('Failed to delete product: ' + err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({ ...product, tags: product.tags?.join(',') || '' });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { id, title, description, thumbnail, file_url, license, old_price, new_price, category, tags } = editingProduct;
      const { error } = await supabase
        .from('products')
        .update({
          title,
          description,
          thumbnail,
          file_url,
          license,
          old_price: old_price ? parseFloat(old_price) : null,
          new_price: parseFloat(new_price),
          category,
          tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setShowModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      setError('Failed to update product: ' + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getUniqueCategories = () => {
    return [...new Set(products.map(product => product.category))].filter(Boolean);
  };

  const getTotalRevenue = () => {
    return products.reduce((total, product) => total + (product.new_price || 0), 0);
  };

  const getAveragePrice = () => {
    const totalPrice = products.reduce((total, product) => total + (product.new_price || 0), 0);
    return products.length > 0 ? (totalPrice / products.length) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">Loading products...</h3>
          <p className="text-gray-600">Please wait while we fetch your products</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-2xl font-semibold text-red-800 mb-2">Error Loading Products</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchProducts} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
              <p className="text-gray-600 mt-1">Manage your digital product inventory</p>
            </div>
            <div>
              <button 
                onClick={() => navigate('/admin/upload')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                ➕ Add Product
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-400 text-lg">🔍</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
                value={licenseFilter}
                onChange={(e) => setLicenseFilter(e.target.value)}
              >
                <option value="">All Licenses</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
              <button 
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setLicenseFilter('');
                }}
              >
                🔄 Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">{products.length}</div>
            <div className="text-sm font-medium text-gray-900 mb-1">Total Products</div>
            <div className="text-xs text-green-600">+{filteredProducts.length} filtered</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600 mb-2">{products.filter(p => p.license === 'free').length}</div>
            <div className="text-sm font-medium text-gray-900 mb-1">Free Products</div>
            <div className="text-xs text-gray-600">{products.length > 0 ? ((products.filter(p => p.license === 'free').length / products.length) * 100).toFixed(1) : 0}% of total</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">{products.filter(p => p.license === 'premium').length}</div>
            <div className="text-sm font-medium text-gray-900 mb-1">Premium Products</div>
            <div className="text-xs text-gray-600">{products.length > 0 ? ((products.filter(p => p.license === 'premium').length / products.length) * 100).toFixed(1) : 0}% of total</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-yellow-600 mb-2">${getTotalRevenue().toFixed(2)}</div>
            <div className="text-sm font-medium text-gray-900 mb-1">Total Value</div>
            <div className="text-xs text-gray-600">Avg: ${getAveragePrice().toFixed(2)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-indigo-600 mb-2">{getUniqueCategories().length}</div>
            <div className="text-sm font-medium text-gray-900 mb-1">Categories</div>
            <div className="text-xs text-gray-600">Active categories</div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Products ({filteredProducts.length})</h2>
              <button 
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setLicenseFilter('');
                }}
              >
                🔄 Clear Filters
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading products...</div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-600">{error}</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No products found</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="relative">
                      <img 
                        src={product.thumbnail} 
                        alt={product.title}
                        className="w-full h-48 object-cover"
                      />
                      <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                        product.license === 'free' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {product.license === 'free' ? '🆓 Free' : '💎 Premium'}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 text-lg">{product.title}</h4>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          {product.old_price && (
                            <span className="text-gray-400 line-through text-sm">
                              ${product.old_price}
                            </span>
                          )}
                          <span className="font-semibold text-blue-600 text-lg">${product.new_price}</span>
                        </div>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(product.file_url, '_blank')}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          ⬇️ Download
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {showModal && editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">✏️ Edit Product</h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      name="title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={editingProduct.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={editingProduct.description}
                      onChange={handleInputChange}
                      required
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <input
                      type="text"
                      name="category"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={editingProduct.category}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Old Price</label>
                      <input
                        type="number"
                        name="old_price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={editingProduct.old_price || ''}
                        onChange={handleInputChange}
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Price</label>
                      <input
                        type="number"
                        name="new_price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={editingProduct.new_price}
                        onChange={handleInputChange}
                        required
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License</label>
                    <select
                      name="license"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={editingProduct.license}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="submit" 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      💾 Save Changes
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)} 
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProducts;