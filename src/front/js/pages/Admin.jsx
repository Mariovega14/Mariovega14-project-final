import React, { useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import UserList from "../component/UserList.jsx";
import "../../styles/admin.css";

const Admin = () => {
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/ventas");
        } else {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const role = decodedToken.role;
            if (role !== "admin") {
                navigate("/ventas");
            }
        }

    }, []);

    return (
        <div className="admin-container">
            <div className="sidebar">
                <h1 className="sidebar-title">Panel de Admin</h1>
                <ul className="sidebar-menu">
                    <li>
                        <Link to="/admin/dashboard" className="sidebar-link">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/ventas" className="sidebar-link">Productos</Link>
                    </li>
                    <li>
                        <Link to="/admin/orders" className="sidebar-link">Órdenes</Link>
                    </li>
                    <li>
                        <Link to="/admin/users" className="sidebar-link">Usuarios</Link>
                    </li>
                    <li>
                        <Link to="/admin/settings" className="sidebar-link">Ajustes</Link>
                    </li>
                </ul>
            </div>

            <div className="main-content">
                <header className="main-header">
                    <h1>Bienvenido al Panel de Administración</h1>
                </header>

                <section className="section-content">
                    <div className="section">
                        <h2 className="section-title">Resumen de la actividad</h2>
                        <p>Mostrar estadísticas generales (ventas, usuarios, productos, etc.)</p>
                    </div>


                    <div className="section">
                        <h2 className="section-title">Órdenes recientes</h2>
                        <p>Mostrar lista de las órdenes más recientes</p>
                    </div>

                    <div className="section">
                        <h2 className="section-title">Lista de Usuarios</h2>
                        <UserList />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Admin;