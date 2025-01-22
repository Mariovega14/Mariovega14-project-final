const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			token: localStorage.getItem("token") || null
		},
		actions: {
			register: async (user) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/register`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify(user)
					})
					return response.status
				} catch (error) {
					console.log(error)
					return response.status
				}
			},
			inicio: async (user) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/login`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						}, body: JSON.stringify(user)
					})
					const data = await response.json()
					if (response.ok) {
						setStore({
							token: data.token
						})
						localStorage.setItem("token", data.token)

					}
					return response.status


				} catch (error) {
					console.log(error)
				}
			},
			logout: () => {
				setStore({
					token: null
				})
				localStorage.removeItem("token")
			}
		}
	}

};

export default getState;
