import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Tentative de connexion avec:', { email: formData.email });
      
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      console.log('Réponse du serveur:', response.data);

      // Sauvegarder le token et les informations utilisateur
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
      }));

      // Rediriger vers le tableau de bord approprié
      if (response.data.role === 'admin') {
        navigate('/dashboard-admin');
      } else {
        navigate('/dashboard-user');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error.response?.data || error);
      setError(error.response?.data?.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h1>Connexion</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
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
              placeholder="Votre mot de passe"
            />
          </div>
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
          <div className="register-link">
            <p>Pas encore de compte ?</p>
            <button
              onClick={() => navigate('/register')} 
              className="register-button"
            >
              S'inscrire
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 