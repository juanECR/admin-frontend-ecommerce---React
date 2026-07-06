import { useState, useEffect } from 'react';
import API_URL, { getAuthHeaders } from '../services/api';
import { Eye, Clock } from 'lucide-react';
import './Orders.css';

// Diccionario para traducir estados
const statusMap = {
  pending: 'Pendiente',
  paid: 'Pagado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado'
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. CARGAR PEDIDOS
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`,{
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. ACTUALIZAR ESTADO DEL PEDIDO
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder) return;
    setIsUpdating(true);

    try {
      const response = await fetch(`${API_URL}/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Actualizamos localmente para no hacer otra petición a la base de datos completa
        setSelectedOrder({ ...selectedOrder, status: newStatus });
        fetchOrders(); // Refresca la tabla principal
      } else {
        alert("Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Función para cerrar modal
  const closeModal = () => setSelectedOrder(null);

  // Utilidad para acortar el ID y que no se vea gigante
  const shortId = (id) => id.split('-')[0].toUpperCase();

  return (
    <div>
      <div className="page-header">
        <h1>Gestión de Pedidos</h1>
        <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
           <Clock size={16} /> Últimos registros
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th style={{ textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No hay pedidos registrados</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>#{shortId(order.id)}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>{order.customers?.first_name} {order.customers?.last_name}</td>
                  <td style={{ fontWeight: 500 }}>S/ {Number(order.total_amount).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${order.status}`}>
                      {statusMap[order.status] || order.status}
                    </span>
                  </td>
                  <td style={{ display: 'flex', justifyContent: 'center' }}>
                    <button 
                      className="action-btn" 
                      title="Ver Detalles"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DETALLES DEL PEDIDO (OJO) */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content order-detail">
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Pedido <span style={{ color: 'var(--text-secondary)' }}>#{shortId(selectedOrder.id)}</span></h2>
              <span className={`badge ${selectedOrder.status}`} style={{ fontSize: '0.85rem' }}>
                {statusMap[selectedOrder.status]}
              </span>
            </div>

            <div className="order-details-grid">
              {/* Bloque Cliente */}
              <div className="details-box">
                <h3>Datos del Cliente</h3>
                <p><strong>Nombre:</strong> {selectedOrder.customers?.first_name} {selectedOrder.customers?.last_name}</p>
                <p><strong>DNI:</strong> {selectedOrder.customers?.dni}</p>
                <p><strong>Email:</strong> {selectedOrder.customers?.email || 'No especificado'}</p>
              </div>

              {/* Bloque Gestión de Estado */}
              <div className="details-box">
                <h3>Gestión</h3>
                <p style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Actualiza el estado de este pedido según el proceso de envío.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    className="input-base" 
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    disabled={isUpdating}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de Productos Comprados */}
            <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Productos Comprados</h3>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style={{ textAlign: 'center' }}>Cant.</th>
                  <th style={{ textAlign: 'right' }}>Precio Unit.</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.order_items?.map((item, index) => (
                  <tr key={index}>
                    <td>{item.products?.name || 'Producto Desconocido'}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>S/ {Number(item.unit_price).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>
                      S/ {(item.quantity * item.unit_price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="order-total-row">
              Total pagado: <span style={{ marginLeft: '12px' }}>S/ {Number(selectedOrder.total_amount).toFixed(2)}</span>
            </div>

            <div className="modal-actions" style={{ marginTop: '0' }}>
              <button className="btn-secondary" onClick={closeModal}>
                Cerrar Panel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;