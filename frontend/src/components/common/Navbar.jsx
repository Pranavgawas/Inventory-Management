import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, LogOut, Package, Users, BarChart3, Boxes, LogIn, UserPlus } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/products');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/products" className="navbar-brand">
          <Package size={28} />
          <span>BIZNest</span>
        </Link>

        <div className="navbar-links">
          {/* Show products and cart only for customers and guests */}
          {(!user || user.role === 'customer') && (
            <>
              <Link to="/products" className="nav-link">
                <Boxes size={18} />
                Products
              </Link>
              
              <Link to="/cart" className="nav-link">
                <ShoppingCart size={18} />
                Cart
              </Link>
            </>
          )}

          {user ? (
            <>
              {/* Customer links */}
              {user.role === 'customer' && (
                <>
                  <Link to="/orders" className="nav-link">
                    <Package size={18} />
                    Orders
                  </Link>
                </>
              )}

              {/* Staff links */}
              {(user.role === 'staff' || user.role === 'admin') && (
                <>
                  <Link to="/staff/orders" className="nav-link">
                    <Package size={18} />
                    Orders
                  </Link>
                  <Link to="/staff/sales" className="nav-link">
                    <BarChart3 size={18} />
                    Sales History
                  </Link>
                  <Link to="/staff/stock" className="nav-link">
                    <Boxes size={18} />
                    Stock Levels
                  </Link>
                </>
              )}

              {/* Admin links */}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/products" className="nav-link">
                    <Package size={18} />
                    Products
                  </Link>
                  <Link to="/admin/staff" className="nav-link">
                    <Users size={18} />
                    Staff
                  </Link>
                </>
              )}

              <div className="navbar-user">
                <span className="user-name">{user.username}</span>
                <span className="user-role">{user.role}</span>
                <button onClick={handleLogout} className="logout-btn">
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="auth-link login-link">
                <LogIn size={18} />
                Login
              </Link>
              <Link to="/signup" className="auth-link signup-link">
                <UserPlus size={18} />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
