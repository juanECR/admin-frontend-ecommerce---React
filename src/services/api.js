// Leemos la variable del .env. Si por alguna razón falla, usamos el localhost de respaldo.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';


// Función para obtener las cabeceras con el Token de seguridad
export const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem('adminToken');
  const headers = {
    'Authorization': token ? `Bearer ${token}` : ''
  };

  // Si enviamos imágenes (FormData), el navegador pone el Content-Type solo. 
  // Si enviamos texto normal, le decimos que es JSON.
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

export default API_URL;