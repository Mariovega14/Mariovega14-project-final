import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import Swal from "sweetalert2";

const initialProductState = {
    name: "",
    price: "",
    stock: 0,  // Ahora es numérico
    image: null
};

const AddProduct = () => {
    const [product, setProduct] = useState(initialProductState);
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();

    // Evitar acceso a vendedores
    useEffect(() => {
        if (!store.token || store.role !== "admin") {
            navigate("/inicio");
        }
    }, [store.token, store.role]);

    const handleChange = ({ target }) => {
        setProduct({
            ...product,
            [target.name]: target.name === "price" || target.name === "stock" 
                ? Number(target.value) 
                : target.value
        });
    };

    const handleFileChange = ({ target }) => {
        setProduct({
            ...product,
            image: target.files[0] 
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const productData = new FormData();
        productData.append("name", product.name);
        productData.append("price", product.price);
        productData.append("stock", product.stock);
        if (product.image) {
            productData.append("image", product.image);
        }

        const status = await actions.addProduct(productData);

        if (status === 201) {
            setProduct(initialProductState);
            Swal.fire("Producto creado", "El producto se ha creado correctamente.", "success");
            navigate("/ventas");
        } else if (status === 403) {
            Swal.fire("Acceso denegado", "No tienes permisos para agregar productos.", "error");
        } else {
            Swal.fire("Error", "Hubo un problema, intenta nuevamente.", "error");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <h3 className="text-center mb-4">Crear Producto</h3>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Nombre del Producto</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                placeholder="Producto X"
                                value={product.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="price" className="form-label">Precio</label>
                            <input
                                type="number"
                                className="form-control"
                                name="price"
                                placeholder="100"
                                value={product.price}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="stock" className="form-label">Stock</label>
                            <input
                                type="number"
                                className="form-control"
                                name="stock"
                                placeholder="Cantidad en stock"
                                value={product.stock}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="image" className="form-label">Imagen del Producto</label>
                            <input
                                type="file"
                                className="form-control"
                                name="image"
                                accept="image/png, image/jpeg, image/jpg, image/gif"
                                onChange={handleFileChange}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Crear Producto</button>
                    </form>
                    <div className="text-center">
                        <p className="m-0">
                            <Link to={"/ventas"}>Ver todos los productos</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
