import React, { useEffect, useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/orders.css";

const Orders = () => {
    const { store, actions } = useContext(Context);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchId, setSearchId] = useState("");
    const [selectedSeller, setSelectedSeller] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (store.role !== "admin") {
            navigate("/");
        } else {
            actions.getOrders();
        }
    }, []);

    // 🔹 
    const filteredOrders = store.orders.filter(order => {
        const matchesId = searchId ? order.id.toString().includes(searchId) : true;
        const matchesSeller = selectedSeller ? order.seller?.name === selectedSeller : true;


        const orderDate = new Date(order.created_at).toISOString().split("T")[0];
        const matchesDate = selectedDate ? orderDate === selectedDate : true;

        return matchesId && matchesSeller && matchesDate;
    });

    return (
        <div className="orders-page">
            <h2>Órdenes</h2>

            
            <div className="filters">
                <input
                    type="text"
                    placeholder="Buscar por ID"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                />

                <select value={selectedSeller} onChange={(e) => setSelectedSeller(e.target.value)}>
                    <option value="">Todos los vendedores</option>
                    {Array.from(new Set(store.orders.map(order => order.seller?.name)))
                        .filter(name => name)
                        .map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                </select>

                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>

            {/* 📜 Lista de órdenes */}
            {filteredOrders.length === 0 ? (
                <p>No hay órdenes registradas.</p>
            ) : (
                <ul className="orders-list">
                    {filteredOrders.map((order) => (
                        <li
                            key={order.id}
                            className="order-item"
                            onClick={() => setSelectedOrder(order)}
                        >
                            <p><strong>Orden ID:</strong> {order.id}</p>
                            <p><strong>Fecha:</strong> {new Date(order.created_at).toLocaleString()}</p>
                            <p><strong>Total:</strong> ${order.total_price.toFixed(2)}</p>
                            <p><strong>Vendedor:</strong> {order.seller ? order.seller.name : "Desconocido"}</p>
                        </li>
                    ))}
                </ul>
            )}

            
            {selectedOrder && (
                <>
                    <div className="modal-overlay" onClick={() => setSelectedOrder(null)}></div>
                    <div className="order-modal">
                        <div className="invoice-header">
                            <h3>Factura de Venta</h3>
                            <p><strong>Orden ID:</strong> {selectedOrder.id}</p>
                            <p><strong>Fecha:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                            <p><strong>Vendedor:</strong> {selectedOrder.seller ? selectedOrder.seller.name : "Desconocido"}</p>
                        </div>

                        <table className="invoice-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedOrder.items.map((item) => (
                                    <tr key={item.product_id}>
                                        <td>{item.product_name}</td>
                                        <td>{item.quantity}</td>
                                        <td>${item.price.toFixed(2)}</td>
                                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <p className="invoice-total">Total: ${selectedOrder.total_price.toFixed(2)}</p>


                        <button className="close-btn" onClick={() => setSelectedOrder(null)}>Cerrar</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Orders;
