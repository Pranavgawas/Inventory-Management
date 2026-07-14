import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { UserPlus, Edit2, Trash2, Lock, Unlock } from 'lucide-react';
import './StaffManagement.css';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [editingStaff, setEditingStaff] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await usersAPI.getStaff();
      setStaff(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await usersAPI.createStaff(formData);
      setMessage('Staff account created successfully!');
      setTimeout(() => setMessage(''), 3000);
      setShowForm(false);
      setFormData({ username: '', email: '', password: '' });
      fetchStaff();
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Failed to create staff');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdate = async () => {
    try {
      await usersAPI.updateStaff(editingStaff._id, {
        username: editingStaff.username,
        email: editingStaff.email
      });
      setMessage('Staff account updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      setEditingStaff(null);
      fetchStaff();
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Failed to update staff');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await usersAPI.disableStaff(id, !currentStatus);
      setMessage(`Staff account ${!currentStatus ? 'enabled' : 'disabled'} successfully!`);
      setTimeout(() => setMessage(''), 3000);
      fetchStaff();
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Failed to update status');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff account?')) return;
    
    try {
      await usersAPI.deleteStaff(id);
      setMessage('Staff account deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchStaff();
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Failed to delete staff');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading staff...</div>;
  }

  return (
    <div className="staff-management">
      <div className="header">
        <h1>Staff Account Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="add-btn">
          <UserPlus size={20} />
          Add Staff
        </button>
      </div>

      {message && <div className="message">{message}</div>}

      {showForm && (
        <div className="staff-form">
          <h3>Create New Staff Account</h3>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button onClick={handleCreate} className="save-btn">Create Account</button>
            <button onClick={() => setShowForm(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}

      <div className="staff-list">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No staff accounts found</td>
              </tr>
            ) : (
              staff.map(member => (
                editingStaff && editingStaff._id === member._id ? (
                  <tr key={member._id} className="editing-row">
                    <td>
                      <input
                        type="text"
                        value={editingStaff.username}
                        onChange={(e) => setEditingStaff({ ...editingStaff, username: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        value={editingStaff.email}
                        onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                      />
                    </td>
                    <td colSpan="2"></td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={handleUpdate} className="save-btn-small">Save</button>
                        <button onClick={() => setEditingStaff(null)} className="cancel-btn-small">Cancel</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={member._id}>
                    <td>{member.username}</td>
                    <td>{member.email}</td>
                    <td>
                      <span className={`status-badge ${member.isActive ? 'active' : 'inactive'}`}>
                        {member.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>{new Date(member.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => setEditingStaff(member)} className="edit-btn" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleToggleActive(member._id, member.isActive)} 
                          className={member.isActive ? 'disable-btn' : 'enable-btn'}
                          title={member.isActive ? 'Disable' : 'Enable'}
                        >
                          {member.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                        </button>
                        <button onClick={() => handleDelete(member._id)} className="delete-btn" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManagement;
