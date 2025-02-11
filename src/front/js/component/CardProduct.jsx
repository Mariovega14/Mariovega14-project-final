import React, { useState, useContext } from "react";
import ReactDOM from "react-dom";
import { Context } from "../store/appContext";
import "../../styles/cardproduct.css";

const CardProduct = ({ id, name, price, stock, image }) => {
    const { store, actions } = useContext(Context);
    const [isOpen, setIsOpen] = useState(false);
    const [editedData, setEditedData] = useState({ name, price, stock });

    const handleEditClick = (e) => {
        e.stopPropagation(); // Evita que el click en el botón active el evento de la tarjeta
        setIsOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData({
            ...editedData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedProduct = {
            name: editedData.name,
            price: parseFloat(editedData.price),
            stock: parseInt(editedData.stock, 10)
        };

        await actions.editProduct(id, formattedProduct);
        setEditedData(formattedProduct);
        setIsOpen(false);
    };

    // ✅ Nueva función para agregar al carrito al hacer clic en la tarjeta
    const handleAddToCart = () => {
        if (stock > 0) {
            actions.addToCart({ id, name, price, stock, image });
        }
    };

    return (
        <>
            
            <div className="card" onClick={handleAddToCart}>
                <img src={image} className="card-img-top" alt={name} />
                <div className="card-body">
                    <h5 className="card-title">{name}</h5>
                    <p className="card-text">Precio: ${price}</p>
                    <p className="card-text">Stock disponible: {stock}</p>
                    
                    
                    
                    {store.role === "admin" && (
                        <button className="edit-button" onClick={handleEditClick}>
                            ✏️
                        </button>
                    )}
                </div>
            </div>

            {isOpen &&
                ReactDOM.createPortal(
                    <>
                        <div className="modal-overlay" onClick={() => setIsOpen(false)} />
                        <div className="modal-content">
                            <h3>Editar Producto</h3>
                            <form onSubmit={handleSubmit}>
                                <label>Nombre:</label>
                                <input type="text" name="name" value={editedData.name} onChange={handleChange} />
                                <label>Precio:</label>
                                <input type="number" name="price" value={editedData.price} onChange={handleChange} />
                                <label>Stock:</label>
                                <input type="number" name="stock" value={editedData.stock} onChange={handleChange} />
                                <button type="submit">Guardar Cambios</button>
                                <button type="button" onClick={() => setIsOpen(false)}>Cancelar</button>
                            </form>
                        </div>
                    </>,
                    document.body
                )}
        </>
    );
};

export default CardProduct;
