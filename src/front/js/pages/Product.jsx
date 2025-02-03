import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import Swal from "sweetalert2";
import axios from "axios";

const initialProductState = {
    name: "",
    price: "",
    stock: true,  
    image: null
};

const AddProduct = () => {
    const [product, setProduct] = useState(initialProductState);
    const { actions } = useContext(Context);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/inicio");
        }
    }, [navigate]);

    const handleChange = ({ target }) => {
        setProduct({
            ...product,
            [target.name]: target.value
        });
    };

    const handleFileChange = ({ target }) => {
        setProduct({
            ...product,
            image: target.files[0] 
        });
    };

    const handleStockChange = (event) => {
        setProduct({
            ...product,
            stock: event.target.checked  
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

        try {
            const response = await axios.post("https://urban-spoon-g45wqgpv4wxv2vvw5-3001.app.github.dev/api/products", productData);

            if (response.status === 201) {
                setProduct(initialProductState); 
                Swal.fire("Producto creado", "El producto se ha creado correctamente.", "success");
                navigate("/ventas"); 
            } else {
                Swal.fire("Error", "Hubo un problema, intente nuevamente.", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Hubo un problema con la conexión", "error");
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
                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={product.stock}
                                        onChange={handleStockChange}
                                    />
                                    Disponible en stock
                                </label>
                            </div>
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