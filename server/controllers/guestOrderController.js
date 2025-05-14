const GuestOrder = require('../models/GuestOrder');

const guestOrderController = {
  // Créer une nouvelle commande invité
  createGuestOrder: async (req, res) => {
    try {
      const {
        guestInfo,
        products,
        totalAmount,
        shippingAddress,
        paymentMethod,
        status,
        paymentStatus
      } = req.body;

      // Générer un numéro de commande unique (format: G + YYMMDD + 4 chiffres)
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      
      // Trouver le dernier numéro de commande du jour
      const lastOrder = await GuestOrder.findOne({
        orderNumber: new RegExp(`^G${year}${month}${day}`)
      }).sort({ orderNumber: -1 });

      let sequence = '0001';
      if (lastOrder) {
        const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
        sequence = (lastSequence + 1).toString().padStart(4, '0');
      }

      const orderNumber = `G${year}${month}${day}${sequence}`;

      // Créer la nouvelle commande
      const newOrder = new GuestOrder({
        guestInfo,
        products,
        totalAmount,
        shippingAddress,
        status,
        paymentMethod,
        paymentStatus,
        orderNumber
      });

      await newOrder.save();

      res.status(201).json({
        success: true,
        message: 'Commande créée avec succès',
        order: newOrder
      });
    } catch (error) {
      console.error('Erreur lors de la création de la commande invité:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la commande',
        error: error.message
      });
    }
  },

  // Obtenir toutes les commandes invitées
  getAllGuestOrders: async (req, res) => {
    try {
      const orders = await GuestOrder.find().sort({ createdAt: -1 });
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des commandes',
        error: error.message
      });
    }
  },

  // Obtenir une commande invité spécifique
  getGuestOrder: async (req, res) => {
    try {
      const order = await GuestOrder.findById(req.params.id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Commande non trouvée'
        });
      }
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la commande',
        error: error.message
      });
    }
  },

  // Mettre à jour le statut d'une commande invité
  updateGuestOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const order = await GuestOrder.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Commande non trouvée'
        });
      }
      res.status(200).json({
        success: true,
        message: 'Statut de la commande mis à jour',
        order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du statut',
        error: error.message
      });
    }
  }
};

module.exports = guestOrderController; 