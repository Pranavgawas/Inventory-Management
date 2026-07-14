import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import '../auth/Auth.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/products', { replace: true });
      } else if (user.role === 'staff') {
        navigate('/staff/orders', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      // Login API call
      const userData = await login(email, password);
      // userData contains { user: { role: '...', ... }, token: '...' }
      
      const role = userData.user.role;

      if (role === 'admin') {
        toast.success('Welcome Administrator');
        navigate('/admin/products', { replace: true });
      } else if (role === 'staff') {
        toast.success('Welcome Staff Member');
        navigate('/staff/orders', { replace: true });
      } else {
        // If customer tries to login here
        toast.error('Access Denied: Authorized Personnel Only');
        // Don't navigate - keep them on login page
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container admin-theme">
      <div className="auth-card">
        <div className="auth-header">
          <ShieldCheck size={48} className="auth-icon" color="#764ba2" />
          <h1>Staff Portal</h1>
          <p>Secure Access for Staff & Admins</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label><Mail size={18} /> Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={loading}
              placeholder="admin@biznest.com"
            />
          </div>
          <div className="form-group">
            <label><Lock size={18} /> Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              disabled={loading} 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="auth-button admin-btn" disabled={loading}>
            {loading ? 'Verifying Credentials...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
