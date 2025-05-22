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

  if (isLoading) {
    return (
      <div role="status" aria-label="Chargement des détails de la commande" className="flex justify-center items-center h-screen">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <section className="error-message" role="alert" aria-label="Message d'erreur">
        {error.status === 404 ? 'Commande non trouvée' : 'Erreur lors du chargement des détails de la commande'}
      </section>
    );
  }

  if (!order) {
    return (
      <section className="error-message" role="alert" aria-label="Aucune commande trouvée">
        Aucune commande trouvée
      </section>
    );
  }

  return (
    <section className="order-details" aria-labelledby="order-heading">
      <header className="order-header">
        <h1 id="order-heading">Détails de la commande #{order.orderNumber || order._id}</h1>
        <button 
          className="back-button" 
          onClick={() => navigate('/')}
          aria-label="Retour à la page d'accueil"
        >
          Retour au site
        </button>
      </header>

      <div className="order-content">
        <section className="order-section" aria-labelledby="customer-info-heading">
          <h2 id="customer-info-heading">Informations client</h2>
          <div className="info-grid" role="list" aria-label="Informations du client">
            <div className="info-item" role="listitem">
              <strong>Email:</strong>
              <span>{order.guestInfo?.email}</span>
            </div>
            <div className="info-item" role="listitem">
              <strong>Nom:</strong>
              <span>{order.guestInfo?.name}</span>
            </div>
            <div className="info-item" role="listitem">
              <strong>Date de commande:</strong>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="info-item" role="listitem">
              <strong>Statut:</strong>
              <span className={`status ${order.status}`} role="status" aria-label={`Statut de la commande: ${order.status}`}>
                {order.status}
              </span>
            </div>
          </div>
        </section>

        <section className="order-section" aria-labelledby="shipping-address-heading">
          <h2 id="shipping-address-heading">Adresse de livraison</h2>
          <address className="address-info">
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
            <p>{order.shippingAddress?.country}</p>
          </address>
        </section>

        <section className="order-section" aria-labelledby="ordered-items-heading">
          <h2 id="ordered-items-heading">Articles commandés</h2>
          <div className="items-list" role="list" aria-label="Liste des articles commandés">
            {order.products?.map((item, index) => (
              <article key={index} className="order-item" role="listitem">
                <div className="item-details">
                  <h3>{item.product.name}</h3>
                  <p>Quantité: {item.quantity}</p>
                  <p>Prix unitaire: {item.price}€</p>
                  <p>Total: {item.quantity * item.price}€</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="order-section" aria-labelledby="order-summary-heading">
          <h2 id="order-summary-heading">Résumé de la commande</h2>
          <div className="order-summary" role="list" aria-label="Résumé des montants">
            <div className="summary-item" role="listitem">
              <span>Sous-total:</span>
              <span>{order.totalAmount}€</span>
            </div>
            <div className="summary-item" role="listitem">
              <span>Frais de livraison:</span>
              <span>Gratuit</span>
            </div>
            <div className="summary-item total" role="listitem">
              <span>Total:</span>
              <span>{order.totalAmount}€</span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default GuestOrderDetails; 