import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const initialUserState = {
    name: "",
    email: "",
    password: ""
}

const Register = () => {

    const [user, setUser] = useState(initialUserState)
    const { actions } = useContext(Context)
    const navigate = useNavigate();

    const handleChange = ({ target }) => {
        setUser({
            ...user,
            [target.name]: target.value
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        const response = await actions.register(user)
        if (response ==201){
            setUser(initialUserState)
            alert("El usuario se registro correctamente")
            navigate("/inicio");

        }else if (response == 400){
            alert("El usuario ya existe")
        }else{
            alert("Intentelo Nuevamente")
        }
    }




    
    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <h3 className="text-center mb-4">Register</h3>
                    <form
                        onSubmit={handleSubmit}
                    >
                        {/* Full Name */}
                        <div className="mb-3">
                            <label htmlFor="fullName" className="form-label">Nombre Completo</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                placeholder="Pepito Perez"
                                value={user.name}
                                onChange={handleChange}
                            />
                        </div>
                        {/* Email */}
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Correo</label>
                            <input
                                type="text"
                                className="form-control"
                                name="email"
                                placeholder="juanito@gmail.com"
                                value={user.email}
                                onChange={handleChange}
                            />
                        </div>
                        {/* Password */}
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                placeholder="1234...."
                                value={user.password}
                                onChange={handleChange}
                            />
                        </div>
                        {/* Submit Button */}
                        <button type="submit" className="btn btn-primary w-100">Register</button>
                    </form>
                    <div className="text-center">
                        <p className="m-0">
                            ¿Ya tienes cuenta? <Link to={"/inicio"}>Inicia sesión</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>

    )

}

export default Register