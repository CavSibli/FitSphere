import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const [trendyProducts, setTrendyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendyProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        const trendyProducts = response.data.filter(product => product.trendy);
        setTrendyProducts(trendyProducts);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des produits tendance');
        setLoading(false);
      }
    };

    fetchTrendyProducts();
  }, []);

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item._id === product._id);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
  };

  if (loading) return <div className="loading">Chargement des produits...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1>Bienvenue sur FitSphere</h1>
        <p>Découvrez nos produits tendance pour votre bien-être</p>
        <Link to="/products" className="cta-button">Voir tous les produits</Link>
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