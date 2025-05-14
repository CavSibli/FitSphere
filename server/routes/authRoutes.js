const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes protégées
router.get('/profile', auth, authController.getProfile);
router.get('/users', auth, isAdmin, authController.getAllUsers);

// Route pour créer un admin initial (à protéger en production)
router.post('/create-admin', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ message: 'Un administrateur existe déjà' });
    }

    // Créer l'admin
    const admin = await User.create({
      username,
      email,
      password,
      role: 'admin'
    });

    res.status(201).json({
      message: 'Administrateur créé avec succès',
      admin: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'admin:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'administrateur' });
  }
});

module.exports = router; 