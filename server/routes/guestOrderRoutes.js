const express = require('express');
const router = express.Router();
const guestOrderController = require('../controllers/guestOrderController');
const { auth, isAdmin } = require('../middleware/auth');

// Route pour créer une commande invité
router.post('/checkout', guestOrderController.createGuestOrder);

// Routes protégées (admin uniquement)
router.get('/', auth, isAdmin, guestOrderController.getAllGuestOrders);
router.get('/:id', auth, isAdmin, guestOrderController.getGuestOrder);
router.patch('/:id/status', auth, isAdmin, guestOrderController.updateGuestOrderStatus);

module.exports = router; 