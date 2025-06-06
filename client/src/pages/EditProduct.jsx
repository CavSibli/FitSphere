import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProductQuery, useUpdateProductMutation } from '../app/features/products/productsApiSlice';

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const { 
    data: fetchedProduct, 
    isLoading, 
    error: fetchError 
  } = useGetProductQuery(productId);

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: '',
    category: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (fetchedProduct) {
      setProduct({
        name: fetchedProduct.name,
        description: fetchedProduct.description,
        price: fetchedProduct.price,
        stock: fetchedProduct.stock,
        image: fetchedProduct.image,
        category: fetchedProduct.category
      });
    }
  }, [fetchedProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProduct = {
        ...product,
        price: parseFloat(product.price),
        stock: parseInt(product.stock)
      };

      await updateProduct({ 
        id: productId, 
        ...updatedProduct 
      }).unwrap();
      
      navigate('/admin/products');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du produit:', err);
      setError('Erreur lors de la mise à jour du produit');
    }
  };

  if (isLoading) {
    return <div role="status" aria-label="Chargement du produit" className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  if (fetchError) {
    return (
      <section className="max-w-2xl mx-auto p-4" role="alert" aria-label="Erreur de chargement">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Erreur lors de la récupération du produit
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto p-4" aria-labelledby="edit-product-heading">
      <h1 id="edit-product-heading" className="text-2xl font-bold mb-4">Modifier le produit</h1>
      
      {error && (
        <div role="alert" aria-label="Message d'erreur" className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulaire de modification du produit">
        <div className="form-group">
          <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">Nom</label>
          <input
            type="text"
            id="product-name"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            aria-required="true"
            aria-label="Nom du produit"
          />
        </div>

        <div className="form-group">
          <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="product-description"
            name="description"
            value={product.description}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            aria-required="true"
            aria-label="Description du produit"
          />
        </div>

        <div className="form-group">
          <label htmlFor="product-price" className="block text-sm font-medium text-gray-700">Prix</label>
          <input
            type="number"
            id="product-price"
            name="price"
            value={product.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            aria-required="true"
            aria-label="Prix du produit en euros"
          />
        </div>

        <div className="form-group">
          <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700">Stock</label>
          <input
            type="number"
            id="product-stock"
            name="stock"
            value={product.stock}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            aria-required="true"
            aria-label="Quantité en stock"
          />
        </div>

        <div className="form-group">
          <label htmlFor="product-image" className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            type="url"
            id="product-image"
            name="image"
            value={product.image}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            aria-required="true"
            aria-label="URL de l'image du produit"
          />
        </div>

        <div className="form-group">
          <label htmlFor="product-category" className="block text-sm font-medium text-gray-700">Catégorie</label>
          <select
            id="product-category"
            name="category"
            value={product.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            aria-required="true"
            aria-label="Catégorie du produit"
          >
            <option value="">Sélectionner une catégorie</option>
            <option value="Yoga">Yoga</option>
            <option value="Fitness">Fitness</option>
            <option value="Musculation">Musculation</option>
            <option value="Cardio">Cardio</option>
            <option value="Accessoires">Accessoires</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4" role="group" aria-label="Actions du formulaire">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            aria-label="Annuler la modification"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            aria-label={isUpdating ? "Enregistrement en cours" : "Enregistrer les modifications"}
            aria-busy={isUpdating}
          >
            {isUpdating ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default EditProduct; 