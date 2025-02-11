import React, { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import ProductList from "../component/ProductList.jsx";
import Cart from "../component/Cart.jsx"; 
import "../../styles/ventas.css";

const Ventas = () => {
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);
    const [showCart, setShowCart] = useState(false); // Estado para mostrar el carrito

    useEffect(() => {
        const token = localStorage.getItem("token"); 
        if (!token) {
            navigate("/inicio"); 
        } else {
            actions.getProducts(); 
        }
    }, []); 

    const handleClick = () => {
        navigate("/producto"); 
    };

    return (
        <div className="container my-5">
            <div className="text-center mb-4">
                <h1 className="display-4">Ventas</h1>
                <p className="lead">Productos disponibles</p>
            </div>

            <div className="d-flex justify-content-between mb-4">
                {store.role === "admin" && (
                    <button onClick={handleClick} className="btn btn-success">
                        Crear Producto
                    </button>
                )}
                
                    <button className="btn btn-primary" onClick={() => setShowCart(true)}>
                        🛒 Ver Carrito ({store.cart.length})
                    </button>
            
            </div>

            <div className="ventas-product-list">
                <ProductList />
            </div>

            {/* Ventana desplegable del carrito */}
            {showCart && <Cart onClose={() => setShowCart(false)} />}
        </div>
    );
};

export default Ventas;
