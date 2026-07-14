import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cartAPI, ordersAPI } from '../../services/api';
import { getGuestCart, updateGuestCartItem, removeFromGuestCart, clearGuestCart } from '../../utils/GuestCart';
import toast from 'react-hot-toast';
import { Trash2, AlertCircle, ShoppingBag, CreditCard, Minus, Plus, LogIn, Package, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ShoppingCart.css';

const ShoppingCart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [user]);

  // Removed problematic useEffect [cart] that caused resets

  const fetchCart = async () => {
    try {
      let cartData;
      if (user) {
        const response = await cartAPI.get();
        cartData = response.data;
      } else {
        cartData = getGuestCart();
      }
      setCart(cartData);
      
      // Initialize selection to all items only if not already initialized
      // Or we can just default to all items on every fresh fetch to ensure sync
      // But preserving selection is better usually. 
      // Given the 'bug' report, user likely wants stable selection.
      // But we must support initial 'Select All'.
      if (cartData && cartData.items.length > 0) {
         // Only set if we don't have a selection, or if new items appeared?
         // For simplicity and fixing the bug: simple initialization.
         // We will check if we should reset.
         setSelectedItems(prev => {
             if (prev.length === 0) return cartData.items.map(item => item._id);
             return prev;
         });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      if (user) {
        const response = await cartAPI.updateItem(itemId, { quantity: newQuantity });
        setCart(response.data);
        toast.success('Cart updated');
      } else {
        const updatedCart = updateGuestCartItem(itemId, newQuantity);
        setCart(updatedCart);
        toast.success('Cart updated');
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      if (user) {
        const response = await cartAPI.removeItem(itemId);
        setCart(response.data);
      } else {
        const updatedCart = removeFromGuestCart(itemId);
        setCart(updatedCart);
      }
      setSelectedItems(selectedItems.filter(id => id !== itemId));
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleCheckoutClick = () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to checkout');
      return;
    }

    setShowPaymentModal(true);
  };

  const handleConfirmOrder = async () => {
    try {
      console.log('Selected Items:', selectedItems);
      console.log('Selected Items (stringified):', JSON.stringify(selectedItems));
      console.log('Cart Items:', cart.items.map(i => ({ id: i._id, name: i.product?.name })));
      
      await ordersAPI.create({ 
        paymentMethod,
        selectedItems
      });
      
      toast.success('Order placed successfully!');
      setShowPaymentModal(false);
      navigate('/orders');
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.response?.data?.msg || 'Failed to place order');
    }
  };

  if (loading) return <div className="loading">Loading cart...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="empty-cart">
        <ShoppingBag size={64} />
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-browse">Browse Products</Link>
      </div>
    );
  }

  // Calculate total only for selected items
  const selectedCartItems = cart.items.filter(item => selectedItems.includes(item._id));
  const total = selectedCartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <div className="shopping-cart">
      <h1>Shopping Cart</h1>

      {!user && (
        <div className="guest-notice">
          <AlertCircle size={20} />
          <span>You're shopping as a guest. <Link to="/login">Login</Link> to checkout.</span>
        </div>
      )}

      <div className="cart-content">
        <div className="cart-items">
          {cart.items.map(item => (
            <div key={item._id} className={`cart-item ${selectedItems.includes(item._id) ? 'selected' : ''}`}>
              <div className="item-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectedItems.includes(item._id)}
                  onChange={() => toggleItemSelection(item._id)}
                />
              </div>
              <div className="item-image-placeholder">
                <Package size={32} />
              </div>
              <div className="item-details">
                <h3>{item.product?.name || 'Product'}</h3>
                <p className="item-sku">SKU: {item.product?.sku || 'N/A'}</p>
                <div className="mobile-price-row">
                    <p className="item-price">₹{(item.product?.price || item.price || 0).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="item-actions">
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                <div className="item-subtotal">
                  ₹{((item.product?.price || item.price || 0) * item.quantity).toLocaleString()}
                </div>
                <button onClick={() => removeItem(item._id)} className="btn-remove">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal ({selectedItems.length} items)</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>

          <button onClick={handleCheckoutClick} className="btn-checkout" disabled={selectedItems.length === 0}>
            {user ? `Checkout Selected` : `Login to Checkout`}
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="payment-modal">
            <div className="modal-header">
              <h2>Confirm Payment</h2>
              <button className="close-modal" onClick={() => setShowPaymentModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-review">
                <h3>Review Items</h3>
                {selectedCartItems.map(item => (
                  <div key={item._id} className="review-item">
                    <span>{item.product?.name} <small>(x{item.quantity})</small></span>
                    <span>₹{((item.product?.price || item.price || 0) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="review-total">
                  <span>Total Amount</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <h3>Select Payment Method</h3>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'Cash' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="Cash" 
                    checked={paymentMethod === 'Cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="radio-custom"></span>
                  <span>Cash on Delivery</span>
                </label>
                
                <label className={`payment-option ${paymentMethod === 'Card' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="Card" 
                    checked={paymentMethod === 'Card'} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="radio-custom"></span>
                  <span>Credit/Debit Card</span>
                </label>

                <label className={`payment-option ${paymentMethod === 'UPI' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="UPI" 
                    checked={paymentMethod === 'UPI'} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="radio-custom"></span>
                  <span>UPI</span>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleConfirmOrder}>
                Confirm Order ₹{total.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
