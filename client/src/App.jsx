import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardUser from './pages/DashboardUser';
import DashboardAdmin from './pages/DashboardAdmin';
import Cart from './pages/Cart';
import ProductAdmin from './pages/ProductAdmin';
import GuestOrderDetails from './pages/GuestOrderDetails';
import EditProduct from './pages/EditProduct';
import ComingSoon from './pages/ComingSoon';
import '@styles/app.scss';
import { useSelector, useDispatch } from 'react-redux';
import { initializeAuth, setCredentials, useGetUserProfileQuery } from './app/features/auth/authSlice';

// Configuration de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Composant pour protéger les routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);

  // Si non authentifié, rediriger vers login
  if (!isAuthenticated || !token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier le rôle et rediriger immédiatement si nécessaire
  if (user.role === 'admin' && !allowedRoles.includes('admin')) {
    return <Navigate to="/dashboard-admin" replace />;
  }
  
  if (user.role === 'user' && !allowedRoles.includes('user')) {
    return <Navigate to="/dashboard-user" replace />;
  }

  // Si le rôle n'est pas dans les rôles autorisés, rediriger vers la page d'accueil
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { data: userProfile, isLoading } = useGetUserProfileQuery(undefined, {
    skip: !token
  });

  useEffect(() => {
    // Initialiser l'état d'authentification au chargement
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    // Si nous avons un token et un profil utilisateur, mettre à jour les credentials
    if (token && userProfile && !isLoading) {
      dispatch(setCredentials({ user: userProfile, token }));
    }
  }, [token, userProfile, isLoading, dispatch]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/guest-orders/:id" element={<GuestOrderDetails />} />
              <Route path="/order-confirmation/:id" element={<GuestOrderDetails />} />
              <Route path="/coming-soon" element={<ComingSoon />} />

              {/* Routes protégées - User */}
              <Route 
                path="/dashboard-user" 
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <DashboardUser />
                  </ProtectedRoute>
                } 
              />

              {/* Routes protégées - Admin */}
              <Route 
                path="/dashboard-admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardAdmin />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/products" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ProductAdmin />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/products/edit/:productId" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EditProduct />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <footer>
            <Footer />
          </footer>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;