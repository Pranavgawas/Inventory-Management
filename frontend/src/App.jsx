import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import AdminLogin from './pages/auth/AdminLogin';
import Signup from './pages/auth/Signup';
import ProductCatalog from './pages/customer/ProductCatalog';
import ShoppingCart from './pages/customer/ShoppingCart';
import OrderHistory from './pages/customer/OrderHistory';
import OrderManagement from './pages/staff/OrderManagement';
import SalesHistory from './pages/staff/SalesHistory';
import StockViewer from './pages/staff/StockViewer';
import ProductManagement from './pages/admin/ProductManagement';
import StaffManagement from './pages/admin/StaffManagement';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/common/Navbar';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4caf50',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/staff/login" element={<AdminLogin />} />
          {/* Staff Login merged into Admin Login */}
          <Route path="/signup" element={<Signup />} />
          
          {/* Public routes - guests can browse and view cart */}
          <Route path="/products" element={<ProductCatalog />} />
          <Route path="/cart" element={<ShoppingCart />} />
          
          {/* Protected routes */}
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            } 
          />
          
          {/* Staff routes */}
          <Route 
            path="/staff/orders" 
            element={
              <ProtectedRoute>
                <OrderManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/sales" 
            element={
              <ProtectedRoute>
                <SalesHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/stock" 
            element={
              <ProtectedRoute>
                <StockViewer />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin/products" 
            element={
              <ProtectedRoute>
                <ProductManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/staff" 
            element={
              <ProtectedRoute>
                <StaffManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/products" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
