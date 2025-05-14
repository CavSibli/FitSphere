import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      setError('Erreur lors du chargement des produits');
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    // Récupérer le panier actuel
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Vérifier si le produit est déjà dans le panier
    const existingItem = currentCart.find(item => item.product._id === product._id);
    
    let updatedCart;
    if (existingItem) {
      // Si le produit existe déjà, augmenter la quantité
      updatedCart = currentCart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      // Si le produit n'existe pas, l'ajouter
      updatedCart = [...currentCart, {
        product: product,
        quantity: 1,
        price: product.price
      }];
    }
    
    // Sauvegarder le panier mis à jour
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Afficher une confirmation
    alert('Produit ajouté au panier !');
  };

  if (loading) {
    return <div className="loading">Chargement des produits...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="products-container">
      <h1>Nos Produits</h1>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-price">{product.price.toFixed(2)} €</p>
              <button 
                className="add-to-cart-button"
                onClick={() => addToCart(product)}
              >
                Ajouter au panier
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products; 