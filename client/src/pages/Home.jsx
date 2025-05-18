import React from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../app/features/products/productsApiSlice';
import fitnessWorkout from '../assets/images/fitness-workout.jpg';
import '../styles/Home.scss';

const Home = () => {
  const { data: products, isLoading, error } = useGetProductsQuery();
  
  const trendyProducts = products?.filter(product => product.trendy) || [];

  const addToCart = (product) => {
    try {
      console.log('Adding product to cart:', product);
      
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingProduct = cart.find(item => item.product?._id === product._id);

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        // S'assurer que toutes les propriétés nécessaires sont présentes
        const cartItem = {
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image
          },
          quantity: 1
        };

        console.log('New cart item:', cartItem);
        cart.push(cartItem);
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      console.log('Updated cart:', cart);
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  if (isLoading) return <div className="loading">Chargement des produits...</div>;
  if (error) return <div className="error">Erreur lors du chargement des produits</div>;

  return (
    <div className="home-container">
      <section className="hero-section" style={{ backgroundImage: `url(${fitnessWorkout})` }}>
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Bienvenue sur FitSphere</h1>
            <p>Découvrez nos produits tendance pour votre bien-être</p>
            <Link to="/products" className="cta-button">Voir tous les produits</Link>
          </div>
        </div>
      </section>

      <section className="trendy-products">
        <h2>Produits Tendance</h2>
        <div className="products-grid">
          {trendyProducts.map(product => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">{product.price} €</p>
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
      </section>
    </div>
  );
};

export default Home;