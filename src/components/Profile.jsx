import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Componentes de PrimeReact
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'; 

export default function Profile() {
    const { user, token, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user || !token) {
            toast.error("Debes iniciar sesión para ver tu perfil.");
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/users/${user.sub}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'No se pudo cargar el perfil');
                }

                const data = await response.json();
                setProfileData(data); // Guarda {id, username, email, is_active}
            } catch (error) {
                toast.error(error.message);
                navigate('/'); // Ir al inicio si falla
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user, token, navigate]);

    const handleDeactivate = async () => {
        try {
            const response = await fetch(`http://localhost:5000/users/${user.sub}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'No se pudo desactivar la cuenta');
            }
            
            toast.success("Cuenta desactivada. Serás redirigido.");
            
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (error) {
            toast.error(error.message);
        }
    };

    const confirmDeactivation = () => {
        confirmDialog({
            message: '¿Estás seguro de que quieres desactivar tu cuenta? Esta acción es irreversible.',
            header: 'Confirmar Desactivación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, desactivar',
            rejectLabel: 'No, cancelar',
            acceptClassName: 'p-button-danger',
            accept: handleDeactivate, 
        });
    };

    if (isLoading) {
        return <ProgressSpinner style={{ width: '50px', height: '50px', display: 'block', margin: 'auto' }} />;
    }

    if (!profileData) {
        return <h2 style={{ textAlign: 'center' }}>No se pudo cargar el perfil.</h2>;
    }

    const cardFooter = (
        <div style={{ marginTop: '2rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
            {user && user.role === 'admin' && (
                <Button 
                    label="Desactivar esta cuenta" 
                    icon="pi pi-exclamation-triangle" 
                    severity="danger" // Botón rojo
                    onClick={confirmDeactivation} 
                />
            )}
        </div>
    );

    return (
        <div className="profile-page">
            <ConfirmDialog /> 
            <Card title={`Perfil de ${profileData.username}`} footer={cardFooter}>
                <div className="profile-details">
                    <p><strong>ID de Usuario:</strong> {profileData.id}</p>
                    <p><strong>Nombre de Usuario:</strong> {profileData.username}</p>
                    <p><strong>Email:</strong> {profileData.email}</p>
                    <p><strong>Rol:</strong> {user.role}</p> 
                    <p><strong>Estado:</strong> {profileData.is_active ? 
                        <span style={{ color: 'green' }}>Activo</span> : 
                        <span style={{ color: 'red' }}>Inactivo</span>
                    }</p>
                </div>
            </Card>
        </div>
    );
}