const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            token: localStorage.getItem("token") || null,
            role: localStorage.getItem("role") || null,
            products: [],
            users: [],
            latestProducts: [],
            cart: [],
            orders: [],
            salesReports: null
            
        },
        actions: {
            register: async (user) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/register`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(user),
                    });
                    return response.status;
                } catch (error) {
                    console.error("Error en register:", error);
                    return 500;
                }
            },

            inicio: async (user) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(user),
                    });
                    const data = await response.json();
                    if (response.ok) {
                        setStore({ token: data.token, role: data.role });
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("role", data.role);
                    }
                    return response.status;
                } catch (error) {
                    console.error("Error en inicio:", error);
                    return 500;
                }
            },

            logout: () => {
                setStore({ token: null, role: null });
                localStorage.removeItem("token");
                localStorage.removeItem("role");
            },

            getProducts: async () => {
                try {
                    const store = getStore();
                    if (store.products.length > 0) return;

                    const response = await fetch(`${process.env.BACKEND_URL}/products`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: store.token ? `Bearer ${store.token}` : "",
                        },
                    });

                    if (!response.ok) throw new Error("No se pudieron obtener los productos");

                    const data = await response.json();
                    setStore({ products: Array.isArray(data) ? data : data.products || [] });

                } catch (error) {
                    console.error("Error en getProducts:", error);
                }
            },

            addProduct: async (formData) => {
                try {
                    const store = getStore();
                    if (store.role !== "admin") return 403;
                    if (!store.token) return 401;

                    const response = await fetch(`${process.env.BACKEND_URL}/products`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${store.token}` },
                        body: formData,
                    });

                    if (!response.ok) throw new Error("No se pudo agregar el producto");

                    const newProduct = await response.json();
                    setStore({ products: [...store.products, newProduct] });

                    return 201;
                } catch (error) {
                    console.error("Error en addProduct:", error);
                    return 500;
                }
            },

            editProduct: async (productId, updatedProduct) => {
                try {
                    const store = getStore();
                    if (store.role !== "admin") return 403;

                    const response = await fetch(`${process.env.BACKEND_URL}/products/${productId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${store.token}`,
                        },
                        body: JSON.stringify(updatedProduct),
                    });

                    if (!response.ok) throw new Error("No se pudo actualizar el producto");

                    const updatedProductData = await response.json();
                    setStore({
                        products: store.products.map(product =>
                            product.id === productId ? updatedProductData : product
                        ),
                    });

                    return 200;
                } catch (error) {
                    console.error("Error en editProduct:", error);
                    return 500;
                }
            },

            deleteProduct: async (productId) => {
                try {
                    const store = getStore();
                    if (store.role !== "admin") return 403;

                    const response = await fetch(`${process.env.BACKEND_URL}/products/${productId}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${store.token}` },
                    });

                    if (!response.ok) throw new Error("No se pudo eliminar el producto");

                    getActions().getProducts();
                    return 200;
                } catch (error) {
                    console.error("Error en deleteProduct:", error);
                    return 500;
                }
            },

            getUsers: async () => {
                try {
                    const store = getStore();
                    if (store.users.length > 0) return;

                    const response = await fetch(`${process.env.BACKEND_URL}/users`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${store.token}`,
                        },
                    });

                    if (!response.ok) throw new Error("No se pudieron obtener los usuarios");

                    const data = await response.json();
                    setStore({ users: data.users });

                } catch (error) {
                    console.error("Error en getUsers:", error);
                }
            },

            addToCart: (product, quantity = 1) => {
                const store = getStore();
                const updatedCart = store.cart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );

                if (!store.cart.some(item => item.id === product.id)) {
                    updatedCart.push({ ...product, quantity });
                }

                setStore({ cart: updatedCart });
            },

            removeFromCart: (productId) => {
                const store = getStore();
                setStore({ cart: store.cart.filter(item => item.id !== productId) });
            },

            decreaseQuantity: (productId) => {
                const store = getStore();
                setStore({
                    cart: store.cart
                        .map(item => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
                        .filter(item => item.quantity > 0),
                });
            },

            clearCart: () => setStore({ cart: [] }),

            createOrder: async () => {
                const store = getStore();
                if (!store.token) return;
                if (store.cart.length === 0) return;

                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/orders`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${store.token}`,
                        },
                        body: JSON.stringify({
                            items: store.cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        return alert(`Error: ${errorData.error}`);
                    }

                    const data = await response.json();
                    alert(`Orden creada con éxito. ID: ${data.order_id}`);
                    setStore({ cart: [] });

                } catch (error) {
                    console.error("Error en createOrder:", error);
                }
            },

            getOrders: async () => {
                const store = getStore();
                if (!store.token) return;

                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/orders`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${store.token}`,
                        },
                    });

                    if (!response.ok) return;

                    const data = await response.json();
                    if (!data.orders) return;

                    setStore({
                        orders: data.orders.map(order => ({
                            id: order.id,
                            created_at: order.created_at,
                            seller: order.seller ? { id: order.seller.id, name: order.seller.name } : { id: null, name: "Desconocido" },
                            total_price: order.total_price || 0,
                            items: order.items.map(item => ({
                                product_id: item.product_id,
                                product_name: item.product_name,
                                quantity: item.quantity,
                                price: item.price || 0,
                            })),
                        })),
                    });

                } catch (error) {
                    console.error("Error en getOrders:", error);
                }
            },

            getSalesReport: async (filter = "daily") => {
                try {
                  const token = localStorage.getItem("token");
                  const response = await fetch(`${process.env.BACKEND_URL}/salesreport?filter=${filter}`,
                    {
                      method: "GET",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
        
                  if (!response.ok) throw new Error("Error al obtener el reporte");
        
                  const data = await response.json();
                  setStore({ salesReport: data }); // Guardamos los datos en el store
                } catch (error) {
                  console.error("Error al obtener reporte de ventas:", error);
                }
            
            },
        },
    };
};

export default getState;