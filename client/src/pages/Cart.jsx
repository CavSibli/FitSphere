import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCreateGuestOrderMutation, useCreateUserOrderMutation } from '../app/apiSlice';
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
  const { isAuthenticated } = useSelector(state => state.auth);
  const [createGuestOrder] = useCreateGuestOrderMutation();
  const [createUserOrder] = useCreateUserOrderMutation();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('Cart data from localStorage:', parsedCart);
        
        // Vérifier et nettoyer les données invalides
        const validCartItems = parsedCart.filter(item => 
          item && 
          item.product && 
          item.product._id && 
          item.product.name && 
          item.product.image && 
          item.product.price
        );

        if (validCartItems.length !== parsedCart.length) {
          console.log('Some invalid items were removed from cart');
          localStorage.setItem('cart', JSON.stringify(validCartItems));
        }

        setCartItems(validCartItems);
        calculateTotal(validCartItems);
      } catch (error) {
        console.error('Error parsing cart data:', error);
        localStorage.removeItem('cart'); // Nettoyer le localStorage si les données sont corrompues
        setCartItems([]);
        setTotal(0);
      }
    }
  }, []);

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => {
      const itemPrice = item.product?.price || 0;
      const quantity = item.quantity || 0;
      return acc + (itemPrice * quantity);
    }, 0);
    setTotal(sum);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map(item => 
      item.product._id === productId 
        ? { 
            ...item, 
            quantity: newQuantity,
          }
        : item
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

      if (!isAuthenticated) {
        setIsGuest(true);
      }

      if (isGuest) {
        const guestOrderData = {
          guestInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          },
          products: cartItems.map(item => ({
            product: {
              _id: item.product._id,
              name: item.product.name,
              price: item.product.price,
              image: item.product.image
            },
            quantity: item.quantity,
            price: item.product.price
          })),
          totalAmount: total,
          shippingAddress,
          status: 'processing',
          paymentMethod: formData.paymentMethod,
          paymentStatus: 'pending'
        };

        const response = await createGuestOrder(guestOrderData).unwrap();
        setOrderNumber(response.order.orderNumber);
        localStorage.removeItem('cart');
        setCartItems([]);
        setOrderSuccess(true);
      } else {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
          navigate('/login');
          return;
        }

        const orderData = {
          userId: userData._id,
          products: cartItems.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price
          })),
          totalAmount: total,
          shippingAddress,
          paymentMethod: formData.paymentMethod,
          status: 'processing',
          paymentStatus: 'pending'
        };

        console.log('Sending order data:', orderData);
        await createUserOrder(orderData).unwrap();
        localStorage.removeItem('cart');
        setCartItems([]);
        setOrderSuccess(true);
        setTimeout(() => {
          navigate('/dashboard-user');
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
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
              <button 
                onClick={() => {
                  setIsGuest(false);
                  setShowCheckoutForm(true);
                }} 
                className="checkout-button"
              >
                Commander en tant qu'utilisateur
              </button>
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
                <button type="submit" className="submit-button">
                  {isGuest ? 'Commander en tant qu\'invité' : 'Confirmer la commande'}
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