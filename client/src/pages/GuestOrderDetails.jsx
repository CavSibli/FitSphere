import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/OrderDetails.css';

const GuestOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/guest-orders/${id}`);
        setOrder(response.data);
      } catch (error) {
        setError('Erreur lors du chargement des détails de la commande');
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!order) return <div>Aucune commande trouvée</div>;

  return (
    <div className="order-details">
      <div className="order-header">
        <h1>Détails de la commande #{order._id}</h1>
        <button className="back-button" onClick={() => navigate('/admin')}>
          Retour au dashboard
        </button>
      </div>

      <div className="order-content">
        <div className="order-section">
          <h2>Informations client</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>Email:</strong>
              <span>{order.Email}</span>
            </div>
            <div className="info-item">
              <strong>Nom:</strong>
              <span>{order.Name}</span>
            </div>
            <div className="info-item">
              <strong>Date de commande:</strong>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <strong>Statut:</strong>
              <span className={`status ${order.status}`}>{order.status}</span>
            </div>
          </div>
        </div>

        <div className="order-section">
          <h2>Adresse de livraison</h2>
          <div className="address-info">
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
            <p>{order.shippingAddress?.country}</p>
          </div>
        </div>

        <div className="order-section">
          <h2>Articles commandés</h2>
          <div className="items-list">
            {order.items?.map((item, index) => (
              <div key={index} className="order-item">
                <img src={item.product.image} alt={item.product.name} className="item-image" />
                <div className="item-details">
                  <h3>{item.product.name}</h3>
                  <p>Quantité: {item.quantity}</p>
                  <p>Prix unitaire: {item.product.price}€</p>
                  <p>Total: {item.quantity * item.product.price}€</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-section">
          <h2>Résumé de la commande</h2>
          <div className="order-summary">
            <div className="summary-item">
              <span>Sous-total:</span>
              <span>{order.total}€</span>
            </div>
            <div className="summary-item">
              <span>Frais de livraison:</span>
              <span>Gratuit</span>
            </div>
            <div className="summary-item total">
              <span>Total:</span>
              <span>{order.total}€</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestOrderDetails; 