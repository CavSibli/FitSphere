import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Logout from '../components/Logout';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Récupérer les informations de l'utilisateur
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);

        // Récupérer les commandes de l'utilisateur
        const response = await axios.get(`http://localhost:5000/api/orders/user/${userData.id}`);
        setOrders(response.data);
      } catch (error) {
        setError('Erreur lors du chargement des données');
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Mon Compte</h1>
        <Logout />
      </div>

      <div className="dashboard-content">
        <div className="user-info">
          <h2>Informations personnelles</h2>
          <p><strong>Nom d'utilisateur:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>

        <div className="orders-section">
          <h2>Mes commandes</h2>
          {orders.length === 0 ? (
            <p>Vous n'avez pas encore de commandes</p>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <h3>Commande #{order._id}</h3>
                  <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p><strong>Statut:</strong> {order.status}</p>
                  <p><strong>Total:</strong> {order.total}€</p>
                  <div className="order-items">
                    {order.items.map((item) => (
                      <div key={item._id} className="order-item">
                        <p>{item.product.name} x {item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 