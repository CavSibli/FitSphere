const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Vérifier si le token est présent dans les headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Non autorisé - Token manquant' });
    }

    // Extraire le token
    const token = authHeader.split(' ')[1];

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token décodé:', decoded);

    // Vérifier si l'utilisateur existe toujours
    const user = await User.findById(decoded.userId || decoded.id);
    if (!user) {
      console.error('Utilisateur non trouvé pour le token:', decoded);
      return res.status(401).json({ message: 'Non autorisé - Utilisateur non trouvé' });
    }

    // S'assurer que l'ID est disponible dans le format attendu
    user.id = user._id;

    // Ajouter l'utilisateur à la requête
    req.user = user;
    console.log('Utilisateur authentifié:', { id: user.id, role: user.role });
    
    next();
  } catch (error) {
    console.error('Erreur d\'authentification complète:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Non autorisé - Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Non autorisé - Token expiré' });
    }
    res.status(500).json({ 
      message: 'Erreur d\'authentification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware pour vérifier le rôle admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé - Droits administrateur requis' });
  }
};

// Middleware pour vérifier le rôle user
const isUser = (req, res, next) => {
  if (req.user && (req.user.role === 'user' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé - Droits utilisateur requis' });
  }
};

module.exports = {
  auth,
  isAdmin,
  isUser
}; 