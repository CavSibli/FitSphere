import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../app/features/auth/authSlice';
import '../styles/Login.scss';

const Register = () => {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');

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
    <div className="login-container" role="region" aria-label="Page d'inscription">
      <section className="login-form-container" aria-labelledby="register-heading">
        <h1 id="register-heading">Inscription</h1>
        
        {error && (
          <div role="alert" aria-live="assertive" className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form" aria-label="Formulaire d'inscription">
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
              aria-required="true"
              aria-label="Votre nom d'utilisateur"
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
              aria-required="true"
              aria-label="Votre adresse email"
              autoComplete="email"
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
              aria-required="true"
              aria-label="Votre mot de passe"
              autoComplete="current-password" 
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
            aria-label={isLoading ? "Inscription en cours..." : "S'inscrire"}
            aria-busy={isLoading}
          >
            {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>

          <nav className="register-link" aria-label="Navigation après inscription">
            <p>Déjà un compte ?</p>
            <button 
              onClick={() => navigate('/login')} 
              className="register-button"
              aria-label="Aller à la page de connexion"
            >
              Se connecter
            </button>
          </nav>
        </form>
      </section>
    </div>
  );
};

export default Register; 