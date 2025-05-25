import React, { useState } from 'react';
import { useGetProductsQuery } from '../app/features/products/productsApiSlice';
import '../styles/Products.scss';

const Products = () => {
  const { data: products, isLoading, error } = useGetProductsQuery();
  const [notification, setNotification] = useState({ show: false, message: '', productName: '' });

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
    
    // Afficher la notification
    setNotification({
      show: true,
      message: existingItem ? 'Quantité mise à jour dans le panier' : 'Produit ajouté au panier',
      productName: product.name
    });

    // Faire disparaître la notification après 3 secondes
    setTimeout(() => {
      setNotification({ show: false, message: '', productName: '' });
    }, 3000);
  };

  if (isLoading) {
    return (
      <div role="status" aria-label="Chargement des produits" className="loading">
        Chargement des produits...
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" aria-label="Erreur de chargement des produits" className="error">
      {error.status === 404 ? 'Aucun produit trouvé' : 'Erreur lors du chargement des produits'}
      </div>
    );
  }

  return (
    <div className="products-container" role="region" aria-label="Liste des produits">
      {notification.show && (
        <div 
          role="status" 
          aria-live="polite" 
          className="notification"
        >
          <p>
            <strong>{notification.productName}</strong> {notification.message}
          </p>
        </div>
      )}

      <h1>Nos Produits</h1>
      
      <section className="products-grid" role="list" aria-label="Grille des produits">
        {products?.map((product) => (
          <article key={product._id} className="product-card" role="listitem">
            <img 
              src={product.image} 
              alt={product.name} 
              className="product-image"
            />
            <div className="product-info">
              <h2>{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <p className="product-price">{product.price}€</p>
              <button 
                onClick={() => addToCart(product)}
                className="add-to-cart-button"
                aria-label={`Ajouter ${product.name} au panier`}
              >
                Ajouter au panier
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Products; 