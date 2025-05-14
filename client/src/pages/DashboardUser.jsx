import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/DashboardUser.css';

const DashboardUser = () => {
  const navigate = useNavigate();
  const [userOrders, setUserOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
        setError('Erreur lors du chargement du profil');
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user?._id) {
        console.log('ID utilisateur non disponible');
        return;
      }

      try {
        console.log('Récupération des commandes pour l\'utilisateur:', user._id);
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/orders/user/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Commandes récupérées:', response.data);
        setUserOrders(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        setError('Erreur lors de la récupération de vos commandes');
      }
    };

    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: 'En attente',
      processing: 'En cours de traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const statusClassMap = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return statusClassMap[status] || '';
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="dashboard-header">
        <h1 className="text-3xl font-bold">Tableau de bord utilisateur</h1>
        <button onClick={handleLogout} className="logout-button">
          Déconnexion
        </button>
      </div>
      
      {user && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Profil</h2>
          <div className="space-y-4">
            <p><span className="font-medium">Nom d'utilisateur:</span> {user.username}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Rôle:</span> {user.role}</p>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Commandes récentes</h2>
          {userOrders.length === 0 ? (
            <p className="text-gray-600">Aucune commande récente</p>
          ) : (
            <div className="orders-list">
              {userOrders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <h3>Commande #{order._id}</h3>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="order-details">
                    <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p>Total: {order.totalAmount?.toFixed(2) || order.total?.toFixed(2)} €</p>
                  </div>
                  <div className="order-products">
                    <h4>Produits commandés:</h4>
                    <ul>
                      {order.products?.map((item, index) => (
                        <li key={index}>
                          {item.product?.name || item.name} - Quantité: {item.quantity} - Prix: {item.price?.toFixed(2)} €
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Produits favoris</h2>
          <p className="text-gray-600">Aucun produit favori</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardUser; 