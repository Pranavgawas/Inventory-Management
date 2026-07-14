import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cartAPI } from '../../services/api';
import { getGuestCart, clearGuestCart } from '../../utils/GuestCart';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && user.role === 'customer') {
      navigate('/products', { replace: true });
    }
  }, [user, navigate]);

  const migrateGuestCart = async () => {
    try {
      const guestCart = getGuestCart();
      
      if (guestCart.items.length > 0) {
        // Add each guest cart item to user's cart
        for (const item of guestCart.items) {
          await cartAPI.addItem({
            productId: item.product._id,
            quantity: item.quantity
          });
        }
        
        // Clear guest cart after successful migration
        clearGuestCart();
        toast.success(`${guestCart.items.length} item(s) added to your cart!`);
      }
    } catch (error) {
      console.error('Error migrating cart:', error);
      // Don't show error to user, just log it
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      
      // Migrate guest cart after successful login
      await migrateGuestCart();
      
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <LogIn size={48} className="auth-icon" />
          <h1>Welcome Back</h1>
          <p>Login to continue shopping</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>
              <Mail size={18} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={18} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
