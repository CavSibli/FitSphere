import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  console.log('User from localStorage:', user);
  console.log('User role:', user?.role);
  console.log('Is admin?', user?.role === 'admin');
  console.log('Role type:', typeof user?.role);
  console.log('Role value:', user?.role);

  const handleProfileClick = () => {
    if (user?.role === 'admin') {
      navigate('/dashboard-admin');
    } else {
      navigate('/dashboard-user');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">FitSphere</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/" className="navbar-item">Accueil</Link>
        <Link to="/products" className="navbar-item">Produits</Link>
        <Link to="/cart" className="navbar-item">Panier</Link>
        {token && user ? (
          <button 
            onClick={handleProfileClick}
            className="navbar-item profile-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Profil
          </button>
        ) : (
          <Link to="/login" className="navbar-item">Connexion</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;