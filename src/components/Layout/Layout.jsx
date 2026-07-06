import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Tags, ShoppingCart, LogOut } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Lo devolvemos al login
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ width: '24px', height: '24px', backgroundColor: 'var(--accent-color)', borderRadius: '4px' }}></div>
          Mi E-Commerce
        </div>

        <nav style={{ flex: 1 }}> {/* flex: 1 empuja lo de abajo hacia el fondo */}
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>

          <NavLink to="/pedidos" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <ShoppingCart size={20} />
            Pedidos
          </NavLink>

          <NavLink to="/productos" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <ShoppingBag size={20} />
            Productos
          </NavLink>

          <NavLink to="/categorias" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Tags size={20} />
            Categorías
          </NavLink>
        </nav>

        {/* Sección inferior del usuario y cerrar sesión */}
        <div style={{ padding: '16px 0', borderTop: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', paddingLeft: '12px' }}>
            {user?.email}
          </p>
          <button 
            onClick={handleLogout} 
            className="nav-item" 
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#dc2626' }}
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet /> 
      </main>
    </div>
  );
};

export default Layout;