import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import '../styles/Navbar.scss';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/"><img src={logo} alt="Logo FitSphere"/></Link>
        </div>
        <button className="hamburger" onClick={toggleMenu} aria-label="Menu">
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        </button>
        <div className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="navbar-item" onClick={() => setIsMenuOpen(false)}>Accueil</Link>
          <Link to="/products" className="navbar-item" onClick={() => setIsMenuOpen(false)}>Produits</Link>
          <Link to="/cart" className="navbar-item" onClick={() => setIsMenuOpen(false)}>Panier</Link>
          <Link to="/login" className="navbar-item" onClick={() => setIsMenuOpen(false)}>Connexion</Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;