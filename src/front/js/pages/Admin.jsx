import React, { useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/admin.css";

const Admin = () => {
    const navigate = useNavigate();
    const { store } = useContext(Context);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/ventas");
        } else {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            if (decodedToken.role !== "admin") {
                navigate("/ventas");
            }
        }
    }, []);

    return (
        <div className="admin-container">
            
            <aside className="sidebar">
                <h1 className="sidebar-title">Panel de Admin</h1>
                <ul className="sidebar-menu">
                    <li>
                        <Link to="/salesreport" className="sidebar-link">📊 Reportes de Ventas</Link>
                    </li>
                    <li>
                        <Link to="/ventas" className="sidebar-link">📦 Productos</Link>
                    </li>
                    <li>
                        <Link to="/admin/orders" className="sidebar-link">🛒 Órdenes</Link>
                    </li>
                    <li>
                        <Link to="/admin/usuarios" className="sidebar-link">👥 Usuarios</Link>
                    </li>
                </ul>
            </aside>

            
            <main className="main-content">
                <header className="main-header">
                    <h1>Bienvenido al Panel de Administración</h1>
                </header>

                <section className="admin-dashboard">
                    <h2>Selecciona una opción en el menú</h2>
                    <p>Desde aquí puedes administrar ventas, productos, órdenes y usuarios.</p>
                </section>
            </main>
        </div>
    );
};

export default Admin;
