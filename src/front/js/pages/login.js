import React, { useContext, useState } from "react";
import "../../styles/home.css";
import { Context } from "../store/appContext";



export const Login = () => {
    const { store, actions } = useContext(Context);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleClick = () => {
        const option = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
        body: JSON.stringify({
                "email": email,
                "password": password
            })
        }
        fetch('https://urban-spoon-g45wqgpv4wxv2vvw5-3001.app.github.dev/api/token', option)
            .then(resp => {
                if (resp.status === 200) return resp.json();
                else alert("there has been some error")
            })
            .then(error => {
                console.error("there is a error".error)
            })
    }

    return (
        <div className="text-center mt-5">
            <h1>login</h1>
            <input type="text"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={() => handleClick()}>login </button>



        </div>
    );
};