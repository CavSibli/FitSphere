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
  origin: 'http://localhost:5173', // URL de votre frontend Vite
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

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API FitSphere est en ligne' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Le serveur fonctionne correctement' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur' });
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitsphere')
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
