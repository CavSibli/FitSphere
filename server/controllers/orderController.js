const Order = require('../models/Order');
const Product = require('../models/Product');

const orderController = {
  // Récupérer les commandes d'un utilisateur
  getUserOrders: async (req, res) => {
    try {
      const orders = await Order.find({ user: req.user?._id });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Erreur récupération commandes' });
    }
  },

  // Créer une nouvelle commande
  createOrder: async (req, res) => {
    try {
      console.log('Données reçues:', req.body);
      console.log('User ID:', req.user?._id);

      const orderData = {
        ...req.body,
        user: req.user?._id || 'guest',
        status: 'pending',
        payment: {
          ...req.body.payment,
          status: 'pending'
        }
      };

      console.log('Données de commande préparées:', orderData);

      const order = new Order(orderData);
      await order.save();

      console.log('Commande créée avec succès:', order._id);
      res.status(201).json({ success: true, _id: order._id });
    } catch (error) {
      console.error('Erreur détaillée:', error);
      res.status(500).json({ 
        message: 'Erreur création commande',
        error: error.message 
      });
    }
  },

  // Mettre à jour le statut d'une commande
  updateOrderStatus: async (req, res) => {
    try {
      const order = await Order.findByIdAndUpdate(
        req.params.orderId,
        { status: req.body.status },
        { new: true }
      );
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Erreur mise à jour statut' });
    }
  },

  // Mettre à jour le statut du paiement
  updatePaymentStatus: async (req, res) => {
    try {
      const order = await Order.findByIdAndUpdate(
        req.params.orderId,
        { 
          'payment.status': req.body.paymentStatus,
          'payment.transactionId': req.body.transactionId,
          'payment.paymentDate': new Date()
        },
        { new: true }
      );
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Erreur mise à jour paiement' });
    }
  }
};

module.exports = orderController; 