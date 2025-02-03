const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            token: localStorage.getItem("token") || null,
            role: localStorage.getItem("role") || null,  // Guardar el rol
            products: [],
            users: [],  // Para manejar usuarios
        },
        actions: {
            // Registro de usuario
            register: async (user) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/register`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(user),
                    });
                    return response.status;
                } catch (error) {
                    console.log(error);
                    return 500;
                }
            },

            // Inicio de sesión
            inicio: async (user) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(user),
                    });
                    const data = await response.json();
                    if (response.ok) {
                        // Guardar token y rol después del login
                        setStore({ token: data.token, role: data.role });
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("role", data.role);  
                    }
                    return response.status;
                } catch (error) {
                    console.log(error);
                    return 500;
                }
            },

            // Logout
            logout: () => {
                setStore({ token: null, role: null });  
                localStorage.removeItem("token");
                localStorage.removeItem("role");  
            },

            // Obtener productos 
            getProducts: async () => {
                try {
                    const store = getStore();
                    
                    
                    if (store.products.length > 0) {
                        return;  
                    }
            
                    const response = await fetch(`${process.env.BACKEND_URL}/products`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: store.token ? `Bearer ${store.token}` : "",
                        },
                    });
            
                    if (!response.ok) {
                        throw new Error(`Error ${response.status}: No se pudieron obtener los productos`);
                    }
            
                    const data = await response.json();
                    const products = Array.isArray(data) ? data : data.products || [];
            
                    setStore({ products });
            
                } catch (error) {
                    console.error("Error en getProducts:", error);
                }
            },

            // Añadir un nuevo producto 
            addProduct: async (formData) => {
                try {
                    const store = getStore();
                    const actions = getActions();  

                    
                    if (store.role !== "admin") {
                        alert("No tienes permisos para agregar productos.");
                        return 403;  
                    }
            
                    const response = await fetch(`${process.env.BACKEND_URL}/products`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${store.token}`,
                        },
                        body: formData,
                    });
            
                    if (!response.ok) {
                        throw new Error(`Error ${response.status}: No se pudo crear el producto`);
                    }
            
                    const newProduct = await response.json();
                    
                    
                    await actions.getProducts();
            
                    return 201; 
                } catch (error) {
                    console.log("Error en addProduct:", error);
                    return 500;
                }
            },

            
            deleteProduct: async (productId) => {
                try {
                    const store = getStore();
                    const actions = getActions();  

                    
                    if (store.role !== "admin") {
                        alert("No tienes permisos para eliminar productos.");
                        return 403;  // 
                    }

                    const response = await fetch(`${process.env.BACKEND_URL}/products/${productId}`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${store.token}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Error ${response.status}: No se pudo eliminar el producto`);
                    }

                    
                    await actions.getProducts();
                    
                    return 200;  
                } catch (error) {
                    console.log("Error en deleteProduct:", error);
                    return 500;
                }
            },

            
            getUsers: async () => {
                try {
                    const store = getStore();
            
                    if (store.users.length > 0) {
                        return;
                    }
            console.log(typeof store.token)
                    const response = await fetch(`${process.env.BACKEND_URL}/users`, {
                        method: "GET",
                        headers: {
                            //"Content-Type": "application/json",
                            "Authorization":"Bearer ", 
                        },
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json(); 
                        console.error("Error en getUsers:", response.status, errorData);
                        throw new Error(`Error ${response.status}: No se pudieron obtener los usuarios`);
                    }
            
                    const data = await response.json();
                    setStore({ users: data.users });
            
                } catch (error) {
                    console.error("Error en getUsers (catch):", error);
                }
            },
            
            

            
            deleteUser: async (userId) => {
                try {
                    const store = getStore();
                    const actions = getActions();

                    
                    if (store.role !== "admin") {
                        alert("No tienes permisos para eliminar usuarios.");
                        return 403;  
                    }

                    const response = await fetch(`${process.env.BACKEND_URL}/users/${userId}`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${store.token}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Error ${response.status}: No se pudo eliminar el usuario`);
                    }

                    
                    const updatedUsers = store.users.filter((user) => user.id !== userId);
                    setStore({ users: updatedUsers });

                    alert("Usuario eliminado exitosamente.");
                    return 200;  
                } catch (error) {
                    console.log("Error en deleteUser:", error);
                    alert("Hubo un error al eliminar el usuario.");
                    return 500;
                }
            },
        },
    };
};

export default getState;
