import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import '../styles/Footer.scss';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const partners = [
    { name: "GymBro", logo: "💪" },
    { name: "FlexMaster", logo: "🏋️" },
    { name: "ProteinPunch", logo: "🥤" },
    { name: "YogaYoda", logo: "🧘" }
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Nos Partenaires</h4>
          <div className="partners-grid">
            {partners.map((partner, index) => (
              <div key={index} className="partner-item">
                <span className="partner-logo">{partner.logo}</span>
                <span className="partner-name">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-section">
          <h4>Nous Contacter</h4>
          <ul className="contact-info">
            <li>
              <i className="fas fa-envelope"></i>
              <span>contact@fitsphere.com</span>
            </li>
            <li>
              <i className="fas fa-phone"></i>
              <span>+33 1 23 45 67 89</span>
            </li>
          </ul>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Informations Légales</h4>
          <ul>
            <li><Link to="/coming-soon">Mentions légales</Link></li>
            <li><Link to="/coming-soon">Politique de confidentialité</Link></li>
            <li><Link to="/coming-soon">CGV</Link></li>
            <li><Link to="/coming-soon">Politique des cookies</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} FitSphere - Tous droits réservés</p>
        <p>SIRET : 123 456 789 00000 | RCS Paris B 123 456 789</p>
      </div>
    </footer>
  );
};

export default Footer;
