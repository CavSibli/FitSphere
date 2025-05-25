const Product = require('../models/Product');
const sanitize = require('mongo-sanitize');

// Récupérer tous les produits
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des produits', error: error.message });
  }
};

// Récupérer un produit par son ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du produit', error: error.message });
  }
};

// Créer un nouveau produit
exports.createProduct = async (req, res) => {
  try {
    // Sanitization des données entrantes
    const sanitizedData = sanitize(req.body);
    const product = new Product(sanitizedData);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création du produit', error: error.message });
  }
};

// Mettre à jour un produit
exports.updateProduct = async (req, res) => {
  try {
    // Sanitization des données entrantes et de l'ID
    const sanitizedId = sanitize(req.params.id);
    const sanitizedData = sanitize(req.body);
    
    const product = await Product.findByIdAndUpdate(
      sanitizedId,
      sanitizedData,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour du produit', error: error.message });
  }
};

// Mettre à jour le statut trendy d'un produit
exports.updateTrendyStatus = async (req, res) => {
  try {
    // Sanitization des données entrantes et de l'ID
    const sanitizedId = sanitize(req.params.id);
    const sanitizedBody = sanitize(req.body);
    const { trendy } = sanitizedBody;
    
    if (typeof trendy !== 'boolean') {
      return res.status(400).json({ message: 'Le statut trendy doit être un booléen' });
    }

    // Trouver d'abord le produit
    const product = await Product.findById(sanitizedId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Mettre à jour le statut trendy
    product.trendy = trendy;
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour du statut trendy', error: error.message });
  }
};

// Supprimer un produit
exports.deleteProduct = async (req, res) => {
  try {
    // Sanitization de l'ID
    const sanitizedId = sanitize(req.params.id);
    
    // Utilisation de deleteOne au lieu de findByIdAndDelete pour de meilleures performances
    const result = await Product.deleteOne({ _id: sanitizedId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    
    res.status(200).json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du produit', error: error.message });
  }
}; 