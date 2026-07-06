// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '70vh',
      textAlign: 'center'
    }}>
      <AlertCircle size={64} color="var(--border-medium)" style={{ marginBottom: '16px' }} />
      <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Error 404</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        La página que estás buscando no existe o fue movida.
      </p>
      
      {/* Usamos el componente Link de React Router para navegar sin recargar la web */}
      <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>
        Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFound;