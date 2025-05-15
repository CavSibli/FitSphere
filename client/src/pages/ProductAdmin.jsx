import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateProductTrendyMutation
} from '../app/apiSlice';
import '../styles/ProductAdmin.css';

const ProductAdmin = () => {
  const navigate = useNavigate();
  const [editingProduct, setEditingProduct] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
    trendy: false
  });

  // RTK Query hooks
  const { data: products, isLoading, error } = useGetProductsQuery();
  const [addProduct] = useAddProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [updateProductTrendy] = useUpdateProductTrendyMutation();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      stock: product.stock.toString(),
      trendy: product.trendy
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await updateProduct({ id: editingProduct, ...productData }).unwrap();
        setSuccessMessage('Le produit a été modifié avec succès !');
      } else {
        await addProduct(productData).unwrap();
        setSuccessMessage('Le nouveau produit a été ajouté avec succès !');
      }

      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        stock: '',
        trendy: false
      });

      // Faire disparaître le message après 3 secondes
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du produit:', error);
      alert('Erreur lors de la sauvegarde du produit');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteProduct(productId).unwrap();
      } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
        alert('Erreur lors de la suppression du produit');
      }
    }
  };

  const handleToggleTrendy = async (productId, currentTrendy) => {
    try {
      await updateProductTrendy({ id: productId, trendy: !currentTrendy }).unwrap();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut trendy:', error);
      alert('Erreur lors de la mise à jour du statut trendy');
    }
  };

  if (isLoading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error">Erreur: {error.message || 'Une erreur est survenue'}</div>;
  }

  return (
    <div className="product-admin">
      <h1>Gestion des Produits</h1>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="product-form">
        <h2>{editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
        
        <div className="form-group">
          <label htmlFor="name">Nom</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Prix</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Catégorie</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
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
          <label htmlFor="image">URL de l'image</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            required
            min="0"
          />
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="trendy"
              checked={formData.trendy}
              onChange={handleInputChange}
            />
            Produit tendance
          </label>
        </div>

        <div className="form-buttons">
          <button type="submit" className="save-button">
            {editingProduct ? 'Mettre à jour' : 'Ajouter'}
          </button>
          {editingProduct && (
            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setEditingProduct(null);
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  category: '',
                  image: '',
                  stock: '',
                  trendy: false
                });
              }}
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="products-list">
        <h2>Liste des Produits</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Nom</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Catégorie</th>
                <th>Trendy</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.map(product => (
                <tr key={product._id}>
                  <td>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="product-thumbnail"
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.price}€</td>
                  <td>{product.stock}</td>
                  <td>{product.category}</td>
                  <td>
                    <button 
                      onClick={() => handleToggleTrendy(product._id, product.trendy)}
                      className={`trendy-button ${product.trendy ? 'active' : ''}`}
                    >
                      {product.trendy ? 'Trendy' : 'Non trendy'}
                    </button>
                  </td>
                  <td className="action-buttons">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="edit-button"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="delete-button"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductAdmin; 