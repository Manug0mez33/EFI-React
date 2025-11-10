import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'; 
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';

const roleOptions = [
    { label: 'Usuario', value: 'user' },
    { label: 'Administrador', value: 'admin' },
    { label: 'Moderador', value: 'moderator' }
]

const roleTag = (role) => {
    switch (role) {
        case 'admin':
            return <Tag severity="danger" value="Administrador" />
        case 'moderator':
            return <Tag severity="warning" value="Moderador" />
        default:
            return <Tag severity="info" value="Usuario" />
    }
}


export default function Profile() {
    const { user, token } = useContext(AuthContext)
    const navigate = useNavigate()
    const { id: urlParamId } = useParams()

    const [profileData, setProfileData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const [selectedRole, setSelectedRole] = useState(null)

    useEffect(() => {
        if (!user || !token) {
            toast.error("Debes iniciar sesión para ver tu perfil.")
            navigate('/login')
            return
        }

        const profileIdToFetch = urlParamId || user.sub;

        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/users/${profileIdToFetch}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    const err = await response.json()
                    throw new Error(err.error || 'No se pudo cargar el perfil')
                }

                const data = await response.json()
                setProfileData(data); 

                setSelectedRole(data.role);

            } catch (error) {
                toast.error(error.message)
                navigate('/')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfile()
    }, [user, token, navigate, urlParamId])

    const handleRoleChange = async (e) => {
        const newRole = e.value
        setSelectedRole(newRole)

        const profileIdToUpdate = urlParamId || user.sub

        try {
            const response = await fetch(`http://localhost:5000/users/${profileIdToUpdate}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole }) 
            });

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || 'No se pudo actualizar el rol')
            }

            toast.success("Rol actualizado con éxito")
            setProfileData(prev => ({ ...prev, role: newRole }))

        } catch (error) {
            toast.error(error.message)
            setSelectedRole(profileData.role)
        }
    };

    if (isLoading) {
        return <ProgressSpinner style={{ width: '50px', height: '50px', display: 'block', margin: 'auto' }} />
    }

    if (!profileData) {
        return <h2 style={{ textAlign: 'center' }}>No se pudo cargar el perfil.</h2>
    }

    const handleToggleStatus = async (newStatus) => {
        const profileIdToToggle = urlParamId || user.sub

        try {
            const response = await fetch(`http://localhost:5000/users/${profileIdToToggle}/status`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ is_active: newStatus })
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || 'No se pudo cambiar el estado de la cuenta')
            }
            
            const successMessage = newStatus ? 'Cuenta activada con éxito' : 'Cuenta desactivada con éxito'
            toast.success(successMessage)

            setProfileData(prev => ({ ...prev, is_active: newStatus }))
        
            if (newStatus === false && profileIdToToggle === user.sub) {
                setTimeout(() => {
                    logout()
                    navigate('/')
                }, 2000)
            }

        } catch (error) {
            toast.error(error.message)
        }
    };

    const confirmToggleStatus = () => {
        const currentlyActive = profileData.is_active

        const message = currentlyActive ? 'Seguro que quieres desactivar esta cuenta?' : 'Seguro que quieres activar esta cuenta?'
        const header = currentlyActive ? 'Desactivar Cuenta' : 'Activar Cuenta'
        const acceptLabel = currentlyActive ? 'Desactivar' : 'Activar'

        confirmDialog({
            message,
            header,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel,
            rejectLabel: 'Cancelar',
            acceptClassName: currentlyActive ? 'p-button-danger' : 'p-button-success',
            accept: () => {
                handleToggleStatus(!currentlyActive)
            }
        })

    }

    const title = urlParamId
        ? `Perfil de: ${profileData.username}` 
        : `Mi Perfil: ${profileData.username}`

    const cardFooter = (
        <div style={{ marginTop: '2rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
            {user && user.role === 'admin' && (
                <Button 
                    label={profileData.is_active ? "Desactivar Cuenta" : "Activar Cuenta"} 
                    icon={profileData.is_active ? "pi pi-times-circle" : "pi pi-check-circle"} 
                    severity={profileData.is_active ? "danger" : "success"}
                    onClick={confirmToggleStatus}
                />
            )}
        </div>
    );



    return (
        <div className="profile-page">
            <ConfirmDialog /> 
            <Card title={title} footer={cardFooter}>
                <div className="profile-details">
                    <p><strong>ID de Usuario:</strong> {profileData.id}</p>
                    <p><strong>Nombre de Usuario:</strong> {profileData.username}</p>
                    <p><strong>Email:</strong> {profileData.email}</p>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <strong style={{ marginRight: '1rem' }}>Rol:</strong>
                        {user && user.role === 'admin' ? (
                            <Dropdown 
                                value={selectedRole}
                                options={roleOptions}
                                onChange={handleRoleChange} 
                                optionLabel="label"
                                optionValue="value"
                            />
                        ) : (
                            roleTag(profileData.role)
                        )}
                    </div>
                    
                    <p><strong>Estado:</strong> {profileData.is_active ? 
                        <span style={{ color: 'green' }}>Activo</span> : 
                        <span style={{ color: 'red' }}>Inactivo</span>
                    }</p>
                </div>
            </Card>
        </div>
    )
}