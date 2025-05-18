import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation } from '../app/features/auth/authApiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../app/features/auth/authSlice';
import '../styles/Login.scss';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Tentative de connexion avec:', { email: formData.email });
      
      const response = await login(formData).unwrap();
      console.log('Réponse du serveur:', response);

      // Sauvegarder le token et les informations utilisateur
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        _id: response._id,
        username: response.username,
        email: response.email,
        role: response.role,
      }));

      dispatch(setCredentials({ 
        user: response,
        token: response.token 
      }));

      // Rediriger vers le tableau de bord approprié
      if (response.role === 'admin') {
        navigate('/dashboard-admin');
      } else {
        navigate('/dashboard-user');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error.data?.message || 'Une erreur est survenue lors de la connexion');
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
          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
          <div className="register-link">
            <p>Pas encore de compte ?</p>
            <Link 
              to="/register"
              className="register-button"
            >
              S'inscrire
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 