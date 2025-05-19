const GuestOrder = require('../models/GuestOrder');
const Product = require('../models/Product');

const guestOrderController = {
  // Créer une nouvelle commande invité
  createGuestOrder: async (req, res) => {
    try {
      const {
        guestInfo,
        products,
        shippingAddress,
        billingAddress,
        payment
      } = req.body;

      // Vérifier que tous les produits existent
      for (const item of products) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Produit non trouvé: ${item.product}` });
        }
        item.price = product.price;
      }

      // Calculer le montant total
      const totalAmount = products.reduce((total, item) => total + (item.price * item.quantity), 0);

      // Créer la commande
      const order = new GuestOrder({
        guestInfo,
        products,
        totalAmount,
        shippingAddress,
        billingAddress,
        payment: {
          ...payment,
          amount: totalAmount,
          paymentDate: new Date()
        }
      });

      await order.save();

      res.status(201).json(order);
    } catch (error) {
      console.error('Erreur lors de la création de la commande invité:', error);
      res.status(500).json({ message: 'Erreur lors de la création de la commande' });
    }
  },

  // Obtenir toutes les commandes invitées (admin)
  getAllGuestOrders: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      const orders = await GuestOrder.find()
        .sort({ createdAt: -1 })
        .populate('products.product');

      res.json(orders);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes invitées:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
    }
  },

  // Obtenir une commande invité spécifique
  getGuestOrderById: async (req, res) => {
    try {
      const order = await GuestOrder.findById(req.params.id)
        .populate('products.product');

      if (!order) {
        return res.status(404).json({ message: 'Commande non trouvée' });
      }

      res.json(order);
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande invité:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de la commande' });
    }
  },

  // Mettre à jour le statut d'une commande invité (admin)
  updateGuestOrderStatus: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      const { status } = req.body;
      const order = await GuestOrder.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: 'Commande non trouvée' });
      }

      order.status = status;
      await order.save();

      res.json(order);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de la commande invité:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
    }
  }
};

module.exports = guestOrderController; 