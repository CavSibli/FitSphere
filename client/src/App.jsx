import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
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
import './App.css';

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
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard-user" 
              element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <DashboardUser />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard-admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardAdmin />
                </ProtectedRoute>
              } 
            />
            <Route path="/cart" element={<Cart />} />
            <Route 
              path="/admin/products" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProductAdmin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/products/edit/:id" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProductAdmin />
                </ProtectedRoute>
              } 
            />
            <Route path="/guest-orders/:id" element={<ProtectedRoute><GuestOrderDetails /></ProtectedRoute>} />
            <Route path="/admin/products/edit/:productId" element={<EditProduct />} />
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
      </div>
    </Router>
  );
}

export default App;