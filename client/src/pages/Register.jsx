import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../app/features/auth/authApiSlice';
import '../styles/Login.scss';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');

  const [register, { isLoading }] = useRegisterMutation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation côté client
    if (!formData.username || !formData.email || !formData.password) {
      setError('Tous les champs sont requis');
      return;
    }

    if (formData.username.length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Format d\'email invalide');
      return;
    }

    try {
      const response = await register(formData).unwrap();

      // Sauvegarder le token et les informations utilisateur
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response._id,
        username: response.username,
        email: response.email,
        role: response.role
      }));

      // Rediriger vers le dashboard approprié en fonction du rôle
      if (response.role === 'admin') {
        navigate('/dashboard-admin');
      } else {
        navigate('/dashboard-user');
      }
    } catch (error) {
      setError(error.data?.message || error.data?.error || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h1>Inscription</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="3"
              placeholder="Entrez votre nom d'utilisateur"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="exemple@email.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Minimum 6 caractères"
            />
          </div>
          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
          <div className="register-link">
            <p>Déjà un compte ?</p>
            <button 
              onClick={() => navigate('/login')} 
              className="register-button"
            >
              Se connecter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 