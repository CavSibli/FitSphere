import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetDashboardStatsQuery, 
  useGetAllOrdersQuery,
  useGetUsersQuery,
  useUpdateOrderStatusMutation,
  useUpdateGuestOrderStatusMutation 
} from '../app/apiSlice';
import '../styles/DashboardAdmin.css';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Queries RTK
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrdersQuery();
  const { data: users, isLoading: usersLoading } = useGetUsersQuery();
  
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
    if (order.user) {
      navigate(`/admin/orders/${order._id}`);
    } else {
      navigate(`/admin/guest-orders/${order._id}`);
    }
  };

  // Rendu des statistiques
  const renderStats = () => {
    if (statsLoading) return <div>Chargement des statistiques...</div>;
    if (!stats) return <div>Aucune statistique disponible</div>;

    const {
      totalOrders = 0,
      totalRevenue = 0,
      totalUsers = 0,
      totalProducts = 0,
      recentOrders = []
    } = stats;

    return (
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Commandes Totales</h3>
            <p className="stat-value">{totalOrders}</p>
          </div>
          <div className="stat-card">
            <h3>Chiffre d'Affaires</h3>
            <p className="stat-value">{Number(totalRevenue).toFixed(2)} €</p>
          </div>
          <div className="stat-card">
            <h3>Utilisateurs</h3>
            <p className="stat-value">{totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Produits</h3>
            <p className="stat-value">{totalProducts}</p>
          </div>
        </div>
        <div className="recent-orders">
          <h2>Commandes récentes</h2>
          <div className="orders-list">
            {recentOrders.map(order => (
              <div key={order._id} className="order-card">
                <p>Commande #{order.orderNumber || order._id}</p>
                <p>Client: {order.user?.name || order.guestInfo?.name || 'Client inconnu'}</p>
                <p>Total: {Number(order.totalAmount || 0).toFixed(2)}€</p>
                <p>Statut: {order.status || 'Non défini'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Rendu de la liste des commandes
  const renderOrders = () => {
    if (ordersLoading) return <div>Chargement des commandes...</div>;
    if (!orders.length) return <div>Aucune commande trouvée</div>;

    const filteredOrders = filterOrdersByStatus(orders);

    return (
      <div className="orders-section">
        <h2>Commandes récentes</h2>
        <div className="orders-filters">
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="processing">En cours</option>
            <option value="shipped">Expédié</option>
            <option value="delivered">Livré</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID Commande</th>
                <th>Client</th>
                <th>Date</th>
                <th>Total</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                // Déterminer le nom et l'email du client
                let clientInfo = 'N/A';
                if (order.customerInfo) {
                  const { name, email, type } = order.customerInfo;
                  clientInfo = type === 'registered' 
                    ? `${name} (${email})`
                    : `${name} (${email}) - Invité`;
                }

                return (
                  <tr key={order._id}>
                    <td>{order.orderNumber || order._id}</td>
                    <td>{clientInfo}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.totalAmount?.toFixed(2)} €</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`status-select ${order.status}`}
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
                        className="view-button"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Rendu de la liste des utilisateurs
  const renderUsers = () => {
    if (usersLoading) return <div>Chargement des utilisateurs...</div>;
    if (!users) return <div>Aucun utilisateur trouvé</div>;

    return (
      <div className="users-section">
        <h2>Liste des utilisateurs</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nom d'utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Date de création</th>
                <th>Actions</th>
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
                      onClick={() => navigate(`/admin/users/${user._id}`)}
                      className="view-button"
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-admin">
      <div className="dashboard-header">
        <h1>Tableau de bord administrateur</h1>
        <button className="logout-button" onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }}>Déconnexion</button>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistiques
        </button>
        <button 
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Commandes
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs
        </button>
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => navigate('/admin/products')}
        >
          Produits
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'users' && renderUsers()}
      </div>
    </div>
  );
};

export default DashboardAdmin; 