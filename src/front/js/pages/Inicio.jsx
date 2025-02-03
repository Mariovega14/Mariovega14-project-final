import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

const initialUserState = {
    email: "",
    password: ""
}

const Inicio = () => {
    const [user, setUser] = useState(initialUserState);
    const { actions } = useContext(Context);
    const navigate = useNavigate();

    
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/ventas"); 
        }
    }, []);

    const handleChange = ({ target }) => {
        setUser({
            ...user,
            [target.name]: target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const response = await actions.inicio(user);
        if (response == 200) {
            navigate("/ventas");
        } else if (response == 400) {   
            alert("Contraseña Incorrecta");
        }
    };

    return (
        <>
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-4">
                        <h3 className="text-center mb-4">Login</h3>
                        <form onSubmit={handleSubmit}>
                            {/* Email */}
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email address</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="email"
                                    placeholder="Email"
                                    value={user.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {/* Password */}
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="password"
                                    placeholder="Contraseña"
                                    value={user.password}
                                    onChange={handleChange}
                                />
                            </div>
                            {/* Submit Button */}
                            <button type="submit" className="btn btn-primary w-100">Login</button>
                        </form>
                        <div className="text-center">
                            <p className="m-0">
                                No tienes cuenta? <Link to={"/register"}>Registrate</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Inicio;