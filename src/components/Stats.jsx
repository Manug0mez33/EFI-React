import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import 'primeflex/primeflex.css';

export default function Stats() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        if (!token) {
            setIsLoading(false);
            toast.error("Acceso denegado. No estás autenticado.");
            return;
        }

        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:5000/stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'No se pudieron cargar las estadísticas');
                }
                
                const data = await response.json();
                setStats(data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [token]); 

    if (isLoading) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <ProgressSpinner />
            </div>
        );
    }

    if (!stats) {
        return (
            <Card title="Error">
                <p>No se pudieron cargar las estadísticas. Es posible que no tengas los permisos de Administrador o Moderador.</p>
            </Card>
        );
    }

    return (
        <div className="p-4">
            <Card title="Panel de Estadísticas" className="mb-4">
                <div className="grid">
                    
                    <div className="col-12 md:col-6 lg:col-3">
                        <Card title="Total de Usuarios" className="text-center shadow-1">
                            <h1 className="m-0 text-primary">{stats.total_users}</h1>
                        </Card>
                    </div>

                    <div className="col-12 md:col-6 lg:col-3">
                        <Card title="Total de Posts" className="text-center shadow-1">
                            <h1 className="m-0 text-primary">{stats.total_posts}</h1>
                        </Card>
                    </div>

                    <div className="col-12 md:col-6 lg:col-3">
                        <Card title="Total de Comentarios" className="text-center shadow-1">
                            <h1 className="m-0 text-primary">{stats.total_comments}</h1>
                        </Card>
                    </div>

                    <div className="col-12 md:col-6 lg:col-3">
                        <Card title="Posts (Últimos 7 días)" className="text-center shadow-1">
                            <h1 className="m-0 text-primary">{stats.posts_last_week}</h1>
                        </Card>
                    </div>
                    
                </div>
            </Card>
        </div>
    );
}