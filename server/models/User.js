const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Le nom d\'utilisateur est requis'],
    minlength: [3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Veuillez fournir une adresse email valide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware pour hasher le mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    console.log('Comparaison des mots de passe');
    console.log('Mot de passe entré:', !!enteredPassword);
    console.log('Mot de passe hashé:', !!this.password);
    
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('Résultat de la comparaison:', isMatch);
    
    return isMatch;
  } catch (error) {
    console.error('Erreur lors de la comparaison des mots de passe:', error);
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User; 