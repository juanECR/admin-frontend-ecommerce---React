import { useState, useEffect } from 'react';
import API_URL, { getAuthHeaders } from '../services/api';
import { Plus } from 'lucide-react';
import './Categories.css';

const Categories = () => {
  // Estados
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);

  // 1. OBTENER CATEGORÍAS (GET)
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  // Se ejecuta automáticamente al cargar la página
  useEffect(() => {
    fetchCategories();
  }, []);

  // Manejador para los inputs del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 2. CREAR CATEGORÍA (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Recargamos la lista, cerramos el modal y limpiamos el formulario
        fetchCategories();
        setIsModalOpen(false);
        setFormData({ name: '', description: '' });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* CABECERA */}
      <div className="page-header">
        <h1>Categorías</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Nueva Categoría
        </button>
      </div>

      {/* TABLA DE CATEGORÍAS */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Slug (URL)</th>
              <th>Descripción</th>
              <th>Fecha de Creación</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay categorías registradas.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 500 }}>{cat.name}</td>
                  <td>{cat.slug}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{cat.description || '-'}</td>
                  <td>{new Date(cat.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL PARA CREAR CATEGORÍA */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Crear Categoría</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre de la Categoría *</label>
                <input 
                  type="text" 
                  name="name"
                  className="input-base" 
                  placeholder="Ej: Laptops, Zapatillas..." 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea 
                  name="description"
                  className="input-base" 
                  placeholder="Detalles de la categoría (Opcional)" 
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Guardando...' : 'Guardar Categoría'}
                </button>
              </div>
            </form>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default Categories;