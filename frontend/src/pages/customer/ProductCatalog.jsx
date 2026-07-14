import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productsAPI, cartAPI } from '../../services/api';
import { addToGuestCart } from '../../utils/GuestCart';
import toast from 'react-hot-toast';
import { ShoppingCart, Search, Filter, Package } from 'lucide-react';
import './ProductCatalog.css';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
      
      const uniqueCategories = [...new Set(response.data.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const addToCart = async (product) => {
    try {
      if (user) {
        // Authenticated user - use API
        await cartAPI.addItem({
          productId: product._id,
          quantity: 1
        });
        toast.success(`${product.name} added to cart!`);
      } else {
        // Guest user - use localStorage
        addToGuestCart(product, 1);
        toast.success(
          <div>
            <div>{product.name} added to cart!</div>
            <button
              onClick={() => navigate('/login')}
              style={{
                marginTop: '8px',
                padding: '4px 12px',
                background: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Login to checkout
            </button>
          </div>,
          { duration: 4000 }
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to add to cart');
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', class: 'out-of-stock' };
    if (quantity <= 10) return { text: `Low Stock (${quantity})`, class: 'low-stock' };
    return { text: `In Stock (${quantity})`, class: 'in-stock' };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Package size={48} className="loading-icon" />
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="product-catalog">
      <div className="catalog-header">
        <div className="header-content">
          <h1>Discover Our Products</h1>
          <p>Browse our collection and find what you need</p>
        </div>

        <div className="filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-filter">
            <Filter size={20} />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <Package size={64} />
            <p>No products found</p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const stockStatus = getStockStatus(product.quantity);
            return (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  <Package size={48} />
                </div>
                
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="sku">SKU: {product.sku}</p>
                  <p className="description">{product.description}</p>
                  
                  <div className="product-meta">
                    <span className="category-badge">{product.category}</span>
                    <span className={`stock-status ${stockStatus.class}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                </div>

                <div className="product-footer">
                  <span className="price">₹{product.price.toLocaleString()}</span>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.quantity === 0}
                    className="add-to-cart-btn"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
