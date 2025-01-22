import React, { useContext } from "react";
import { Context } from "../store/appContext.js";
import "../../styles/home.css";
import  Ventas  from "../pages/Ventas.jsx";
import { useState } from "react";
import { Navigate } from "react-router-dom";



export const Home = () => {
	const [store , actions] = useContext(Context);

	return (
		<>
		{
		store.token ? 
        <Ventas/> :
		<Navigate to ={"/inicio"}/>
		}
		</>
	);
};
