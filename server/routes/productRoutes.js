const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, isAdmin } = require('../middleware/auth');

// Routes publiques
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Routes protégées (admin uniquement)
router.post('/', auth, isAdmin, productController.createProduct);
router.put('/:id', auth, isAdmin, productController.updateProduct);
router.delete('/:id', auth, isAdmin, productController.deleteProduct);
router.patch('/:id/trendy', auth, isAdmin, productController.updateTrendyStatus);

module.exports = router; 