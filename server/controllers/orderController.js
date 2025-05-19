const Order = require('../models/Order');
const Product = require('../models/Product');

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

// Fonction utilitaire pour générer un ID de transaction
function generateTransactionId() {
  return 'txn_' + Math.random().toString(36).substr(2, 9);
}

// Créer une nouvelle commande
exports.createOrder = async (req, res) => {
  try {
    const { 
      products, 
      totalAmount, 
      shippingAddress, 
      billingAddress,
      paymentMethod,
      paymentDetails 
    } = req.body;
    
    console.log('Données reçues:', {
      products,
      totalAmount,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentDetails
    });

    const userId = req.user._id;
    console.log('User ID:', userId);

    // Vérifier que tous les produits existent
    for (const item of products) {
      console.log('Vérification du produit:', item);
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Produit non trouvé: ${item.product}` });
      }
      item.price = product.price;
    }

    // Vérifier la méthode de paiement
    if (!['card', 'paypal'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Méthode de paiement invalide' });
    }

    // Créer l'objet de paiement
    const payment = {
      method: paymentMethod,
      status: 'pending',
      amount: totalAmount,
      paymentDetails: paymentDetails,
      transactionId: generateTransactionId(),
      paymentDate: new Date()
    };

    console.log('Objet payment créé:', payment);

    const order = new Order({
      user: userId,
      products,
      totalAmount,
      shippingAddress,
      billingAddress,
      payment,
      status: 'pending'
    });

    console.log('Nouvelle commande créée:', order);

    await order.save();
    console.log('Commande sauvegardée avec succès:', order._id);

    // Simuler un traitement de paiement réussi
    order.payment.status = 'completed';
    await order.save();

    res.status(201).json(order);
  } catch (error) {
    console.error('Erreur détaillée lors de la création de la commande:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Erreur lors de la création de la commande',
      error: error.message 
    });
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

// Mettre à jour le statut du paiement
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier si l'utilisateur est autorisé à modifier la commande
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    order.payment.status = paymentStatus;
    if (transactionId) {
      order.payment.transactionId = transactionId;
    }
    if (paymentStatus === 'completed') {
      order.payment.paymentDate = new Date();
    }

    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de paiement:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut de paiement' });
  }
}; 