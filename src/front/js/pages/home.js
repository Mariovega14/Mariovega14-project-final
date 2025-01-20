import React, { Component, useContext } from "react";
import "../../styles/home.css";
import { Inicio } from "../component/Inicio.jsx";
import { Ventas } from "../component/Ventas.jsx";
import { useState } from "react";



export const Home = () => {
	const [user , setUser] = useState([]);

	return (
		<div className="Home">
			{
				!user.length > 0
				?<Inicio setUser={setUser} />
				:<Ventas user={user} />
			}
           
         
		 </div>
	);
};
