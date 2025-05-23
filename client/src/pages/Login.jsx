import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation } from '../app/features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../app/features/auth/authSlice';
import '../styles/Login.scss';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/dashboard-admin', { replace: true });
      } else {
        navigate('/dashboard-user', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

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
      const response = await login(formData).unwrap();

      // Stocker les informations dans Redux
      const userData = {
        _id: response._id,
        username: response.username,
        email: response.email,
        role: response.role,
      };

    
      // Mettre à jour le state Redux
      dispatch(setCredentials({ 
        user: userData,
        token: response.token 
      }));

    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error.data?.message || 'Une erreur est survenue lors de la connexion');
    }
  };

  return (
    <div className="login-container" role="region" aria-label="Page de connexion">
      <section className="login-form-container" aria-labelledby="login-heading">
        <h1 id="login-heading">Connexion</h1>
        {error && (
          <div role="alert" aria-live="assertive" className="error-message">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} aria-label="Formulaire de connexion">
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
              aria-required="true"
              aria-label="Votre mot de passe"
              minLength="6"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading} 
            className="login-button"
            aria-label={isLoading ? "Connexion en cours..." : "Se connecter"}
            aria-busy={isLoading}
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
          <nav className="register-link" aria-label="Navigation vers l'inscription">
            <p>Pas encore de compte ?</p>
            <Link 
              to="/register"
              className="register-button"
              aria-label="Créer un compte"
            >
              S'inscrire
            </Link>
          </nav>
        </form>
      </section>
    </div>
  );
};

export default Login; 