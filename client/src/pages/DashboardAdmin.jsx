import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/DashboardAdmin.scss';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    recentOrders: []
  });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Récupérer les statistiques
      const statsResponse = await axios.get('http://localhost:5000/api/admin/stats', { headers });
      console.log('Stats reçues:', statsResponse.data);
      setStats(statsResponse.data);

      // Récupérer les utilisateurs
      const usersResponse = await axios.get('http://localhost:5000/api/auth/users', { headers });
      setUsers(usersResponse.data);

      // Récupérer les produits
      const productsResponse = await axios.get('http://localhost:5000/api/products', { headers });
      setProducts(productsResponse.data);

      // Récupérer les commandes via l'endpoint admin
      const ordersResponse = await axios.get('http://localhost:5000/api/admin/orders', { headers });
      setOrders(ordersResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setError('Erreur lors de la récupération des données');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(users.filter(user => user._id !== userId));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setError('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setError('Erreur lors de la mise à jour du statut de la commande');
    }
  };

  const handleToggleTrendy = async (productId, currentTrendyStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/products/${productId}/trendy`,
        { trendy: !currentTrendyStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Mettre à jour la liste des produits localement
      setProducts(products.map(product => 
        product._id === productId 
          ? { ...product, trendy: !currentTrendyStatus }
          : product
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut trendy:', error);
      setError('Erreur lors de la mise à jour du statut trendy');
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="dashboard-admin">
      <div className="dashboard-header">
        <h1>Tableau de bord administrateur</h1>
        <button className="logout-button" onClick={handleLogout}>Déconnexion</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistiques
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs
        </button>
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Produits
        </button>
        <button 
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Commandes
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'stats' && (
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Utilisateurs</h3>
                <p className="stat-number">{stats.totalUsers}</p>
              </div>
              <div className="stat-card">
                <h3>Produits</h3>
                <p className="stat-number">{stats.totalProducts}</p>
              </div>
              <div className="stat-card">
                <h3>Commandes</h3>
                <p className="stat-number">{stats.totalOrders}</p>
              </div>
            </div>
            <div className="recent-orders">
              <h2>Commandes récentes</h2>
              <div className="orders-list">
                {stats.recentOrders.map(order => (
                  <div key={order._id} className="order-card">
                    <p>Commande #{order.orderNumber || order._id}</p>
                    <p>Client: {order.user?.username || order.user?.name}</p>
                    <p>Total: {order.total || order.totalAmount}€</p>
                    <p>Statut: {order.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
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
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="action-buttons">
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          className="delete"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="products-section">
            <div className="section-header">
              <h2>Liste des produits</h2>
              <Link to="/add-product" className="add-product-button">Ajouter un produit</Link>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Catégorie</th>
                    <th>Trendy</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.price}€</td>
                      <td>{product.stock}</td>
                      <td>{product.category}</td>
                      <td>
                        <button
                          onClick={() => handleToggleTrendy(product._id, product.trendy)}
                          className={`trendy-button ${product.trendy ? 'active' : ''}`}
                        >
                          {product.trendy ? 'Trendy' : 'Non trendy'}
                        </button>
                      </td>
                      <td className="action-buttons">
                        <button 
                          onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                          className="edit"
                        >
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="delete"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>Gestion des Commandes</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>N° Commande</th>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Produits</th>
                    <th>Total</th>
                    <th>Statut</th>
                    <th>Paiement</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>{order.orderNumber}</td>
                      <td>
                        <div>
                          <div className="font-medium">{order.customerInfo.name}</div>
                          <div className="text-sm text-gray-500">{order.customerInfo.email}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${
                          order.customerInfo.type === 'registered' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.customerInfo.type === 'registered' ? 'Inscrit' : 'Invité'}
                        </span>
                      </td>
                      <td>
                        <div className="max-h-32 overflow-y-auto">
                          {order.products.map((item, index) => (
                            <div key={index} className="text-sm">
                              {item.quantity}x {item.name} - {item.price.toFixed(2)}€
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="font-medium">
                        {order.totalAmount.toFixed(2)}€
                      </td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          className="w-full p-1 border rounded"
                        >
                          <option value="pending">En attente</option>
                          <option value="processing">En traitement</option>
                          <option value="shipped">Expédiée</option>
                          <option value="delivered">Livrée</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                      </td>
                      <td>
                        <span className={`status-badge ${
                          order.paymentStatus === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.paymentStatus === 'completed' ? 'Payé' : 'En attente'}
                        </span>
                      </td>
                      <td>
                        <div className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="action-buttons">
                        <button
                          onClick={() => handleViewOrderDetails(order)}
                          className="edit"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAdmin; 