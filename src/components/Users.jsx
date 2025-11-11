import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

export default function Users() {
    const { user, token } = useContext(AuthContext);
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            toast.error("Acceso denegado. Solo para administradores.");
            navigate('/');
            return;
        }

        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:5000/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'No se pudo cargar la lista de usuarios');
                }

                const data = await response.json();
                setUsers(data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [user, token, navigate]);

    const userIsActive = (status) => {
        const severity = status.is_active ? 'success' : 'danger';
        const value = status.is_active ? 'Activo' : 'Inactivo';
        return <Tag severity={severity} value={value} />;
    };
    
    const created_at = (date) => {
        if (!date) return 'N/A';

        const newDate = new Date(date);
        return newDate.toLocaleString();
    };

    const actions = (data) => {
        const confirmDelete = () => {
            toast.warn(`Logica`)
    };
        return (
            <div className="actions">
                <Button
                    label=''
                    icon='pi pi-pencil'
                    className='p-button-sm p-button-info'
                    onClick={() => navigate(`/profile/${data.id}`)}
                />
            </div>
        );
}

    if (isLoading) {
        return <ProgressSpinner style={{ width: '50px', height: '50px', display: 'block', margin: 'auto' }} />;
    }

    if (!user || user.role !== 'admin') {
        return <h2 style={{ textAlign: 'center' }}>Acceso Denegado</h2>;
    }

    return (
        <div className="users-list-page">
            <Card title="Panel de Administración de Usuarios" className='users-list-content'>
                <DataTable value={users} scrollable scrollHeight="600px" className='users-table'>
                    <Column field="id" header="ID" sortable />
                    <Column field="username" header="Usuario" sortable />
                    <Column field="email" header="Email" />
                    <Column 
                        field="is_active" 
                        header="Estado" 
                        body={userIsActive} 
                    />
                    <Column field="role" header="Rol" sortable />
                    <Column 
                        field="created_at" 
                        header="Fecha de Creación" 
                        body={created_at} 
                        sortable 
                    />
                    <Column
                        header="Acciones"
                        body={actions}
                    />
                </DataTable>
            </Card>
        </div>
    );
}