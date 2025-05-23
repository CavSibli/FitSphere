const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    
    // Vérifier si le token est présent dans les headers
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Non autorisé - Token manquant' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Non autorisé - Format de token invalide' });
    }

    // Extraire le token
    const token = authHeader.split(' ')[1];

    // Vérifier le token avec une valeur par défaut pour JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier si l'utilisateur existe
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Non autorisé - Utilisateur non trouvé' });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    
    
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Non autorisé - Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Non autorisé - Token expiré' });
    }
    
    res.status(500).json({ message: 'Erreur d\'authentification' });
  }
};

// Middleware pour vérifier le rôle admin
const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé - Droits administrateur requis' });
  }
};

// Middleware pour vérifier le rôle user
const isUser = (req, res, next) => {
  if (req.user?.role === 'user' || req.user?.role === 'admin') {
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