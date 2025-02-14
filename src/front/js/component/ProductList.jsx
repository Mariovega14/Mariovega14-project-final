import React, { useEffect, useContext, useRef, useState } from "react";
import { Context } from "../store/appContext";
import CardProduct from "../component/CardProduct.jsx";
import "../../styles/productlist.css";

const ProductList = () => {
    const { store, actions } = useContext(Context);
    const hasFetched = useRef(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!hasFetched.current && store.products.length === 0) {
            actions.getProducts();
            hasFetched.current = true;
        }
    }, [store.products.length, actions]);

    if (!store.products || !Array.isArray(store.products)) {
        return <p className="no-products">Cargando productos...</p>;
    }

    const sortedProducts = [...store.products].sort((a, b) =>
        a.stock === 0 ? 1 : b.stock === 0 ? -1 : 0
    );

    const filteredProducts = sortedProducts.filter((product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="product-list-container">
            <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-bar"
            />

            <div className="product-list">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                        if (store.role === "vendedor" && product.stock === 0) return null;

                        return (
                            <div
                                key={product.id}
                                className={`product-card ${product.stock === 0 && store.role === "admin" ? "out-of-stock-admin" : ""}`}
                            >
                                <CardProduct {...product} />
                            </div>
                        );
                    })
                ) : (
                    <p className="no-products">No hay productos disponibles</p>
                )}
            </div>
        </div>
    );
};

export default ProductList;
