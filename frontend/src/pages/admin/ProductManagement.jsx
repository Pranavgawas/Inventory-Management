import React, { useState, useEffect } from 'react';
import { productsAPI } from '../../services/api';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setNewProduct({
      name: '',
      sku: '',
      description: '',
      price: '',
      quantity: '',
      category: ''
    });
  };

  const handleSaveNew = async () => {
    try {
      await productsAPI.create(newProduct);
      setMessage('Product added successfully!');
      setTimeout(() => setMessage(''), 3000);
      setNewProduct(null);
      fetchProducts();
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Failed to add product');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
  };

  const handleSaveEdit = async () => {
    try {
      await productsAPI.update(editingProduct._id, editingProduct);
      setMessage('Product updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Failed to update product');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productsAPI.delete(id);
      setMessage('Product deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchProducts();
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Failed to delete product');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="product-management">
      <div className="header">
        <h1>Product Management</h1>
        <button onClick={handleAdd} className="add-btn">
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {message && <div className="message">{message}</div>}

      {newProduct && (
        <div className="product-form">
          <h3>Add New Product</h3>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="SKU"
              value={newProduct.sku}
              onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
            />
            <input
              type="text"
              placeholder="Category"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="full-width"
            />
          </div>
          <div className="form-actions">
            <button onClick={handleSaveNew} className="save-btn">
              <Save size={18} />
              Save
            </button>
            <button onClick={() => setNewProduct(null)} className="cancel-btn">
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              editingProduct && editingProduct._id === product._id ? (
                <tr key={product._id} className="editing-row">
                  <td>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editingProduct.sku}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editingProduct.quantity}
                      onChange={(e) => setEditingProduct({ ...editingProduct, quantity: e.target.value })}
                    />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={handleSaveEdit} className="save-btn-small">
                        <Save size={16} />
                      </button>
                      <button onClick={() => setEditingProduct(null)} className="cancel-btn-small">
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td><span className="category-badge">{product.category}</span></td>
                  <td className="price">₹{product.price.toLocaleString()}</td>
                  <td>
                    <span className={`stock-badge ${product.quantity === 0 ? 'out' : product.quantity <= 10 ? 'low' : 'good'}`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleEdit(product)} className="edit-btn">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="delete-btn">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;
