import React from 'react';
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
import AddProduct from './pages/AddProduct';
import ComingSoon from './pages/ComingSoon';
import '@styles/app.scss';

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
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
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
                  <ProtectedRoute allowedRoles={['user', 'admin']}>
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
              <Route 
                path="/add-product" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AddProduct />
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
}

export default App;