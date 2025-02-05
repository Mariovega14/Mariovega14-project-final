import React, { useEffect, useContext, useRef } from "react";
import { Context } from "../store/appContext";
import CardProduct from "../component/CardProduct.jsx";
import "../../styles/productlist.css";

const ProductList = () => {
    const { store, actions } = useContext(Context);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!hasFetched.current && store.products.length === 0) {
            actions.getProducts();
            hasFetched.current = true;  
        }
    }, []);

    return (
        <div className="product-list">
            {store.products.length > 0 ? (
                store.products.map((product) => (
                    <div key={product.id} className="product-card">
                        <CardProduct
                            name={product.name}
                            price={product.price}
                            stock={product.stock}
                            image={product.image}
                        />
                    </div>
                ))
            ) : (
                <p className="no-products">No hay productos disponibles</p>
            )}
        </div>
    );
};

export default ProductList;