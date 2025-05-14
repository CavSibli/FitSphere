const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Générer un token JWT
const generateToken = (id) => {
  try {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
  } catch (error) {
    console.error('Erreur lors de la génération du token:', error);
    throw error;
  }
};

// Enregistrer un nouvel utilisateur
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    // Créer le nouvel utilisateur
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user',
    });

    // Générer le token
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement' });
  }
};

// Connecter un utilisateur
exports.login = async (req, res) => {
  try {
    console.log('Début de la tentative de connexion');
    console.log('Données reçues:', { email: req.body.email });
    
    const { email, password } = req.body;

    // Validation des champs requis
    if (!email || !password) {
      console.log('Champs manquants:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Vérifier si l'utilisateur existe
    console.log('Recherche de l\'utilisateur avec l\'email:', email);
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('Utilisateur non trouvé pour l\'email:', email);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    console.log('Utilisateur trouvé:', { 
      id: user._id, 
      email: user.email,
      hasPassword: !!user.password 
    });

    // Vérifier le mot de passe
    try {
      console.log('Vérification du mot de passe');
      const isMatch = await user.matchPassword(password);
      console.log('Résultat de la vérification du mot de passe:', isMatch);
      
      if (!isMatch) {
        console.log('Mot de passe incorrect pour:', email);
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du mot de passe:', error);
      return res.status(500).json({ 
        message: 'Erreur lors de la vérification du mot de passe',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Générer le token
    console.log('Génération du token pour l\'utilisateur:', user._id);
    const token = generateToken(user._id);
    console.log('Token généré avec succès');

    console.log('Connexion réussie pour:', { 
      id: user._id, 
      email: user.email,
      role: user.role 
    });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Erreur détaillée lors de la connexion:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtenir le profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
};

// Obtenir tous les utilisateurs (admin seulement)
exports.getAllUsers = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
}; 