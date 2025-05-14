const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, isAdmin } = require('../middleware/auth');

// Routes protégées par authentification et rôle admin
router.get('/stats', auth, isAdmin, adminController.getStats);
router.get('/orders', auth, isAdmin, adminController.getAllOrders);
router.patch('/orders/:orderId/status', auth, isAdmin, adminController.updateOrderStatus);
router.delete('/users/:userId', auth, isAdmin, adminController.deleteUser);

module.exports = router; 