const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

// Récupérer les commandes de l'utilisateur connecté
router.get('/user/me', auth, orderController.getUserOrders);

// Récupérer les commandes d'un utilisateur spécifique
router.get('/user/:userId', auth, orderController.getUserOrders);

// Créer une nouvelle commande
router.post('/', auth, orderController.createOrder);

// Mettre à jour le statut d'une commande
router.patch('/:orderId/status', auth, orderController.updateOrderStatus);

module.exports = router; 