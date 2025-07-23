import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './AdminProducts.css';

function AdminProducts() {
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
      <div className="admin-products-page">
        <div className="admin-products-loading">
          <div className="loading-spinner">⏳</div>
          <h3>Loading products...</h3>
          <p>Please wait while we fetch your products</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-products-page">
        <div className="admin-products-error">
          <div className="error-icon">❌</div>
          <h3>Error Loading Products</h3>
          <p>{error}</p>
          <button onClick={fetchProducts} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-products-page">
      {/* Top Bar */}
      <nav className="admin-top-bar">
        <div className="admin-top-bar-left">
          <h1>🎨 LumeStock Admin</h1>
        </div>
        <div className="admin-top-bar-right">
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="admin-actions">
            <a href="/admin/upload" className="add-product-btn">
              <span>➕</span>
              Add Product
            </a>
            <div className="admin-profile">
              <button className="profile-button">
                <span className="profile-icon">👤</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Stats Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-info">
              <h3>Total Products</h3>
              <div className="number">{products.length}</div>
              <div className="stat-trend">+{filteredProducts.length} filtered</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🆓</div>
          <div className="stat-content">
            <div className="stat-info">
              <h3>Free Products</h3>
              <div className="number">{products.filter(p => p.license === 'free').length}</div>
              <div className="stat-trend">{products.length > 0 ? ((products.filter(p => p.license === 'free').length / products.length) * 100).toFixed(1) : 0}% of total</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💎</div>
          <div className="stat-content">
            <div className="stat-info">
              <h3>Premium Products</h3>
              <div className="number">{products.filter(p => p.license === 'premium').length}</div>
              <div className="stat-trend">{products.length > 0 ? ((products.filter(p => p.license === 'premium').length / products.length) * 100).toFixed(1) : 0}% of total</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-info">
              <h3>Total Value</h3>
              <div className="number">${getTotalRevenue().toFixed(2)}</div>
              <div className="stat-trend">Avg: ${getAveragePrice().toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📂</div>
          <div className="stat-content">
            <div className="stat-info">
              <h3>Categories</h3>
              <div className="number">{getUniqueCategories().length}</div>
              <div className="stat-trend">Active categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={licenseFilter}
            onChange={(e) => setLicenseFilter(e.target.value)}
          >
            <option value="">All Licenses</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <div className="filter-group">
          <button
            className="filter-select"
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

      {/* Products Grid */}
      <div className="products-container">
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-thumbnail">
                <img src={product.thumbnail} alt={product.title} />
                <div className="product-overlay"></div>
                <div className="product-license-badge">
                  {product.license === 'free' ? '🆓' : '💎'} {product.license}
                </div>
                <div className="quick-actions">
                  <button
                    className="quick-action-btn"
                    onClick={() => window.open(product.file_url, '_blank')}
                    title="Download"
                  >
                    ⬇️
                  </button>
                  <button
                    className="quick-action-btn"
                    onClick={() => handleEdit(product)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="quick-action-btn"
                    onClick={() => handleDelete(product.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="product-info">
                <h4>{product.title}</h4>
                <p className="product-description">{product.description}</p>
                <div className="product-meta">
                  <div className="product-price">
                    {product.old_price && (
                      <span className="old-price">${product.old_price}</span>
                    )}
                    <span className="new-price">${product.new_price}</span>
                  </div>
                  <span className="product-category">{product.category}</span>
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div className="product-tags">
                    {product.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                    {product.tags.length > 3 && (
                      <span className="tag">+{product.tags.length - 3} more</span>
                    )}
                  </div>
                )}
                <div className="product-actions">
                  <a
                    href={product.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn download-btn"
                  >
                    ⬇️ Download
                  </a>
                  <button
                    onClick={() => handleEdit(product)}
                    className="action-btn edit-btn"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="action-btn delete-btn"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="no-products">
            <div className="no-products-icon">📦</div>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && editingProduct && (
        <div className="modal">
          <div className="modal-content">
            <h2>✏️ Edit Product</h2>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div>
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editingProduct.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={editingProduct.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="full-width">
                  <label>Thumbnail URL</label>
                  <input
                    type="text"
                    name="thumbnail"
                    value={editingProduct.thumbnail}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="full-width">
                  <label>File URL</label>
                  <input
                    type="text"
                    name="file_url"
                    value={editingProduct.file_url}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label>License</label>
                  <select
                    name="license"
                    value={editingProduct.license}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label>Old Price</label>
                  <input
                    type="number"
                    name="old_price"
                    value={editingProduct.old_price || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>New Price</label>
                  <input
                    type="number"
                    name="new_price"
                    value={editingProduct.new_price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={editingProduct.category}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="full-width">
                  <label>Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={editingProduct.tags}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">💾 Save Changes</button>
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">❌ Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;