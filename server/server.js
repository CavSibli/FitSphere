const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const guestOrderRoutes = require('./routes/guestOrderRoutes');
const productRoutes = require('./routes/productRoutes');

// Configuration
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guest-orders', guestOrderRoutes);

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Erreur serveur interne',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Connexion à MongoDB avec options améliorées
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitsphere', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connecté à MongoDB');
  // Démarrer le serveur seulement après la connexion à MongoDB
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('Erreur de connexion à MongoDB:', err);
  process.exit(1);
});
