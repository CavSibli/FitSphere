import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation côté client
    if (!formData.username || !formData.email || !formData.password) {
      setError('Tous les champs sont requis');
      setLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Format d\'email invalide');
      setLoading(false);
      return;
    }

    try {
      console.log('Envoi des données d\'inscription:', {
        ...formData,
        password: '***' // Masquer le mot de passe dans les logs
      });

      const response = await axios.post('http://localhost:5000/api/auth/register', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Réponse du serveur:', response.data);

      // Sauvegarder le token et les informations utilisateur
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role
      }));

      // Rediriger vers le dashboard approprié en fonction du rôle
      if (response.data.role === 'admin') {
        navigate('/dashboard-admin');
      } else {
        navigate('/dashboard-user');
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error.response?.data || error.message);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erreur lors de l\'inscription'
      );
    } finally {
      setLoading(false);
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
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
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