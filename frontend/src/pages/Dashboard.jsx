import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px' }}>
        <h1>Welcome, {user?.username}!</h1>
        <p className="text-center" style={{ marginBottom: '2rem' }}>
          This is a protected dashboard. You are successfully authenticated using JWT.
        </p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
            <strong>Email:</strong> {user?.email}
          </div>
          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
            <strong>User ID:</strong> {user?._id}
          </div>
        </div>
        <button onClick={logout} style={{ marginTop: '2rem', backgroundColor: '#ef4444' }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
