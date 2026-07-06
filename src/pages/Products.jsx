import { useState, useEffect } from 'react';
import API_URL, { getAuthHeaders } from '../services/api';
import { Plus, Image as ImageIcon, Trash2 } from 'lucide-react';
import './Products.css';

const Products = () => {
  // 1. ESTADOS GLOBALES
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 2. ESTADOS DEL FORMULARIO
  const [formData, setFormData] = useState({
    name: '', category_id: '', description: '', price: '', stock: '', status: 'active'
  });
  
  // Estado especial para las Propiedades Dinámicas (Array de objetos)
  const [properties, setProperties] = useState([{ key: '', value: '' }]);
  
  // Estado especial para la imagen seleccionada
  const [imageFile, setImageFile] = useState(null);

  // 3. CARGAR DATOS INICIALES (Productos y Categorías)
  const fetchData = async () => {
    try {
      // Usamos Promise.all para hacer ambas peticiones al mismo tiempo (Más rápido)
      const [resProducts, resCategories] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/categories`)
      ]);
      
      const dataProducts = await resProducts.json();
      const dataCategories = await resCategories.json();
      
      setProducts(dataProducts);
      setCategories(dataCategories);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 4. MANEJADORES DE INPUTS NORMALES
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 5. MANEJADORES DE PROPIEDADES DINÁMICAS (JSONB)
  const handlePropertyChange = (index, field, value) => {
    const newProps = [...properties];
    newProps[index][field] = value;
    setProperties(newProps);
  };

  const addPropertyRow = () => {
    setProperties([...properties, { key: '', value: '' }]);
  };

  const removePropertyRow = (index) => {
    const newProps = properties.filter((_, i) => i !== index);
    setProperties(newProps);
  };

  // 6. MANEJADOR PARA LA IMAGEN
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // 7. EL BOTÓN GUARDAR (LA MAGIA)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // A. Transformar el array de propiedades a un Objeto JSON limpio
      const propsObject = {};
      properties.forEach(prop => {
        if (prop.key.trim() && prop.value.trim()) {
          propsObject[prop.key.trim().toLowerCase()] = prop.value.trim();
        }
      });

      // B. Preparar los datos del Producto
      const productPayload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        properties: propsObject
      };

      // C. Guardar el Producto en la base de datos
      const resProduct = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productPayload),
      });

      if (!resProduct.ok) {
        const err = await resProduct.json();
        throw new Error(err.message || err.error || 'Error al guardar el producto');
      }

      const productData = await resProduct.json();
      const newProductId = productData.data.id; // Obtenemos el ID del producto recién creado

      // D. Si hay imagen, la subimos conectada al nuevo ID
      if (imageFile) {
        // Para enviar archivos usamos FormData nativo de JS
        const imageData = new FormData();
        imageData.append('product_id', newProductId);
        imageData.append('is_primary', 'true');
        imageData.append('image', imageFile);

        const resImage = await fetch(`${API_URL}/images/upload`, {
          method: 'POST',
          headers: getAuthHeaders(true),
          body: imageData
        });

        if (!resImage.ok) {
          console.error('El producto se guardó, pero la imagen falló.');
        }
      }

      // E. Todo un éxito, limpiamos y recargamos
      await fetchData();
      closeModal();

    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 8. RESETEAR EL FORMULARIO
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', category_id: '', description: '', price: '', stock: '', status: 'active' });
    setProperties([{ key: '', value: '' }]);
    setImageFile(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Productos</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id}>
                {/* Buscar si tiene imagen primaria, si no, mostrar un icono */}
                <td>
                  {prod.product_images && prod.product_images.length > 0 ? (
                    <img src={prod.product_images[0].image_url} alt={prod.name} className="product-image-cell" />
                  ) : (
                    <div className="image-placeholder"><ImageIcon size={20} /></div>
                  )}
                </td>
                <td style={{ fontWeight: 500 }}>{prod.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{prod.categories?.name || '-'}</td>
                <td>S/ {Number(prod.price).toFixed(2)}</td>
                <td>{prod.stock} un.</td>
                <td><span className={`badge ${prod.status}`}>{prod.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <h2>Crear Producto</h2>
            
            <form onSubmit={handleSubmit}>
              {/* Información Básica */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Nombre del Producto *</label>
                  <input type="text" name="name" className="input-base" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Categoría *</label>
                  <select name="category_id" className="input-base" value={formData.category_id} onChange={handleInputChange} required>
                    <option value="">Seleccione...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Precio (S/) *</label>
                  <input type="number" step="0.01" name="price" className="input-base" value={formData.price} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input type="number" name="stock" className="input-base" value={formData.stock} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea name="description" className="input-base" rows="2" value={formData.description} onChange={handleInputChange}></textarea>
              </div>

              {/* Atributos Especiales (JSON) */}
              <div className="properties-container">
                <label style={{ display:'block', marginBottom:'12px', fontWeight:'600' }}>Características Especiales</label>
                {properties.map((prop, index) => (
                  <div className="property-row" key={index}>
                    <input type="text" className="input-base" placeholder="Ej: Color" value={prop.key} onChange={(e) => handlePropertyChange(index, 'key', e.target.value)} />
                    <input type="text" className="input-base" placeholder="Ej: Rojo" value={prop.value} onChange={(e) => handlePropertyChange(index, 'value', e.target.value)} />
                    {properties.length > 1 && (
                      <button type="button" className="btn-icon" onClick={() => removePropertyRow(index)}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-secondary" style={{ marginTop: '8px', fontSize: '0.8rem', padding: '6px 12px' }} onClick={addPropertyRow}>
                  + Añadir Característica
                </button>
              </div>

              {/* Imagen del Producto */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Imagen del Producto</label>
                  <div className="file-input-wrapper">
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ width: '100%' }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select name="status" className="input-base" value={formData.status} onChange={handleInputChange}>
                    <option value="active">Activo (Visible)</option>
                    <option value="draft">Borrador (Oculto)</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Products;