import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Navbar.css";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { actions, store } = useContext(Context);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    actions.logout(); // 
    localStorage.removeItem("token"); 
    window.location.reload(); 
    navigate("/inicio"); 
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">DulceYogurt</div>
      
      {store.token ? (
        <div className="navbar-right">
          <button className="menu-button" onClick={toggleMenu}>
            ☰
          </button>
          {isMenuOpen && (
            <div className="dropdown-menu">
              <a href="#perfil">Perfil</a>
              {store.role === 'admin' && (
                <Link to="/admin">Admin</Link> 
              )}
              <a href="#configuracion">Configuración</a>
              <a href="#ventas">Ventas</a>
              
              
              <a onClick={handleLogout}>Cerrar Sesión</a> 
            </div>
          )}
        </div>
      ) : (
        <div className="navbar-right">
          <button
            className="menu-button"
            onClick={toggleMenu}
            aria-label="Abrir/Cerrar menú"
          >
            ☰
          </button>
          {isMenuOpen && (
            <div className="dropdown-menu">
              <Link to="/inicio">Iniciar Sesión</Link>
              <Link to="/register">Registrarse</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;