import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../app/features/orders/userOrdersApiSlice';
import { useGetDashboardStatsQuery, useGetUsersQuery, useDeleteUserMutation } from '../app/features/users/usersApiSlice';
import { useUpdateGuestOrderStatusMutation } from '../app/features/orders/guestOrdersApiSlice';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../app/features/auth/authSlice';
import '../styles/DashboardAdmin.scss';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('stats');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [deleteUser] = useDeleteUserMutation();

  // Vérifier l'authentification et le rôle
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Queries RTK
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery(undefined, {
    skip: !isAuthenticated
  });
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrdersQuery(undefined, {
    skip: !isAuthenticated
  });
  const { data: users, isLoading: usersLoading, refetch } = useGetUsersQuery(undefined, {
    skip: !isAuthenticated
  });
  
  // Mutations RTK
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [updateGuestOrderStatus] = useUpdateGuestOrderStatusMutation();

  // Filtrer les commandes par statut
  const filterOrdersByStatus = (ordersList) => {
    if (selectedStatus === 'all') return ordersList;
    return ordersList.filter(order => order.status === selectedStatus);
  };

  // Gérer le changement de statut d'une commande
  const handleStatusChange = async (orderId, newStatus, isGuest) => {
    try {
      if (isGuest) {
        await updateGuestOrderStatus({ orderId, status: newStatus }).unwrap();
      } else {
        await updateOrderStatus({ orderId, status: newStatus }).unwrap();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut. Veuillez réessayer.');
    }
  };

  const handleViewOrder = (order) => {
    setExpandedOrderId(expandedOrderId === order._id ? null : order._id);
  };

  const handleLogout = () => {
    dispatch(logout());
    // Forcer un rafraîchissement complet de la page
    window.location.href = '/login';
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await deleteUser(userId).unwrap();
        // Rafraîchir la liste des utilisateurs
        refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  // Rendu des statistiques
  const renderStats = () => {
    if (statsLoading) return <div role="status" aria-label="Chargement des statistiques">Chargement des statistiques...</div>;
    if (!stats) return <div role="alert" aria-label="Aucune statistique disponible">Aucune statistique disponible</div>;

    const {
      totalOrders = 0,
      totalUsers = 0,
      totalProducts = 0,
      recentOrders = []
    } = stats;

    return (
      <section className="stats-section" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="visually-hidden">Statistiques du tableau de bord</h2>
        <div className="stats-grid" role="list" aria-label="Statistiques générales">
          <article className="stat-card" role="listitem">
            <h3>Commandes Totales</h3>
            <p className="stat-value" aria-label={`Nombre total de commandes: ${totalOrders}`}>{totalOrders}</p>
          </article>
          <article className="stat-card" role="listitem">
            <h3>Utilisateurs</h3>
            <p className="stat-value" aria-label={`Nombre total d'utilisateurs: ${totalUsers}`}>{totalUsers}</p>
          </article>
          <article className="stat-card" role="listitem">
            <h3>Produits</h3>
            <p className="stat-value" aria-label={`Nombre total de produits: ${totalProducts}`}>{totalProducts}</p>
          </article>
        </div>
        <section className="recent-orders" aria-labelledby="recent-orders-heading">
          <h2 id="recent-orders-heading">Commandes récentes</h2>
          <div className="orders-list" role="list" aria-label="Liste des commandes récentes">
            {recentOrders.map(order => (
              <article key={order._id} className="order-card" role="listitem">
                <p>Commande #{order.orderNumber || order._id}</p>
                <p>Client: {order.user?.email || order.guestInfo?.email || 'Client inconnu'}</p>
                <p>Total: {Number(order.total || 0).toFixed(2)}€</p>
                <p>Statut: {order.status || 'Non défini'}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    );
  };

  // Rendu de la liste des commandes
  const renderOrders = () => {
    if (ordersLoading) return <div role="status" aria-label="Chargement des commandes">Chargement des commandes...</div>;
    if (!orders.length) return <div role="alert" aria-label="Aucune commande trouvée">Aucune commande trouvée</div>;

    const filteredOrders = filterOrdersByStatus(orders);

    return (
      <section className="orders-section" aria-labelledby="orders-heading">
        <h2 id="orders-heading">Commandes récentes</h2>
        <div className="orders-filters">
          <label htmlFor="status-filter" className="visually-hidden">Filtrer par statut:  </label>
          <select 
            id="status-filter"
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="status-filter"
            aria-label="Filtrer les commandes par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="processing">En cours</option>
            <option value="shipped">Expédié</option>
            <option value="delivered">Livré</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
        <div className="table-container" role="region" aria-label="Liste des commandes">
          <table>
            <thead>
              <tr>
                <th scope="col">ID Commande</th>
                <th scope="col">Client</th>
                <th scope="col">Date</th>
                <th scope="col">Total</th>
                <th scope="col">Statut</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                return (
                  <React.Fragment key={`order-${order._id}`}>
                    <tr key={`row-${order._id}`}>
                      <td>{order.orderNumber || order._id}</td>
                      <td>{order.customerInfo?.name} ({order.customerInfo?.email}) - {order.customerInfo?.type === 'registered' ? 'Client enregistré' : 'Client invité'}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{order.totalAmount?.toFixed(2)} €</td>
                      <td>
                        <label htmlFor={`status-${order._id}`} className="visually-hidden">Changer le statut de la commande</label>
                        <select
                          id={`status-${order._id}`}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`status-select ${order.status}`}
                          aria-label={`Changer le statut de la commande ${order.orderNumber || order._id}`}
                        >
                          <option value="pending">En attente</option>
                          <option value="processing">En cours</option>
                          <option value="shipped">Expédié</option>
                          <option value="delivered">Livré</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                      </td>
                      <td className="action-buttons">
                        <button 
                          onClick={() => handleViewOrder(order)}
                          className={`view-button ${expandedOrderId === order._id ? 'active' : ''}`}
                          aria-expanded={expandedOrderId === order._id}
                          aria-controls={`details-${order._id}`}
                          aria-label={expandedOrderId === order._id ? 'Masquer les détails' : 'Voir les détails'}
                        >
                          {expandedOrderId === order._id ? 'Masquer' : 'Détails'}
                        </button>
                      </td>
                    </tr>
                    {expandedOrderId === order._id && (
                      <tr key={`details-${order._id}`} className="order-details-row">
                        <td colSpan="6">
                          <div className="order-details-content" id={`details-${order._id}`}>
                            <section className="details-section" aria-labelledby={`customer-info-${order._id}`}>
                              <h3 id={`customer-info-${order._id}`}>Informations client</h3>
                              <p><strong>Nom:</strong> {order.customerInfo?.name}</p>
                              <p><strong>Email:</strong> {order.customerInfo?.email}</p>
                              <p><strong>Type:</strong> {order.customerInfo?.type === 'registered' ? 'Client enregistré' : 'Client invité'}</p>
                            </section>

                            <section className="details-section" aria-labelledby={`shipping-${order._id}`}>
                              <h3 id={`shipping-${order._id}`}>Adresse de livraison</h3>
                              <address>
                                <p>{order.shippingAddress?.street}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                                <p>{order.shippingAddress?.country}</p>
                              </address>
                            </section>

                            <section className="details-section" aria-labelledby={`billing-${order._id}`}>
                              <h3 id={`billing-${order._id}`}>Adresse de facturation</h3>
                              <address>
                                <p>{order.billingAddress?.street}</p>
                                <p>{order.billingAddress?.city}, {order.billingAddress?.postalCode}</p>
                                <p>{order.billingAddress?.country}</p>
                              </address>
                            </section>

                            <section className="details-section" aria-labelledby={`payment-${order._id}`}>
                              <h3 id={`payment-${order._id}`}>Informations de paiement</h3>
                              <p><strong>Méthode:</strong> {order.payment?.method === 'credit_card' ? 'Carte bancaire' : 'PayPal'}</p>
                              <p><strong>Statut:</strong> {order.payment?.status === 'pending' ? 'En attente' : 
                                                       order.payment?.status === 'completed' ? 'Payé' :
                                                       order.payment?.status === 'failed' ? 'Échoué' :
                                                       order.payment?.status === 'refunded' ? 'Remboursé' : 'N/A'}</p>
                              <p><strong>Montant:</strong> {order.payment?.amount?.toFixed(2)} €</p>
                              <p><strong>Date de paiement:</strong> {order.payment?.paymentDate ? new Date(order.payment.paymentDate).toLocaleDateString() : 'N/A'}</p>
                              {order.payment?.method === 'credit_card' && (
                                <>
                                  <p><strong>Derniers chiffres:</strong> {order.payment?.paymentDetails?.cardLast4 || 'N/A'}</p>
                                  <p><strong>Nom sur la carte:</strong> {order.payment?.paymentDetails?.cardName || 'N/A'}</p>
                                </>
                              )}
                              {order.payment?.method === 'paypal' && (
                                <p><strong>Email PayPal:</strong> {order.payment?.paymentDetails?.paypalEmail || 'N/A'}</p>
                              )}
                            </section>

                            <section className="details-section" aria-labelledby={`products-${order._id}`}>
                              <h3 id={`products-${order._id}`}>Produits commandés</h3>
                              <div className="order-items" role="list" aria-label="Liste des produits commandés">
                                {order.products?.map((item, index) => (
                                  <article 
                                    key={item._id || index} 
                                    className="order-item"
                                    role="listitem"
                                  >
                                    <div className="item-details">
                                      <h4>{item.product?.name || 'Produit non disponible'}</h4>
                                      <p>Quantité: {item.quantity}</p>
                                      <p>Prix unitaire: {item.price?.toFixed(2)}€</p>
                                      <p>Total: {(item.price * item.quantity).toFixed(2)}€</p>
                                    </div>
                                  </article>
                                ))}
                              </div>
                            </section>

                            <section className="details-section" aria-labelledby={`summary-${order._id}`}>
                              <h3 id={`summary-${order._id}`}>Résumé de la commande</h3>
                              <p><strong>Numéro de commande:</strong> {order.orderNumber || order._id}</p>
                              <p><strong>Date de commande:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                              <p><strong>Total:</strong> {order.totalAmount?.toFixed(2)} €</p>
                              <p><strong>Statut:</strong> {order.status}</p>
                            </section>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  // Rendu de la liste des utilisateurs
  const renderUsers = () => {
    if (usersLoading) return <div role="status" aria-label="Chargement des utilisateurs">Chargement des utilisateurs...</div>;
    if (!users) return <div role="alert" aria-label="Aucun utilisateur trouvé">Aucun utilisateur trouvé</div>;

    return (
      <section className="users-section" aria-labelledby="users-heading">
        <h2 id="users-heading">Liste des utilisateurs</h2>
        <div className="table-container" role="region" aria-label="Liste des utilisateurs">
          <table>
            <thead>
              <tr>
                <th scope="col">Nom d'utilisateur</th>
                <th scope="col">Email</th>
                <th scope="col">Rôle</th>
                <th scope="col">Date de création</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.username || user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="action-buttons">
                    <button 
                      onClick={() => handleDeleteUser(user._id)}
                      className="delete-button"
                      aria-label={`Supprimer l'utilisateur ${user.username || user.name}`}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  return (
    <main className="dashboard-admin" role="main" aria-label="Tableau de bord administrateur">
      <header className="dashboard-header">
        <h1>Tableau de bord administrateur</h1>
        <button 
          className="logout-button" 
          onClick={handleLogout}
          aria-label="Se déconnecter"
        >
          Déconnexion
        </button>
      </header>

      <nav className="dashboard-tabs" role="tablist" aria-label="Navigation du tableau de bord">
        <button 
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
          role="tab"
          aria-selected={activeTab === 'stats'}
          aria-controls="stats-panel"
          id="stats-tab"
        >
          Statistiques
        </button>
        <button 
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
          role="tab"
          aria-selected={activeTab === 'orders'}
          aria-controls="orders-panel"
          id="orders-tab"
        >
          Commandes
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          role="tab"
          aria-selected={activeTab === 'users'}
          aria-controls="users-panel"
          id="users-tab"
        >
          Utilisateurs
        </button>
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => navigate('/admin/products')}
          role="tab"
          aria-label="Gérer les produits"
        >
          Produits
        </button>
      </nav>

      <div className="dashboard-content">
        <div role="tabpanel" id="stats-panel" aria-labelledby="stats-tab" hidden={activeTab !== 'stats'}>
        {activeTab === 'stats' && renderStats()}
        </div>
        <div role="tabpanel" id="orders-panel" aria-labelledby="orders-tab" hidden={activeTab !== 'orders'}>
        {activeTab === 'orders' && renderOrders()}
        </div>
        <div role="tabpanel" id="users-panel" aria-labelledby="users-tab" hidden={activeTab !== 'users'}>
        {activeTab === 'users' && renderUsers()}
      </div>
    </div>
    </main>
  );
};

export default DashboardAdmin; 