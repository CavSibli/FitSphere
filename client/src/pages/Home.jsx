import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../app/features/products/productsApiSlice';
import fitnessWorkout from '../assets/images/fitness-workout.jpg';
import '../styles/Home.scss';

const Home = () => {
  const { data: products, isLoading, error } = useGetProductsQuery();
  const [notification, setNotification] = useState({ show: false, message: '', productName: '' });
  
  const trendyProducts = products?.filter(product => product.trendy) || [];

  const addToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingProduct = cart.find(item => item.product?._id === product._id);

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        const cartItem = {
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image
          },
          quantity: 1
        };
        cart.push(cartItem);
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Afficher la notification
      setNotification({
        show: true,
        message: existingProduct ? 'Quantité mise à jour dans le panier' : 'Produit ajouté au panier',
        productName: product.name
      });

      // Faire disparaître la notification après 3 secondes
      setTimeout(() => {
        setNotification({ show: false, message: '', productName: '' });
      }, 3000);
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  if (isLoading) return (
    <div role="status" aria-label="Chargement des produits" className="loading">
      Chargement des produits...
    </div>
  );
  
  if (error) return (
    <div role="alert" aria-label="Erreur de chargement des produits" className="error">
      Erreur lors du chargement des produits
    </div>
  );

  return (
    <div className="home-container" role="region" aria-label="Page d'accueil FitSphere">
      {notification.show && (
        <div 
          role="status" 
          aria-live="polite" 
          className="notification"
        >
          <p>
            <strong>{notification.productName}</strong> : {notification.message}
          </p>
        </div>
      )}

      <section className="hero-section" style={{ backgroundImage: `url(${fitnessWorkout})` }} aria-label="Bannière principale">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Bienvenue sur FitSphere</h1>
            <p>Découvrez nos produits tendance pour votre bien-être</p>
            <Link to="/products" className="cta-button" aria-label="Voir tous les produits disponibles">
              Voir tous les produits
            </Link>
          </div>
        </div>
      </section>

      <section className="trendy-products" aria-labelledby="trendy-products-heading">
        <h2 id="trendy-products-heading">Produits Tendance</h2>
        <div className="products-grid" role="list" aria-label="Liste des produits tendance">
          {trendyProducts.map(product => (
            <article key={product._id} className="product-card" role="listitem">
              <figure className="product-image">
                <img 
                  src={product.image} 
                  alt={`${product.name} - ${product.price}€`}
                  loading="lazy"
                />
              </figure>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price" aria-label={`Prix: ${product.price}€`}>
                  {product.price} €
                </p>
                <button 
                  className="add-to-cart-button"
                  onClick={() => addToCart(product)}
                  aria-label={`Ajouter ${product.name} au panier`}
                >
                  Ajouter au panier
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;