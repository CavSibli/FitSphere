import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUserProfileQuery } from '../app/features/auth/authSlice';
import { useGetUserOrdersQuery } from '../app/features/orders/userOrdersApiSlice';
import { useGetProductsQuery } from '../app/features/products/productsApiSlice';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../app/features/auth/authSlice';
import '../styles/DashboardUser.scss';

const DashboardUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const { 
    data: userProfile, 
    isLoading: isLoadingProfile, 
    error: profileError,
    refetch: refetchProfile
  } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated
  });

  const {
    data: userOrders = [],
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders
  } = useGetUserOrdersQuery(undefined, {
    skip: !isAuthenticated
  });

  const {
    data: products = [],
    isLoading: isLoadingProducts,
    refetch: refetchProducts
  } = useGetProductsQuery(undefined, {
    skip: !isAuthenticated
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      refetchProfile();
      refetchOrders();
      refetchProducts();
    }
  }, [isAuthenticated, refetchProfile, refetchOrders, refetchProducts]);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  const getStatusLabel = useMemo(() => {
    const statusMap = {
      pending: 'En attente',
      processing: 'En cours de traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return (status) => statusMap[status] || status;
  }, []);

  const getStatusClass = useMemo(() => {
    const statusClassMap = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return (status) => statusClassMap[status] || '';
  }, []);

  const getProductName = useMemo(() => {
    return (productId) => {
      const product = products.find(p => p._id === productId);
      return product ? product.name : 'Produit non trouvé';
    };
  }, [products]);

  if (!isAuthenticated) {
    return (
      <div role="status" aria-label="Vérification de l'authentification" className="flex justify-center items-center min-h-screen">
        Vérification de l'authentification...
      </div>
    );
  }

  if (isLoadingProfile || isLoadingOrders || isLoadingProducts) {
    return (
      <div role="status" aria-label="Chargement du tableau de bord" className="flex justify-center items-center min-h-screen">
        Chargement...
      </div>
    );
  }

  if (profileError) {
    return (
      <div role="alert" aria-label="Erreur de chargement du profil" className="text-red-500 text-center">
        Erreur lors du chargement du profil
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" role="region" aria-label="Tableau de bord utilisateur">
      <header className="dashboard-header">
        <h1 className="text-3xl font-bold">Tableau de bord utilisateur</h1>
        <button 
          onClick={handleLogout} 
          className="logout-button"
          aria-label="Se déconnecter de votre compte"
        >
          Déconnexion
        </button>
      </header>
      
      {userProfile && (
        <section className="bg-white shadow-md rounded-lg p-6" aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="text-xl font-semibold mb-4">Profil</h2>
          <dl className="space-y-4" role="list" aria-label="Informations du profil">
            <div role="listitem">
              <dt className="font-medium">Nom d'utilisateur:</dt>
              <dd>{userProfile.username}</dd>
            </div>
            <div role="listitem">
              <dt className="font-medium">Email:</dt>
              <dd>{userProfile.email}</dd>
            </div>
            <div role="listitem">
              <dt className="font-medium">Rôle:</dt>
              <dd>{userProfile.role}</dd>
            </div>
          </dl>
        </section>
      )}

      <section className="mt-8" aria-labelledby="orders-heading">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 id="orders-heading" className="text-xl font-semibold mb-4">Commandes récentes</h2>
          {userOrders.length === 0 ? (
            <p className="text-gray-600" role="status">Aucune commande récente</p>
          ) : (
            <div className="orders-list" role="list" aria-label="Liste des commandes">
              {userOrders.map((order) => (
                <article key={order._id} className="order-card" role="listitem">
                  <header className="order-header">
                    <h3>Commande #{order._id}</h3>
                    <span 
                      className={`status-badge ${getStatusClass(order.status)}`}
                      role="status"
                      aria-label={`Statut de la commande: ${getStatusLabel(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </header>
                  <div className="order-details" role="group" aria-label="Détails de la commande">
                    <dl>
                      <dt>Date:</dt>
                      <dd>{new Date(order.createdAt).toLocaleDateString()}</dd>
                      <dt>Total:</dt>
                      <dd>{order.totalAmount?.toFixed(2)} €</dd>
                      <dt>Méthode de paiement:</dt>
                      <dd>{order.payment?.method === 'credit_card' ? 'Carte bancaire' : 'PayPal'}</dd>
                      <dt>Statut du paiement:</dt>
                      <dd>
                        {order.payment?.status === 'pending' ? 'En attente' : 
                         order.payment?.status === 'completed' ? 'Payé' :
                         order.payment?.status === 'failed' ? 'Échoué' :
                         order.payment?.status === 'refunded' ? 'Remboursé' : 'N/A'}
                      </dd>
                    </dl>
                  </div>
                  <div className="order-products" role="group" aria-label="Produits de la commande">
                    <h4>Produits commandés:</h4>
                    <ul role="list" aria-label="Liste des produits">
                      {order.products?.map((item, index) => {
                        const productId = typeof item.product === 'object' ? item.product._id : item.product;
                        return (
                          <li key={index} role="listitem">
                            REF: {productId} - {getProductName(productId)} - Quantité: {item.quantity} - Prix: {item.price?.toFixed(2)} €
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="order-addresses" role="group" aria-label="Adresses de la commande">
                    <div className="shipping-address" role="group" aria-label="Adresse de livraison">
                      <h4>Adresse de livraison:</h4>
                      <address>
                        <p>{order.shippingAddress?.street}</p>
                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                        <p>{order.shippingAddress?.country}</p>
                      </address>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {ordersError && (
        <div 
          className="text-red-500 text-center" 
          role="alert" 
          aria-label="Erreur lors du chargement des commandes"
        >
          Erreur lors du chargement des commandes
        </div>
      )}
    </div>
  );
};

export default React.memo(DashboardUser); 