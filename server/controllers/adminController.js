const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const GuestOrder = require('../models/GuestOrder');
const mongoose = require('mongoose');

// Obtenir les statistiques générales
exports.getStats = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Compter le nombre total d'utilisateurs
    const totalUsers = await User.countDocuments();
    console.log('Total users:', totalUsers);

    // Compter le nombre total de produits
    const totalProducts = await Product.countDocuments();
    console.log('Total products:', totalProducts);

    // Compter le nombre total de commandes (utilisateurs + invités)
    const totalUserOrders = await Order.countDocuments();
    console.log('Total user orders:', totalUserOrders);

    // Vérifier si la collection GuestOrder existe
    const collections = await mongoose.connection.db.listCollections().toArray();
    const guestOrderCollectionExists = collections.some(col => col.name === 'guestorders');
    console.log('GuestOrder collection exists:', guestOrderCollectionExists);

    const totalGuestOrders = await GuestOrder.countDocuments();
    console.log('Total guest orders:', totalGuestOrders);

    const totalOrders = totalUserOrders + totalGuestOrders;
    console.log('Total orders (user + guest):', totalOrders);

    // Récupérer les commandes récentes (utilisateurs + invités)
    const recentUserOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'username email')
      .select('-__v');
    console.log('Recent user orders count:', recentUserOrders.length);

    const recentGuestOrders = await GuestOrder.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-__v');
    console.log('Recent guest orders count:', recentGuestOrders.length);

    // Transformer les commandes invitées récentes pour correspondre au format des commandes utilisateurs
    const formattedRecentGuestOrders = recentGuestOrders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      user: {
        username: order.guestInfo.name,
        email: order.guestInfo.email
      },
      total: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt
    }));

    // Transformer les commandes utilisateurs pour un format uniforme
    const formattedRecentUserOrders = recentUserOrders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      user: {
        username: order.user.username,
        email: order.user.email
      },
      total: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt
    }));

    // Combiner et trier toutes les commandes récentes
    const recentOrders = [...formattedRecentUserOrders, ...formattedRecentGuestOrders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const stats = {
      totalUsers,
      totalProducts,
      totalOrders,
      recentOrders
    };

    console.log('Stats envoyées:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};

// Obtenir toutes les commandes (utilisateurs + invités)
exports.getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Récupérer les commandes utilisateurs avec populate
    const userOrders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username email')
      .populate('products.product')
      .select('-__v');

    // Récupérer les commandes invitées avec populate
    const guestOrders = await GuestOrder.find()
      .sort({ createdAt: -1 })
      .populate('products.product')
      .select('-__v');

    // Transformer les données des commandes utilisateurs
    const formattedUserOrders = userOrders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      customerInfo: {
        name: order.user?.username || 'Utilisateur supprimé',
        email: order.user?.email || 'Email non disponible',
        type: 'registered'
      },
      products: order.products.map(item => ({
        product: item.product || { name: 'Produit supprimé', price: item.price },
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      status: order.status,
      payment: order.payment,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    // Transformer les données des commandes invitées
    const formattedGuestOrders = guestOrders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      customerInfo: {
        name: order.guestInfo.name,
        email: order.guestInfo.email,
        type: 'guest'
      },
      products: order.products.map(item => ({
        product: item.product || { name: 'Produit supprimé', price: item.price },
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      status: order.status,
      payment: order.payment,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    // Combiner et trier toutes les commandes
    const allOrders = [...formattedUserOrders, ...formattedGuestOrders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allOrders);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des commandes',
      error: error.message 
    });
  }
};

// Mettre à jour le statut d'une commande
exports.updateOrderStatus = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { status } = req.body;
    const orderId = req.params.orderId;

    // Essayer de trouver la commande dans Order
    let order = await Order.findById(orderId);
    let isGuestOrder = false;

    // Si pas trouvée dans Order, chercher dans GuestOrder
    if (!order) {
      order = await GuestOrder.findById(orderId);
      isGuestOrder = true;
    }

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    res.json({ 
      message: 'Statut de la commande mis à jour avec succès', 
      order,
      isGuestOrder 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Empêcher la suppression d'un admin
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Impossible de supprimer un administrateur' });
    }

    await user.remove();
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
  }
}; 