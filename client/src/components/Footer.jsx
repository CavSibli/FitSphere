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
    <footer className="footer" role="contentinfo" aria-label="Pied de page FitSphere">
      <div className="footer-content">
        <section className="footer-section" aria-labelledby="partners-heading">
          <h4 id="partners-heading">Nos Partenaires</h4>
          <div className="partners-grid" role="list" aria-label="Liste des partenaires">
            {partners.map((partner, index) => (
              <div key={index} className="partner-item" role="listitem">
                <span className="partner-logo" aria-hidden="true">{partner.logo}</span>
                <span className="partner-name">{partner.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="footer-section" aria-labelledby="contact-heading">
          <h4 id="contact-heading">Nous Contacter</h4>
          <address>
            <ul className="contact-info" role="list" aria-label="Informations de contact">
              <li>
                <i className="fas fa-envelope" aria-hidden="true"></i>
                <a href="mailto:contact@fitsphere.com" aria-label="Envoyer un email à FitSphere">contact@fitsphere.com</a>
              </li>
              <li>
                <i className="fas fa-phone" aria-hidden="true"></i>
                <a href="tel:+33123456789" aria-label="Appeler FitSphere">+33 1 23 45 67 89</a>
              </li>
            </ul>
          </address>
          <nav className="social-links" aria-label="Réseaux sociaux">
            <ul role="list">
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Visiter notre page Facebook">
                  <FaFacebook aria-hidden="true" />
                  <span className="social-text">Notre Facebook</span>
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Visiter notre compte Twitter">
                  <FaTwitter aria-hidden="true" />
                  <span className="social-text">Notre Twitter</span>
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Visiter notre compte Instagram">
                  <FaInstagram aria-hidden="true" />
                  <span className="social-text">Notre Instagram</span>
                </a>
              </li>
            </ul>
          </nav>
        </section>

        <nav className="footer-section" aria-labelledby="legal-heading">
          <h4 id="legal-heading">Informations Légales</h4>
          <ul role="list" aria-label="Liens vers les informations légales">
            <li><Link to="/coming-soon">Mentions légales</Link></li>
            <li><Link to="/coming-soon">Politique de confidentialité</Link></li>
            <li><Link to="/coming-soon">CGV</Link></li>
            <li><Link to="/coming-soon">Politique des cookies</Link></li>
          </ul>
        </nav>
      </div>

      <div className="footer-bottom" role="contentinfo" aria-label="Informations légales du site">
        <p>&copy; {currentYear} FitSphere - Tous droits réservés</p>
        <p>SIRET : 123 456 789 00000 | RCS Paris B 123 456 789</p>
    </div>
    </footer>
  );
};

export default Footer;
