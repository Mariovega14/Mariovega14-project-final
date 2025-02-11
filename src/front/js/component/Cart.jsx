import React, { useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/cart.css";

const Cart = ({ onClose }) => {
    const { store, actions } = useContext(Context);

    const handleRemove = (productId) => {
        actions.removeFromCart(productId);
    };

    const handleIncrease = (product) => {
        actions.addToCart(product, 1);
    };

    const handleDecrease = (productId) => {
        actions.decreaseQuantity(productId);
    };

    const handleCheckout = async () => {
        await actions.createOrder();
        onClose(); 
    };

    // Calcular total del carrito
    const totalPrice = store.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalItems = store.cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="cart-overlay">
            <div className="cart-content">
                <button className="close-button" onClick={onClose}>✖</button>
                <h2>Carrito de Compras</h2>

                {store.cart.length === 0 ? (
                    <p>El carrito está vacío.</p>
                ) : (
                    <>
                        <ul className="cart-list">
                            {store.cart.map((item) => (
                                <li key={item.id} className="cart-item">
                                    <img src={item.image} alt={item.name} className="cart-img" />
                                    <div>
                                        <p><strong>{item.name}</strong></p>
                                        <p>Precio: ${item.price}</p>
                                        <p>Cantidad: {item.quantity}</p>
                                    </div>
                                    <div className="cart-actions">
                                        <button onClick={() => handleDecrease(item.id)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => handleIncrease(item)}>+</button>
                                        <button className="remove-button" onClick={() => handleRemove(item.id)}>❌</button>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="cart-summary">
                            <p><strong>Total de productos:</strong> {totalItems}</p>
                            <p><strong>Total a pagar:</strong> ${totalPrice.toFixed(2)}</p>
                        </div>

                        <button className="checkout-button" onClick={handleCheckout}>Finalizar Venta</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cart;
