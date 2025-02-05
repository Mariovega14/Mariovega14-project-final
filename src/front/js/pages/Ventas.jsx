import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import ProductList from "../component/ProductList.jsx";
import "../../styles/ventas.css";

const Ventas = () => {
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);

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

            
            {store.role === "admin" && (
                <div className="d-flex justify-content-end mb-4">
                    <button onClick={handleClick} className="btn btn-success">
                        Crear Producto
                    </button>
                </div>
            )}

            <div className="ventas-product-list">
                <ProductList />
            </div>
        </div>
    );
};

export default Ventas;