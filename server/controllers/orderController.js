const Order = require('../models/Order');
const Product = require('../models/Product');
const sanitize = require('mongo-sanitize');

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
      const sanitizedBody = sanitize(req.body);
      const sanitizedUserId = sanitize(req.user?._id);

      const orderData = {
        ...sanitizedBody,
        user: sanitizedUserId || 'guest',
        status: 'pending',
        payment: {
          ...sanitizedBody.payment,
          status: 'pending'
        }
      };

      const order = new Order(orderData);
      await order.save();

      res.status(201).json({ success: true, _id: order._id });
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur création commande',
        error: error.message 
      });
    }
  },

  // Mettre à jour le statut d'une commande
  updateOrderStatus: async (req, res) => {
    try {
      const sanitizedId = sanitize(req.params.orderId);
      const sanitizedBody = sanitize(req.body);

      const order = await Order.findByIdAndUpdate(
        sanitizedId,
        { status: sanitizedBody.status },
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
      const sanitizedId = sanitize(req.params.orderId);
      const sanitizedBody = sanitize(req.body);

      const order = await Order.findByIdAndUpdate(
        sanitizedId,
        { 
          'payment.status': sanitizedBody.paymentStatus,
          'payment.transactionId': sanitizedBody.transactionId,
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