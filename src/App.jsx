// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import NotFound from './pages/NotFound';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Importamos Componentes y Vistas
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Login from './pages/Login';

// Este es el "Guardián del Frontend". Solo renderiza la página si hay usuario.
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p style={{ padding: '20px' }}>Cargando...</p>;
  
  // Si no hay usuario, lo manda a la fuerza al /login
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

// Separamos las rutas para poder usar el AuthContext adentro
const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta Pública (El Login) */}
      <Route path="/login" element={<Login />} />

      {/* Rutas Privadas (Envueltas en el Guardián) */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="pedidos" element={<Orders />} />
        <Route path="productos" element={<Products />} />
        <Route path="categorias" element={<Categories />} />
         <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      {/* Todo debe estar envuelto en el AuthProvider para que la memoria funcione */}
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
