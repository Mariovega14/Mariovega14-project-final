import React, { useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/userlist.css";

const UserList = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();

    useEffect(() => {
        if (!store.token) {
            navigate("/ventas");
            return;
        }

        actions.getUsers(); 
    }, [store.token]);

    return (
        <div className="user-list-container">
            <h2>Gestión de Usuarios</h2>

            <table className="user-list-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {store.users.length > 0 ? (
                        store.users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td className={user.is_active ? "active" : "inactive"}>
                                    {user.is_active ? "Activo" : "Deshabilitado"}
                                </td>
                                <td>
                                    <button
                                        onClick={() => actions.toggleUserStatus(user.id)}
                                        className={user.is_active ? "disable-btn" : "enable-btn"}
                                    >
                                        {user.is_active ? "Deshabilitar" : "Habilitar"}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No hay usuarios disponibles</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserList;
