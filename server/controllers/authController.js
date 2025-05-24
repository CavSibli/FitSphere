const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sanitize = require('mongo-sanitize');

// Générer un token JWT
const generateToken = (id) => {
  try {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    return token;
  } catch (error) {
    console.error('Erreur lors de la génération du token:', error);
    throw error;
  }
};

// Enregistrer un nouvel utilisateur
exports.register = async (req, res) => {
  try {
    const sanitizedBody = sanitize(req.body);
    const { username, email, password} = sanitizedBody;

    // Vérifier si l'utilisateur existe déjà par email
    const userExistsByEmail = await User.findOne({ email });
    if (userExistsByEmail) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    // Vérifier si le nom d'utilisateur existe déjà
    const userExistsByUsername = await User.findOne({ username });
    if (userExistsByUsername) {
      return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
    }

    // Créer le nouvel utilisateur
    const user = await User.create({
      username,
      email,
      password,
      role:'user',
    });

    // Générer le token
    const token = generateToken(user._id);

    const response = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    
    // Gestion spécifique des erreurs MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'username') {
        return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
      } else if (field === 'email') {
        return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
      }
    }
    
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement' });
  }
};

// Connecter un utilisateur
exports.login = async (req, res) => {
  try {
    const sanitizedBody = sanitize(req.body);
    const { email, password } = sanitizedBody;

    // Validation des champs requis
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer le token
    const token = generateToken(user._id);

    // Envoyer la réponse
    const response = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion' });
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
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
}; 