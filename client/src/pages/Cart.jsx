import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'France',
    paymentMethod: 'credit_card',
    phone: '',
    company: '',
    additionalInfo: ''
  });
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
      calculateTotal(parsedCart);
    }
  }, []);

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(sum);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map(item => 
      item.product._id === productId ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    calculateTotal(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (productId) => {
    const updatedCart = cartItems.filter(item => item.product._id !== productId);
    setCartItems(updatedCart);
    calculateTotal(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    try {
      const shippingAddress = {
        street: formData.street,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country
      };

      // Formater les données du panier
      const formattedCartItems = cartItems.map(item => ({
        product: {
          _id: item.product._id,
          name: item.product.name,
          price: item.price,
          image: item.product.image
        },
        quantity: item.quantity,
        price: item.price
      }));

      if (isGuest) {
        // Commande invité
        const guestOrderData = {
          guestInfo: {
            name: formData.name,
            email: formData.email
          },
          products: formattedCartItems,
          totalAmount: total,
          shippingAddress,
          status: 'processing',
          paymentMethod: formData.paymentMethod,
          paymentStatus: 'completed'
        };

        console.log('Données de commande invité:', JSON.stringify(guestOrderData, null, 2));

        const response = await axios.post('http://localhost:5000/api/guest-orders/checkout', guestOrderData);
        
        if (response.data.success) {
          setOrderNumber(response.data.order.orderNumber);
          // Vider le panier
          localStorage.removeItem('cart');
          setCartItems([]);
          setOrderSuccess(true);
        }
      } else {
        // Commande utilisateur connecté
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
          alert('Veuillez vous connecter pour passer commande');
          navigate('/login');
          return;
        }

        const orderData = {
          user: userData._id,
          products: formattedCartItems,
          totalAmount: total,
          shippingAddress,
          paymentMethod: formData.paymentMethod,
          status: 'processing',
          paymentStatus: 'completed'
        };

        const response = await axios.post('http://localhost:5000/api/orders/checkout', orderData);
        
        if (response.data) {
          // Vider le panier
          localStorage.removeItem('cart');
          setCartItems([]);
          setOrderSuccess(true);
          // Rediriger vers le dashboard après 3 secondes
          setTimeout(() => {
            navigate('/dashboard-user');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Erreur détaillée lors de la commande:', error);
      console.error('Réponse du serveur:', error.response?.data);
      alert('Erreur lors de la création de la commande. Veuillez réessayer.');
    }
  };

  if (orderSuccess) {
    return (
      <div className="cart-container">
        <div className="order-success">
          <h1>Commande confirmée !</h1>
          {isGuest ? (
            <>
              <p>Merci pour votre commande.</p>
              <p>Votre numéro de commande est : {orderNumber}</p>
              <p>Un email de confirmation a été envoyé à {formData.email}</p>
            </>
          ) : (
            <p>Merci pour votre commande. Vous allez être redirigé vers votre espace personnel.</p>
          )}
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <h1>Votre Panier</h1>
        <div className="empty-cart">
          <p>Votre panier est vide</p>
          <button onClick={() => navigate('/products')} className="continue-shopping">
            Continuer vos achats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Votre Panier</h1>
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.product._id} className="cart-item">
              <div className="item-image">
                <img src={item.product.image} alt={item.product.name} />
              </div>
              <div className="item-details">
                <h3>{item.product.name}</h3>
                <p className="item-price">{item.price.toFixed(2)} €</p>
              </div>
              <div className="item-quantity">
                <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
              </div>
              <div className="item-total">
                <p>{(item.price * item.quantity).toFixed(2)} €</p>
              </div>
              <button 
                className="remove-item"
                onClick={() => removeItem(item.product._id)}
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h2>Récapitulatif</h2>
          <div className="summary-row">
            <span>Sous-total</span>
            <span>{total.toFixed(2)} €</span>
          </div>
          <div className="summary-row">
            <span>Livraison</span>
            <span>Gratuite</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{total.toFixed(2)} €</span>
          </div>
          {!showCheckoutForm ? (
            <div className="checkout-options">
              <button 
                className="checkout-button"
                onClick={() => {
                  setIsGuest(false);
                  setShowCheckoutForm(true);
                }}
              >
                Commander en tant qu'utilisateur
              </button>
              <button 
                className="checkout-button guest"
                onClick={() => {
                  setIsGuest(true);
                  setShowCheckoutForm(true);
                }}
              >
                Commander en tant qu'invité
              </button>
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="checkout-form">
              <h2>Informations de livraison</h2>
              
              {isGuest && (
                <>
                  <div className="form-group">
                    <label htmlFor="name">Nom complet *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Téléphone *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="company">Entreprise (optionnel)</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Nom de votre entreprise"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="street">Adresse de livraison *</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                  placeholder="Numéro et nom de rue"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">Ville *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="Votre ville"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="postalCode">Code postal *</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    placeholder="Code postal"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="country">Pays *</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                >
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Luxembourg">Luxembourg</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="additionalInfo">Informations supplémentaires (optionnel)</label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  placeholder="Instructions de livraison, commentaires..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="paymentMethod">Méthode de paiement *</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                >
                  <option value="credit_card">Carte de crédit</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowCheckoutForm(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="submit-button">
                  Confirmer la commande
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart; 