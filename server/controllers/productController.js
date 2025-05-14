const Product = require('../models/Product');

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
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création du produit', error: error.message });
  }
};

// Mettre à jour un produit
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    const { trendy } = req.body;
    console.log('Mise à jour du statut trendy:', {
      productId: req.params.id,
      newTrendyStatus: trendy,
      body: req.body
    });

    // Trouver d'abord le produit
    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log('Produit non trouvé:', req.params.id);
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Mettre à jour le statut trendy
    product.trendy = trendy;
    await product.save();

    console.log('Produit mis à jour avec succès:', product);
    res.status(200).json(product);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut trendy:', error);
    res.status(400).json({ message: 'Erreur lors de la mise à jour du statut trendy', error: error.message });
  }
};

// Supprimer un produit
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    res.status(200).json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du produit', error: error.message });
  }
}; 