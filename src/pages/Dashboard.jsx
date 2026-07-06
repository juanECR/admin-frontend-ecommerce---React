import { useState, useEffect } from 'react';
import API_URL, { getAuthHeaders } from '../services/api';
import { DollarSign, ShoppingCart, Package, Tags } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalCategories: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Hacemos las 3 peticiones en paralelo para que cargue más rápido
        const [ordersRes, productsRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/orders`,{ headers: getAuthHeaders() }),
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categories`)
        ]);

        const orders = await ordersRes.json();
        const products = await productsRes.json();
        const categories = await categoriesRes.json();

        // Calculamos las métricas
        // 1. Sumamos el dinero de todas las órdenes que NO estén canceladas
        const sales = orders
          .filter(order => order.status !== 'cancelled')
          .reduce((sum, order) => sum + Number(order.total_amount), 0);

        // 2. Contamos cuántas órdenes están pendientes
        const pending = orders.filter(order => order.status === 'pending').length;

        // Actualizamos el estado con los resultados
        setMetrics({
          totalSales: sales,
          pendingOrders: pending,
          totalProducts: products.length,
          totalCategories: categories.length
        });

      } catch (error) {
        console.error("Error al cargar los datos del dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Resumen General</h1>
        <p>Bienvenido de vuelta. Aquí tienes un vistazo rápido de tu tienda.</p>
      </div>

      {isLoading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Cargando métricas...</p>
      ) : (
        <div className="kpi-grid">
          
          {/* Tarjeta 1: Ventas Totales */}
          <div className="kpi-card">
            <div className="kpi-icon sales">
              <DollarSign size={28} />
            </div>
            <div className="kpi-info">
              <span className="kpi-title">Ventas Totales</span>
              <span className="kpi-value">S/ {metrics.totalSales.toFixed(2)}</span>
            </div>
          </div>

          {/* Tarjeta 2: Pedidos Pendientes */}
          <div className="kpi-card">
            <div className="kpi-icon orders">
              <ShoppingCart size={28} />
            </div>
            <div className="kpi-info">
              <span className="kpi-title">Pedidos Pendientes</span>
              <span className="kpi-value">{metrics.pendingOrders}</span>
            </div>
          </div>

          {/* Tarjeta 3: Total Productos */}
          <div className="kpi-card">
            <div className="kpi-icon products">
              <Package size={28} />
            </div>
            <div className="kpi-info">
              <span className="kpi-title">Productos en Catálogo</span>
              <span className="kpi-value">{metrics.totalProducts}</span>
            </div>
          </div>

          {/* Tarjeta 4: Total Categorías */}
          <div className="kpi-card">
            <div className="kpi-icon categories">
              <Tags size={28} />
            </div>
            <div className="kpi-info">
              <span className="kpi-title">Categorías Activas</span>
              <span className="kpi-value">{metrics.totalCategories}</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Dashboard;