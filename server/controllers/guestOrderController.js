const GuestOrder = require('../models/GuestOrder');
const sanitize = require('mongo-sanitize');

const guestOrderController = {
  // Créer une nouvelle commande invité
  createGuestOrder: async (req, res) => {
    try {
      const sanitizedBody = sanitize(req.body);
      const order = new GuestOrder(sanitizedBody);
      await order.save();
      res.status(201).json({ success: true, _id: order._id });
    } catch (error) {
      console.error('Erreur création commande:', error);
      res.status(500).json({ message: 'Erreur création commande' });
    }
  },

  // Obtenir toutes les commandes invitées (admin)
  getAllGuestOrders: async (req, res) => {
    try {
      const orders = await GuestOrder.find();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Erreur récupération commandes' });
    }
  },

  // Obtenir une commande invité spécifique
  getGuestOrderById: async (req, res) => {
    try {
      const sanitizedId = sanitize(req.params.id);
      const order = await GuestOrder.findById(sanitizedId);
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Erreur récupération commande' });
    }
  },

  // Mettre à jour le statut d'une commande invité (admin)
  updateGuestOrderStatus: async (req, res) => {
    try {
      const sanitizedId = sanitize(req.params.id);
      const sanitizedBody = sanitize(req.body);

      const order = await GuestOrder.findByIdAndUpdate(
        sanitizedId,
        { status: sanitizedBody.status },
        { new: true }
      );
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Erreur mise à jour statut' });
    }
  }
};

module.exports = guestOrderController; 