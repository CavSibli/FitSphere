import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateProductTrendyMutation
} from '../app/features/products/productsApiSlice';
import '../styles/ProductAdmin.scss';

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
        setSuccessMessage('Le produit a été mis à jour avec succès !');
      } else {
        await addProduct(productData).unwrap();
        setSuccessMessage('Le nouveau produit a été ajouté avec succès !');
      }

      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        stock: '',
        trendy: false
      });
      setEditingProduct(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du produit:', error);
      alert('Erreur lors de la sauvegarde du produit');
    }
  };

  const handleDelete = async (id) => {
    try {
      // Suppression optimiste
      const deletePromise = deleteProduct(id).unwrap();
      
      // Mise à jour immédiate de l'UI
      setSuccessMessage('Le produit a été supprimé avec succès !');
      
      // Attendre la confirmation du serveur
      await deletePromise;
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      setSuccessMessage('Erreur lors de la suppression du produit');
    }
  };

  const handleTrendyToggle = async (id, currentTrendy) => {
    try {
      await updateProductTrendy({ id, trendy: !currentTrendy }).unwrap();
      setSuccessMessage('Le statut "tendance" a été mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut "tendance":', error);
      alert('Erreur lors de la mise à jour du statut "tendance"');
    }
  };

  if (isLoading) {
    return (
      <div role="status" aria-label="Chargement des produits" className="loading">
        Chargement des produits...
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" aria-label="Erreur de chargement des produits" className="error">
        Erreur lors du chargement des produits
      </div>
    );
  }

  return (
    <div className="product-admin-container" role="region" aria-label="Gestion des produits">
      <header className="admin-header">
        <h1>Gestion des Produits</h1>
        <button 
          onClick={() => navigate('/dashboard-admin')} 
          className="back-button"
          aria-label="Retour au tableau de bord administrateur"
        >
          Retour au dashboard
        </button>
      </header>

      {successMessage && (
        <div role="status" aria-live="polite" className="success-message">
          {successMessage}
        </div>
      )}

      <section className="product-form-section" aria-labelledby="product-form-heading">
        <h2 id="product-form-heading">{editingProduct ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}</h2>
        <form onSubmit={handleSubmit} className="product-form" aria-label="Formulaire de produit">
        <div className="form-group">
            <label htmlFor="name">Nom du produit</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
              aria-required="true"
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
              aria-required="true"
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
              aria-required="true"
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
              aria-required="true"
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
              type="text"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            required
              aria-required="true"
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
              aria-required="true"
          />
        </div>

        <div className="form-group checkbox">
            <label htmlFor="trendy">
            <input
              type="checkbox"
                id="trendy"
              name="trendy"
              checked={formData.trendy}
              onChange={handleInputChange}
            />
            Produit tendance
          </label>
        </div>

        <div className="form-buttons">
            <button type="submit" className="submit-button" aria-label={editingProduct ? "Mettre à jour le produit" : "Ajouter le produit"}>
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
                aria-label="Annuler la modification"
            >
              Annuler
            </button>
          )}
        </div>
      </form>
      </section>

      <section className="products-list-section" aria-labelledby="products-list-heading">
        <h2 id="products-list-heading">Liste des Produits</h2>
        <div className="products-list" role="list">
          {products?.map((product) => (
            <article key={product._id} className="product-item" role="listitem">
              <img src={product.image} alt={product.name} className="product-image" />
              <div className="product-details">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>Prix: {product.price}€</p>
                <p>Stock: {product.stock}</p>
                <p>Catégorie: {product.category}</p>
                <div className="product-actions">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="edit-button"
                    aria-label={`Modifier ${product.name}`}
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="delete-button"
                    aria-label={`Supprimer ${product.name}`}
                    >
                      Supprimer
                    </button>
                  <button
                    onClick={() => handleTrendyToggle(product._id, product.trendy)}
                    className={`trendy-button ${product.trendy ? 'active' : ''}`}
                    aria-label={`${product.trendy ? 'Retirer' : 'Ajouter'} ${product.name} des produits tendance`}
                  >
                    {product.trendy ? 'Tendance' : 'Non tendance'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductAdmin; 