import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCreateGuestOrderMutation } from '../app/features/orders/guestOrdersApiSlice';
import { useCreateUserOrderMutation } from '../app/features/orders/userOrdersApiSlice';
import '../styles/Cart.scss';

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
    paymentMethod: 'card',
    phone: '',
    company: '',
    additionalInfo: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    cardName: '',
    paypalEmail: ''
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [createGuestOrder, { isLoading: isGuestOrderLoading }] = useCreateGuestOrderMutation();
  const [createUserOrder, { isLoading: isUserOrderLoading }] = useCreateUserOrderMutation();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
        localStorage.removeItem('cart');
        setCartItems([]);
      }
    }
  }, []);

  useEffect(() => {
    const newTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cartItems]);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedItems = cartItems.map(item =>
      item.product._id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const removeItem = (productId) => {
    const updatedItems = cartItems.filter(item => item.product._id !== productId);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setPaymentError(null);
  };

  const validateForm = () => {
    const requiredFields = ['street', 'city', 'postalCode', 'country'];
    if (isGuest) {
      requiredFields.push('name', 'email', 'phone');
    }
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      setPaymentError(`Veuillez remplir les champs obligatoires: ${missingFields.join(', ')}`);
      return false;
    }

    if (formData.email && !formData.email.includes('@')) {
      setPaymentError('Veuillez entrer une adresse email valide');
      return false;
    }

    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber || formData.cardNumber.length < 16) {
        setPaymentError('Veuillez entrer un numéro de carte valide');
        return false;
      }
      if (!formData.cardExpiry || !formData.cardExpiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
        setPaymentError('Veuillez entrer une date d\'expiration valide (MM/AA)');
        return false;
      }
      if (!formData.cardCVC || formData.cardCVC.length < 3) {
        setPaymentError('Veuillez entrer un code CVC valide');
        return false;
      }
      if (!formData.cardName) {
        setPaymentError('Veuillez entrer le nom sur la carte');
        return false;
      }
    }

    return true;
  };

  const handleGuestCheckout = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        guestInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        products: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: total,
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        billingAddress: {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        status: 'pending',
        payment: {
          method: formData.paymentMethod === 'card' ? 'credit_card' : 'paypal',
          status: 'pending',
          amount: total,
          transactionId: `TXN-${Date.now()}`,
          paymentDate: new Date(),
          paymentDetails: formData.paymentMethod === 'paypal' ? {
            paypalEmail: formData.paypalEmail || formData.email
          } : {
            cardLast4: formData.cardNumber.slice(-4),
            cardName: formData.cardName,
            cardExpiry: formData.cardExpiry
          }
        },
        additionalInfo: formData.additionalInfo
      };

      const result = await createGuestOrder(orderData).unwrap();
      localStorage.removeItem('cart');
      setCartItems([]);
      navigate(`/order-confirmation/${result._id}`);
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      setPaymentError(error.data?.message || 'Erreur lors de la création de la commande. Veuillez réessayer.');
    }
  };

  const handleUserCheckout = async (e) => {
    e.preventDefault();
    try {
      if (!user) {
        setPaymentError('Vous devez être connecté pour passer une commande en tant qu\'utilisateur');
        return;
      }

      const orderData = {
        products: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: total,
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        billingAddress: {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        payment: {
          method: formData.paymentMethod === 'card' ? 'card' : 'paypal',
          status: 'pending',
          amount: total,
          paymentDetails: formData.paymentMethod === 'paypal' ? {
            paypalEmail: formData.paypalEmail || formData.email
          } : {
            cardLast4: formData.cardNumber.slice(-4),
            cardName: formData.cardName,
            cardExpiry: formData.cardExpiry
          },
          currency: 'EUR',
          paymentDate: new Date(),
          transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`
        },
        status: 'pending'
      };

      console.log('Données de commande qui seront envoyées:', orderData);
      const result = await createUserOrder(orderData).unwrap();
      localStorage.removeItem('cart');
      setCartItems([]);
      navigate(`/order-confirmation/${result._id}`);
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      setPaymentError(error.data?.message || 'Erreur lors de la création de la commande. Veuillez réessayer.');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setPaymentError(null);
    setIsProcessingPayment(true);
    
    try {
      if (!validateForm()) {
        setIsProcessingPayment(false);
        return;
      }

      if (!isGuest && !user) {
        setPaymentError('Vous devez être connecté pour passer une commande en tant qu\'utilisateur');
        setIsProcessingPayment(false);
        return;
      }

      if (isGuest) {
        await handleGuestCheckout(e);
      } else {
        await handleUserCheckout(e);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      setPaymentError(error.data?.message || 'Erreur lors du traitement du paiement');
    } finally {
      setIsProcessingPayment(false);
    }
  };

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
          {cartItems.map((item) => {
            if (!item?.product) {
              console.log('Invalid item found:', item);
              return null;
            }

            return (
              <div key={item.product._id} className="cart-item">
                <div className="item-image">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name}
                    onError={(e) => {
                      console.log('Image loading error for product:', item.product);
                      e.target.src = 'placeholder-image-url';
                    }}
                  />
                </div>
                <div className="item-details">
                  <h3>{item.product.name}</h3>
                  <p className="item-price">{item.product.price} €</p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.product._id)} className="remove-item">
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <h2>Résumé de la commande</h2>
          <div className="summary-details">
            <p>Total : {total.toFixed(2)} €</p>
          </div>
          {!showCheckoutForm && (
            <div className="checkout-options">
              {user ? (
                <button 
                  onClick={() => {
                    setIsGuest(false);
                    setShowCheckoutForm(true);
                  }} 
                  className="checkout-button"
                >
                  Commander en tant qu'utilisateur
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/login')} 
                  className="checkout-button"
                >
                  Se connecter pour commander
                </button>
              )}
              <button 
                onClick={() => {
                  setIsGuest(true);
                  setShowCheckoutForm(true);
                }} 
                className="checkout-button guest"
              >
                Commander en tant qu'invité
              </button>
            </div>
          )}
        </div>

        {showCheckoutForm && (
          <div className="checkout-form-container">
            <h2>{isGuest ? 'Commander en tant qu\'invité' : 'Commander en tant qu\'utilisateur'}</h2>
            {paymentError && (
              <div className="error-message">
                {paymentError}
              </div>
            )}
            <form onSubmit={handleCheckout} className="checkout-form">
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

              <div className="payment-section">
                <h3>Méthode de paiement</h3>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                >
                  <option value="card">Carte bancaire</option>
                  <option value="paypal">PayPal</option>
                </select>

                {formData.paymentMethod === 'card' && (
                  <div className="card-details">
                    <input
                      type="text"
                      name="cardName"
                      placeholder="Nom sur la carte"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="Numéro de carte"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="card-row">
                      <input
                        type="text"
                        name="cardExpiry"
                        placeholder="MM/AA"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="cardCVC"
                        placeholder="CVC"
                        value={formData.cardCVC}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'paypal' && (
                  <div className="paypal-details">
                    <input
                      type="email"
                      name="paypalEmail"
                      placeholder="Email PayPal"
                      value={formData.paypalEmail}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="additionalInfo">Instructions de livraison (optionnel)</label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  placeholder="Instructions spéciales pour la livraison..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckoutForm(false);
                    setIsGuest(false);
                  }}
                  className="cancel-button"
                >
                  Retour
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isProcessingPayment || isGuestOrderLoading || isUserOrderLoading}
                >
                  {isProcessingPayment ? 'Traitement en cours...' : 'Payer et commander'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 