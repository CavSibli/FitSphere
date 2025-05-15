const Order = require('../models/Order');

// Récupérer les commandes d'un utilisateur
exports.getUserOrders = async (req, res) => {
  try {
    let userId;
    
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    // Pour la route /me ou une route spécifique
    if (req.params.userId === 'me' || !req.params.userId) {
      userId = req.user._id;
    } else {
      userId = req.params.userId;
    }

    if (!userId) {
      console.error('ID utilisateur invalide:', { user: req.user, params: req.params });
      return res.status(400).json({ message: 'ID utilisateur invalide' });
    }

    console.log('Recherche des commandes pour userId:', userId);

    const orders = await Order.find({ user: userId })
      .populate({
        path: 'products.product',
        select: 'name price image'
      })
      .sort({ createdAt: -1 });

    console.log(`${orders.length} commandes trouvées pour l'utilisateur ${userId}`);
    res.json(orders);
  } catch (error) {
    console.error('Erreur complète:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des commandes',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Créer une nouvelle commande
exports.createOrder = async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress } = req.body;
    const userId = req.user.id;

    const order = new Order({
      user: userId,
      products,
      totalAmount,
      shippingAddress,
      status: 'pending'
    });

    await order.save();
    console.log('Nouvelle commande créée:', order._id);

    res.status(201).json(order);
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la commande' });
  }
};

// Mettre à jour le statut d'une commande
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier si l'utilisateur est autorisé à modifier la commande
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
  }
}; 