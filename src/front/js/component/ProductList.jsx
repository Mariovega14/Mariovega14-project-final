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
    }, [store.products.length, actions]);

    const userRole = store.role;  

    // Ordenar productos: primero los que tienen stock, luego los que no
    const sortedProducts = [...store.products].sort((a, b) => {
        return a.stock === 0 ? 1 : b.stock === 0 ? -1 : 0;
    });

    return (
        <div className="product-list">
            {sortedProducts.length > 0 ? (
                sortedProducts.map((product) => {
                    const isOutOfStock = product.stock === 0;  
                    const isAdmin = userRole === 'admin';
                    const isSeller = userRole === 'vendedor';

                    // Si es vendedor, ocultar productos sin stock
                    if (isSeller && isOutOfStock) {
                        return null;
                    }

                    // Clase especial para productos sin stock (visible solo para admin)
                    const productClass = isOutOfStock && isAdmin ? 'out-of-stock-admin' : '';

                    return (
                        <div
                            key={product.id}
                            className={`product-card ${productClass}`}  
                        >
                            <CardProduct
                                id={product.id}
                                name={product.name}
                                price={product.price}
                                stock={product.stock}
                                image={product.image}
                            />
                        </div>
                    );
                })
            ) : (
                <p className="no-products">No hay productos disponibles</p>
            )}
        </div>
    );
};

export default ProductList;
