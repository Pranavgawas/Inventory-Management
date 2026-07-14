import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color="#4caf50" />;
      case 'cancelled':
        return <XCircle size={20} color="#ef4444" />;
      case 'pending':
        return <Clock size={20} color="#ff9800" />;
      default:
        return <Package size={20} color="#2196f3" />;
    }
  };

  const getStatusClass = (status) => {
    return `status-badge ${status}`;
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="empty-orders">
        <Package size={64} />
        <h2>No orders yet</h2>
        <p>Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="order-history">
      <h1>Order History</h1>

      <div className="orders-list">
        {orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div>
                <h3>Order #{order._id.slice(-8)}</h3>
                <p className="order-date">
                  {new Date(order.orderDate).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className={getStatusClass(order.status)}>
                {getStatusIcon(order.status)}
                <span>{order.status.toUpperCase()}</span>
              </div>
            </div>

            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div>
                    <p className="item-name">{item.product.name}</p>
                    <p className="item-qty">Quantity: {item.quantity}</p>
                  </div>
                  <p className="item-price">₹{item.subtotal.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <div className="order-total">
                <span>Total Amount:</span>
                <span className="amount">₹{order.totalAmount.toLocaleString()}</span>
              </div>
              {order.processedBy && (
                <p className="processed-by">
                  Processed by: {order.processedBy.username}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
