import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import '../styles/Navbar.scss';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Utilisation de useMemo pour éviter de parser le JSON à chaque rendu
  const { user, token } = useMemo(() => {
    const token = localStorage.getItem('token');
    let user = null;
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        user = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Erreur lors de la lecture des données utilisateur:', error);
    }
    return { user, token };
  }, []); // Le tableau vide signifie que ce calcul ne sera fait qu'une fois

  const handleProfileClick = () => {
    if (user?.role === 'admin') {
      navigate('/dashboard-admin');
    } else {
      navigate('/dashboard-user');
    }
  };

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
          {token && user ? (
            <button 
              onClick={() => {
                handleProfileClick();
                setIsMenuOpen(false);
              }}
              className="navbar-item profile-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Profil
            </button>
          ) : (
            <Link to="/login" className="navbar-item" onClick={() => setIsMenuOpen(false)}>Connexion</Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;