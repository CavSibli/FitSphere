import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddProductMutation } from '../app/apiSlice';
import { useSelector } from 'react-redux';
import '../styles/AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const [addProduct, { isLoading }] = useAddProductMutation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
    trendy: false
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };

      await addProduct(productData).unwrap();
      navigate('/dashboard-admin');
    } catch (err) {
      setError(err.data?.message || 'Erreur lors de l\'ajout du produit');
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <h1>Ajouter un nouveau produit</h1>
        <button onClick={() => navigate('/dashboard-admin')} className="back-button">
          Retour au tableau de bord
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-group">
          <label htmlFor="name">Nom du produit *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Ex: Tapis de Yoga Premium"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Description détaillée du produit"
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Prix (€) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="Ex: 89.99"
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock *</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              placeholder="Ex: 15"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Catégorie *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionner une catégorie</option>
            <option value="Yoga">Yoga</option>
            <option value="Fitness">Fitness</option>
            <option value="Musculation">Musculation</option>
            <option value="Cardio">Cardio</option>
            <option value="Accessoires">Accessoires</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">URL de l'image *</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            required
            placeholder="https://exemple.com/image.jpg"
          />
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="trendy"
              checked={formData.trendy}
              onChange={handleChange}
            />
            Produit tendance
          </label>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/dashboard-admin')} className="cancel-button">
            Annuler
          </button>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Ajout en cours...' : 'Ajouter le produit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct; 