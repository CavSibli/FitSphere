import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUserProfileQuery } from '../app/features/auth/authApiSlice';
import { useGetUserOrdersQuery } from '../app/features/orders/userOrdersApiSlice';
import '../styles/DashboardUser.scss';

const DashboardUser = () => {
  const navigate = useNavigate();
  
  const { 
    data: user, 
    isLoading: isLoadingProfile, 
    error: profileError 
  } = useGetUserProfileQuery();

  const {
    data: userOrders = [],
    isLoading: isLoadingOrders,
    error: ordersError
  } = useGetUserOrdersQuery();

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

  if (isLoadingProfile || isLoadingOrders) {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  }

  if (profileError) {
    if (profileError.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      return null;
    }
    return <div className="text-red-500 text-center">Erreur lors du chargement du profil</div>;
  }

  if (ordersError) {
    return <div className="text-red-500 text-center">Erreur lors du chargement des commandes</div>;
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

      <div className="mt-8">
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
                    <p>Total: {order.totalAmount?.toFixed(2)} €</p>
                    <p>Méthode de paiement: {order.payment?.method === 'credit_card' ? 'Carte bancaire' : 'PayPal'}</p>
                    <p>Statut du paiement: {order.payment?.status === 'pending' ? 'En attente' : 
                                         order.payment?.status === 'completed' ? 'Payé' :
                                         order.payment?.status === 'failed' ? 'Échoué' :
                                         order.payment?.status === 'refunded' ? 'Remboursé' : 'N/A'}</p>
                  </div>
                  <div className="order-products">
                    <h4>Produits commandés:</h4>
                    <ul>
                      {order.products?.map((item, index) => (
                        <li key={index}>
                          {item.product?.name || 'Produit non disponible'} - Quantité: {item.quantity} - Prix: {item.price?.toFixed(2)} €
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="order-addresses">
                    <div className="shipping-address">
                      <h4>Adresse de livraison:</h4>
                      <p>{order.shippingAddress?.street}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                      <p>{order.shippingAddress?.country}</p>
                    </div>
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

export default DashboardUser; 