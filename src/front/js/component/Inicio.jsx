import React, { useState } from "react"
import "../../styles/Inicio.css"

export function Inicio({setUser}) {
    const [usuario, setUsuario] = useState("")
    const [contraseña, setContraseña] = useState("")
    const [error, setError] = useState(false)


    const handleSubmit = (e) => {
        e.preventDefault()

        if (usuario === "" || contraseña === "") {
            setError(true)
            return
        }
        setError(false)

        setUser([usuario])
    }

    return (<section>

        <h1>login</h1>
        <form className="Inicio"
        onSubmit={handleSubmit}>
            <input
                type="text"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
            />
            <input
                type="password"
                value={contraseña}
                onChange={e => setContraseña(e.target.value)}
            />
            <button>Iniciar Sesion</button>
        </form>
        {error && <p>Todos los campos deben estar llenos</p>}

    </section>
    )
}