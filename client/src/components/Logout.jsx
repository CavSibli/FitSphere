import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Supprimer le token et les informations utilisateur
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Rediriger vers la page de connexion
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Se déconnecter
    </button>
  );
};

export default Logout; 