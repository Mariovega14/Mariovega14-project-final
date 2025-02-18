import React, { useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/usuarios.css";
import UserList from "../component/UserList.jsx"; 

const Usuarios = () => {
    const { store } = useContext(Context);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/inicio"); 
            return;
        }

        try {
            const decodedToken = JSON.parse(atob(token.split('.')[1])); 
            if (decodedToken.role !== "admin") {
                navigate("/ventas"); 
                return;
            }
        } catch (error) {
            console.error("Error al verificar el token:", error);
            navigate("/inicio"); 
        }
    }, [store.token]);

    return (
        <div className="usuarios-container">
            <UserList /> 
        </div>
    );
};

export default Usuarios;
