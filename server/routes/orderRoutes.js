const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

// Récupérer les commandes d'un utilisateur
router.get('/user/:userId', auth, orderController.getUserOrders);

// Créer une nouvelle commande
router.post('/', auth, orderController.createOrder);

// Mettre à jour le statut d'une commande
router.patch('/:orderId/status', auth, orderController.updateOrderStatus);

module.exports = router; 