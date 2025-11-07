import React, { createContext, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-toastify'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)


    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        if (storedToken) {
            try {
                const decoded = jwtDecode(storedToken)
                if (decoded.exp * 1000 > Date.now()) {
                    setUser(decoded)
                    setToken(storedToken)
                } else {
                    localStorage.removeItem("token")
                }
            } catch (error) {
                console.error("token invalido", error)
                localStorage.removeItem("token")
            }
        }
    }, [])

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })

            if (!response.ok) {
                if (response.status === 429) {
                    toast.error('Demasiados intentos. Intente mas tarde.')
                } else {
                    toast.error("Credenciales incorrectas");
                    return false; 
                }
            }
                
            const data = await response.json()
            const jwtToken = data.access_token



            if (!jwtToken) return toast.error("No se recibio el token")

            localStorage.setItem('token', jwtToken)
            const decoded = jwtDecode(jwtToken)
            setUser(decoded)
            setToken(jwtToken)

            toast.success('Inicio de sesion exitoso')
            return true
        } catch (error) {
            toast.error("Hubo un error al iniciar sesion", error.message)
            return false
        }
    }

    return (
        <AuthContext.Provider value={{ user, token, login }}>
            {children}
        </AuthContext.Provider>
    )

}