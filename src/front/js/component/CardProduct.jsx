import React from "react";
import "../../styles/cardproduct.css";

const CardProduct = ({ name, price, stock, image }) => {
    
    const imageUrl = image; 

    return (
        <div className="card">
            <img
                src={imageUrl}  
                className="card-img-top"
                alt={name}
            />
            <div className="card-body">
                <h5 className="card-title">{name}</h5>
                <p className="card-text">Precio: ${price}</p>

                
                <p className={`card-text stock-status ${stock ? 'in-stock' : 'out-of-stock'}`}>
                    {stock ? "Disponible" : "No disponible"}
                </p>

                <button className="card-button">Agregar al carrito</button>
            </div>
        </div>
    );
};

export default CardProduct;