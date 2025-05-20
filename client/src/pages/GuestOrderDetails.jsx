import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetGuestOrderDetailsQuery } from '../app/features/orders/guestOrdersApiSlice';
import '../styles/GuestOrderDetails.scss';

const GuestOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    data: order,
    isLoading,
    error
  } = useGetGuestOrderDetailsQuery(id);

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div className="error-message">
    {error.status === 404 ? 'Commande non trouvée' : 'Erreur lors du chargement des détails de la commande'}
  </div>;
  if (!order) return <div>Aucune commande trouvée</div>;

  return (
    <div className="order-details">
      <div className="order-header">
        <h1>Détails de la commande #{order.orderNumber || order._id}</h1>
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
              <span>{order.guestInfo?.email}</span>
            </div>
            <div className="info-item">
              <strong>Nom:</strong>
              <span>{order.guestInfo?.name}</span>
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
            {order.products?.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-details">
                  <h3>{item.product.name}</h3>
                  <p>Quantité: {item.quantity}</p>
                  <p>Prix unitaire: {item.price}€</p>
                  <p>Total: {item.quantity * item.price}€</p>
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
              <span>{order.totalAmount}€</span>
            </div>
            <div className="summary-item">
              <span>Frais de livraison:</span>
              <span>Gratuit</span>
            </div>
            <div className="summary-item total">
              <span>Total:</span>
              <span>{order.totalAmount}€</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestOrderDetails; 