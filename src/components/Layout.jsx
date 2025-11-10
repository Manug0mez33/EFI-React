import React, { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { AuthContext } from '../context/AuthContext';
import { Button } from 'primereact/button';
import '../styles/Layout.css'

export default function Layout() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const guestItems = [
        {
            label: 'Registrarse',
            icon: 'pi pi-fw pi-user-plus',
            command: () => navigate('/register')
        },
        {
            label: 'Iniciar Sesión',
            icon: 'pi pi-fw pi-sign-in',
            command: () => navigate('/login')
        }
    ];

    const userItems = [
        {
            label: 'Mi Perfil',
            icon: 'pi pi-fw pi-user',
            command: () => navigate('/profile') 
        },

        {
            label: 'Crear Post',
            icon: 'pi pi-fw pi-plus',
            command: () => navigate('/post')
        }
    ];

        if (user && user.role === 'admin') {
        userItems.push({
            label: 'Usuarios',
            icon: 'pi pi-fw pi-users',
            command: () => navigate('/users')
        });
    }
    
        if (user && (user.role === 'admin' || user.role === 'moderator')) {
            userItems.push({
                label: 'Categorías',
                icon: 'pi pi-fw pi-list',
                command: () => navigate('/category')
            });
        }


    const items = [
        {
            label: 'Inicio',
            icon: 'pi pi-home',
            command: () => navigate('/posts')
        },
        ...(user ? userItems : guestItems)
    ];


    const end = user ? (
        <Button 
            label="Cerrar Sesión" 
            icon="pi pi-sign-out" 
            className="p-button-text" 
            onClick={() => {
                logout();
                navigate('/');
            }} 
        />
    ) : null;

    return (
        <div>
            <Menubar model={items} end={end} />
            <div className="content-container">
                <Outlet />
            </div>
        </div>
    );
}