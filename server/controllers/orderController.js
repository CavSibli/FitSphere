const Order = require('../models/Order');

// Récupérer les commandes d'un utilisateur
exports.getUserOrders = async (req, res) => {
  try {
    console.log('Récupération des commandes pour l\'utilisateur:', req.params.userId);
    
    const orders = await Order.find({ user: req.params.userId })
      .populate('products.product')
      .sort({ createdAt: -1 });

    console.log(`${orders.length} commandes trouvées`);
    res.json(orders);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
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