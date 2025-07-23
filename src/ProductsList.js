import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './ProductsList.css';

function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

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

      // Refresh the products list
      fetchProducts();
    } catch (err) {
      setError('Failed to delete product: ' + err.message);
    }
  };

  if (loading) {
    return <div className="products-list-loading">Loading products...</div>;
  }

  if (error) {
    return <div className="products-list-error">{error}</div>;
  }

  return (
    <div className="products-list">
      <h3>Uploaded Products</h3>
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-thumbnail">
              <img src={product.thumbnail} alt={product.title} />
            </div>
            <div className="product-info">
              <h4>{product.title}</h4>
              <p className="product-description">{product.description}</p>
              <div className="product-details">
                <span className="product-price">
                  {product.old_price && (
                    <span className="old-price">${product.old_price}</span>
                  )}
                  <span className="new-price">${product.new_price}</span>
                </span>
                <span className="product-category">{product.category}</span>
                <span className="product-license">{product.license}</span>
              </div>
              {product.tags && product.tags.length > 0 && (
                <div className="product-tags">
                  {product.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              <div className="product-actions">
                <a href={product.file_url} target="_blank" rel="noopener noreferrer" className="download-btn">
                  Download
                </a>
                <button onClick={() => handleDelete(product.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsList;
