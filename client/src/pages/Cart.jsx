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
    paymentMethod: 'credit_card',
    phone: '',
    company: '',
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

    if (formData.paymentMethod === 'credit_card') {
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
    } else if (formData.paymentMethod === 'paypal') {
      if (!formData.paypalEmail && !formData.email) {
        setPaymentError('Veuillez entrer une adresse email PayPal');
        return false;
      }
    }

    return true;
  };

  const handleGuestCheckout = async (e) => {
    e.preventDefault();
    try {
      if (!validateForm()) {
        return;
      }

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
          method: formData.paymentMethod === 'credit_card' ? 'credit_card' : 'paypal',
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
        }
      };

      const result = await createGuestOrder(orderData).unwrap();
      if (result.success) {
        localStorage.removeItem('cart');
        setCartItems([]);
        navigate(`/order-confirmation/${result._id}`);
      } else {
        setPaymentError(result.message || 'Erreur lors de la création de la commande');
      }
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

      if (!validateForm()) {
        return;
      }

      const orderData = {
        user: user._id,
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
          method: formData.paymentMethod === 'credit_card' ? 'credit_card' : 'paypal',
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
        }
      };

      const result = await createUserOrder(orderData).unwrap();
      if (result.success) {
        localStorage.removeItem('cart');
        setCartItems([]);
        navigate('/dashboard-user');
      } else {
        setPaymentError(result.message || 'Erreur lors de la création de la commande');
      }
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
      <section className="cart-container" aria-labelledby="cart-heading">
        <h1 id="cart-heading">Votre Panier</h1>
        <div className="empty-cart" role="status" aria-label="État du panier">
          <p>Votre panier est vide</p>
          <button 
            onClick={() => navigate('/products')} 
            className="continue-shopping"
            aria-label="Continuer vos achats"
          >
            Continuer vos achats
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-container" aria-labelledby="cart-heading">
      <h1 id="cart-heading">Votre Panier</h1>
      <div className="cart-content">
        <section className="cart-items" aria-labelledby="cart-items-heading">
          <h2 id="cart-items-heading" className="visually-hidden">Liste des produits dans le panier</h2>
          {cartItems.map((item) => {
            if (!item?.product) {
              return null;
            }

            return (
              <article key={item.product._id} className="cart-item" aria-labelledby={`item-name-${item.product._id}`}>
                <div className="item-image">
                  <img 
                    src={item.product.image} 
                    alt={`${item.product.name} - ${item.product.price}€`}
                    onError={(e) => {
                      e.target.src = 'placeholder-image-url';
                    }}
                  />
                </div>
                <div className="item-details">
                  <h3 id={`item-name-${item.product._id}`}>{item.product.name}</h3>
                  <p className="item-price" aria-label={`Prix unitaire: ${item.product.price}€`}>
                    {item.product.price} €
                  </p>
                  <div className="quantity-controls" role="group" aria-label={`Contrôles de quantité pour ${item.product.name}`}>
                    <button 
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      aria-label="Diminuer la quantité"
                      className="quantity-button"
                    >-</button>
                    <span aria-live="polite" aria-label={`Quantité actuelle: ${item.quantity}`}>
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      aria-label="Augmenter la quantité"
                      className="quantity-button"
                    >+</button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.product._id)} 
                    className="remove-item"
                    aria-label={`Supprimer ${item.product.name} du panier`}
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="cart-summary" aria-labelledby="cart-summary-heading">
          <h2 id="cart-summary-heading">Résumé de la commande</h2>
          <div className="summary-details">
            <p>Total : <strong aria-label={`Total de la commande: ${total.toFixed(2)}€`}>{total.toFixed(2)} €</strong></p>
          </div>
          {!showCheckoutForm && (
            <nav className="checkout-options" aria-label="Options de commande">
              {user ? (
                <button 
                  onClick={() => {
                    setIsGuest(false);
                    setShowCheckoutForm(true);
                  }} 
                  className="checkout-button"
                  aria-label="Commander en tant qu'utilisateur connecté"
                >
                  Commander en tant qu'utilisateur
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/login')} 
                  className="checkout-button"
                  aria-label="Se connecter pour commander"
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
                aria-label="Commander en tant qu'invité"
              >
                Commander en tant qu'invité
              </button>
            </nav>
          )}
        </aside>

        {showCheckoutForm && (
          <section className="checkout-form-container" aria-labelledby="checkout-form-heading">
            <h2 id="checkout-form-heading">
              {isGuest ? 'Commander en tant qu\'invité' : 'Commander en tant qu\'utilisateur'}
            </h2>
            {paymentError && (
              <div className="error-message" role="alert" aria-live="assertive">
                {paymentError}
              </div>
            )}
            <form 
              onSubmit={handleCheckout} 
              className="checkout-form" 
              aria-label="Formulaire de commande"
              noValidate
            >
              {isGuest && (
                <fieldset aria-labelledby="personal-info-legend">
                  <legend id="personal-info-legend">Informations personnelles</legend>
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
                      aria-required="true"
                      aria-label="Votre nom complet"
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
                      aria-required="true"
                      aria-label="Votre adresse email"
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
                      aria-required="true"
                      aria-label="Votre numéro de téléphone"
                    />
                  </div>
                </fieldset>
              )}
              
              <fieldset aria-labelledby="shipping-legend">
                <legend id="shipping-legend">Adresse de livraison</legend>
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
                    aria-required="true"
                    aria-label="Votre adresse de livraison"
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
                      aria-required="true"
                      aria-label="Votre ville"
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
                      aria-required="true"
                      aria-label="Votre code postal"
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
                    aria-required="true"
                    aria-label="Sélectionnez votre pays"
                >
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Luxembourg">Luxembourg</option>
                </select>
              </div>
              </fieldset>

              <fieldset aria-labelledby="payment-legend">
                <legend id="payment-legend">Méthode de paiement</legend>
                <div className="form-group">
                  <label htmlFor="paymentMethod">Méthode de paiement *</label>
                <select
                    id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                    aria-required="true"
                    aria-label="Sélectionnez votre méthode de paiement"
                >
                  <option value="credit_card">Carte bancaire</option>
                  <option value="paypal">PayPal</option>
                </select>
                </div>

                {formData.paymentMethod === 'credit_card' && (
                  <div className="card-details" role="group" aria-labelledby="card-details-legend">
                    <div id="card-details-legend" className="visually-hidden">Détails de la carte bancaire</div>
                    <div className="form-group">
                      <label htmlFor="cardNumber">Numéro de carte *</label>
                    <input
                      type="text"
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                        aria-required="true"
                        aria-label="Numéro de votre carte bancaire"
                        pattern="[0-9\s]{16,19}"
                        maxLength="19"
                    />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cardName">Nom sur la carte *</label>
                    <input
                      type="text"
                        id="cardName"
                        name="cardName"
                        placeholder="Nom tel qu'il apparaît sur la carte"
                        value={formData.cardName}
                      onChange={handleInputChange}
                      required
                        aria-required="true"
                        aria-label="Nom tel qu'il apparaît sur votre carte bancaire"
                    />
                    </div>
                    <div className="card-row">
                      <div className="form-group">
                        <label htmlFor="cardExpiry">Date d'expiration *</label>
                      <input
                        type="text"
                          id="cardExpiry"
                        name="cardExpiry"
                        placeholder="MM/AA"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        required
                          aria-required="true"
                          aria-label="Date d'expiration de votre carte au format MM/AA"
                          pattern="(0[1-9]|1[0-2])\/([0-9]{2})"
                          maxLength="5"
                      />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cardCVC">CVC *</label>
                      <input
                        type="text"
                          id="cardCVC"
                        name="cardCVC"
                        placeholder="CVC"
                        value={formData.cardCVC}
                        onChange={handleInputChange}
                        required
                          aria-required="true"
                          aria-label="Code de sécurité CVC de votre carte"
                          pattern="[0-9]{3,4}"
                          maxLength="4"
                      />
                      </div>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'paypal' && (
                  <div className="paypal-details" role="group" aria-labelledby="paypal-details-legend">
                    <div id="paypal-details-legend" className="visually-hidden">Détails PayPal</div>
                    <div className="form-group">
                      <label htmlFor="paypalEmail">Email PayPal *</label>
                    <input
                      type="email"
                        id="paypalEmail"
                      name="paypalEmail"
                      placeholder="Email PayPal"
                      value={formData.paypalEmail}
                      onChange={handleInputChange}
                      required
                        aria-required="true"
                        aria-label="Votre adresse email PayPal"
                    />
                    </div>
                  </div>
                )}
              </fieldset>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckoutForm(false);
                    setIsGuest(false);
                  }}
                  className="cancel-button"
                  aria-label="Retour au panier"
                >
                  Retour
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isProcessingPayment || isGuestOrderLoading || isUserOrderLoading}
                  aria-label={isProcessingPayment ? 'Traitement du paiement en cours' : 'Payer et commander'}
                  aria-busy={isProcessingPayment}
                >
                  {isProcessingPayment ? 'Traitement en cours...' : 'Payer et commander'}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </section>
  );
};

export default Cart; 