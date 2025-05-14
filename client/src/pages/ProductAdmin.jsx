import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ProductAdmin.css';

const ProductAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
    trendy: false
  });

  useEffect(() => {
    fetchProducts();
    if (id) {
      fetchProductById(id);
    }
  }, [id]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      setError('Erreur lors du chargement des produits');
      setLoading(false);
    }
  };

  const fetchProductById = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${productId}`);
      const product = response.data;
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
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      setError('Erreur lors du chargement du produit');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (product) => {
    navigate(`/products/edit/${product._id}`);
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
        await axios.put(`http://localhost:5000/api/products/${editingProduct}`, productData);
        navigate('/admin');
      } else {
        await axios.post('http://localhost:5000/api/products', productData);
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
      fetchProducts();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du produit:', error);
      setError('Erreur lors de la sauvegarde du produit');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${productId}`);
        fetchProducts();
      } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
        setError('Erreur lors de la suppression du produit');
      }
    }
  };

  const handleToggleTrendy = async (productId, currentTrendy) => {
    try {
      await axios.patch(`http://localhost:5000/api/products/${productId}/trendy`, {
        trendy: !currentTrendy
      });
      fetchProducts();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut trendy:', error);
      setError('Erreur lors de la mise à jour du statut trendy');
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="product-admin">
      <h1>Gestion des Produits</h1>

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
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          />
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
                <th>Tendance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-thumbnail"
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.price.toFixed(2)} €</td>
                  <td>{product.stock}</td>
                  <td>
                    <button
                      className={`trendy-button ${product.trendy ? 'active' : ''}`}
                      onClick={() => handleToggleTrendy(product._id, product.trendy)}
                    >
                      {product.trendy ? 'Tendance' : 'Normal'}
                    </button>
                  </td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(product)}
                    >
                      Modifier
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(product._id)}
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