import axios from 'axios';

// Ajouter le token à toutes les requêtes
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Vérifier si l'utilisateur est connecté
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Vérifier si l'utilisateur est admin
export const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === 'admin';
};

// Vérifier si le token est expiré
export const isTokenExpired = () => {
  const token = localStorage.getItem('token');
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

// Vérifier et rafraîchir la session
export const checkSession = async () => {
  if (!isAuthenticated() || isTokenExpired()) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
  return true;
}; 