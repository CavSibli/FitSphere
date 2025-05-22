import React from 'react';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaArrowLeft } from 'react-icons/fa';
import '../styles/ComingSoon.scss';

const ComingSoon = () => {
  return (
    <section className="coming-soon">
      <card className="coming-soon-content">
        <div className="icon-container">
          <FaDumbbell className="icon" />
        </div>
        <h1>Page en Construction</h1>
        <p>Nous travaillons dur pour vous offrir le meilleur contenu.</p>
        <p className="subtitle">Revenez bientôt pour découvrir cette nouvelle fonctionnalité !</p>
        <Link to="/" className="back-button">
          <FaArrowLeft /> Retour à l'accueil
        </Link>
      </card>
    </section>
  );
};

export default ComingSoon; 