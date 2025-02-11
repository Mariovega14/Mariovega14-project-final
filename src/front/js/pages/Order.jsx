import React, { useEffect, useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/orders.css";

const Orders = () => {
    const { store, actions } = useContext(Context);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        if (store.role !== "admin") {
            navigate("/");
        } else {
            actions.getOrders();
        }
    }, []);

    return (
        <div className="orders-page">
            <h2>Órdenes</h2>
            {store.orders.length === 0 ? (
                <p>No hay órdenes registradas.</p>
            ) : (
                <ul className="orders-list">
                    {store.orders.map((order) => (
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
                        <h3>Detalles de la Orden #{selectedOrder.id}</h3>
                        <ul>
                            {selectedOrder.items.map((item) => (
                                <li key={item.product_id}>
                                    <p><strong>{item.product_name}</strong></p>
                                    <p>Cantidad: {item.quantity}</p>
                                    <p>Precio unitario: ${item.price}</p>
                                    <p>Total: ${item.price * item.quantity}</p>
                                </li>
                            ))}
                        </ul>
                        <p><strong>Total de la Orden:</strong> ${selectedOrder.total_price.toFixed(2)}</p>
                        <button className="close-btn" onClick={() => setSelectedOrder(null)}>Cerrar</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Orders;
