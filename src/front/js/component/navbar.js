import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Navbar.css";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { actions, store } = useContext(Context);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
              <a href="#configuracion">Configuración</a>
              <a href="#ventas">Ventas</a>
              <a onClick={() => actions.logout()}>Cerrar Sesión</a>
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