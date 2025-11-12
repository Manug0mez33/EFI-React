import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';

const validationSchema = Yup.object({
    name: Yup.string().required('El nombre es obligatorio')
})

export default function CategoryManager() {
    const { user, token } = useContext(AuthContext)
    const navigate = useNavigate()

    const [categories, setCategories] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [editDialog, setEditDialog] = useState(false)
    const [currentCategory, setCurrentCategory] = useState(null)

    const fetchCategories = async () => {
        if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
            toast.error("Acceso denegado.")
            navigate('/posts')
            return
        }

        try {
            const response = await fetch('http://localhost:5000/category')
            if (!response.ok) throw new Error('No se pudieron cargar las categorías')
            const data = await response.json()
            setCategories(data)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    };

    useEffect(() => {
        fetchCategories()
    }, [user, navigate])

    const handleCreate = async (values, { setSubmitting, resetForm }) => {
        try {
            const response = await fetch('http://localhost:5000/category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(values)
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'Error al crear')

            toast.success("Categoría creada")
            setCategories(prev => [...prev, data])
            resetForm()
        } catch (error) {
            toast.error(error.message)
        }
        setSubmitting(false)
    }

    const openEditDialog = (category) => {
        setCurrentCategory(category)
        setEditDialog(true)
    }

    const handleEdit = async (values, { setSubmitting }) => {
        try {
            const response = await fetch(`http://localhost:5000/category/${currentCategory.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(values)
            })
            if (!response.ok) throw new Error('Error al actualizar')

            toast.success("Categoría actualizada")
            setEditDialog(false)
            fetchCategories()
        } catch (error) {
            toast.error(error.message)
        }
        setSubmitting(false)
    }

    const confirmDelete = (category) => {
        if (user.role !== 'admin') {
            toast.error("Solo los administradores pueden eliminar categorías.")
            return
        }

        confirmDialog({
            message: `¿Seguro que quieres eliminar "${category.name}"? (Se ocultará)`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            acceptClassName: 'p-button-danger',
            accept: () => handleDelete(category.id),
        })
    }

    const handleDelete = async (categoryId) => {
        try {
            const response = await fetch(`http://localhost:5000/category/${categoryId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!response.ok) throw new Error('Error al eliminar')

            toast.success("Categoría eliminada (ocultada)")
            fetchCategories()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button icon="pi pi-pencil" className="p-button-sm p-button-info button-edit" onClick={() => openEditDialog(rowData)} />
                {user.role === 'admin' && ( 
                    <Button icon="pi pi-trash" className="p-button-sm p-button-danger button-delete" onClick={() => confirmDelete(rowData)} />
                )}
            </div>
        );
    };

    if (isLoading) return <ProgressSpinner style={{ width: '50px', height: '50px', display: 'block', margin: 'auto' }} />
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) return null

    return (
        <div className="category-manager" style={{ display: 'flex', gap: '2rem', padding: '1rem' }}>
            <ConfirmDialog />
            
            <Card className="create-category" title="Crear Nueva Categoría" style={{ flex: 1, height: 'fit-content' }}>
                <Formik initialValues={{ name: '' }} validationSchema={validationSchema} onSubmit={handleCreate}>
                    {({ isSubmitting }) => (
                        <Form>
                            <div className="form-field" style={{ marginBottom: '1rem' }}>
                                <label htmlFor="name">Nombre</label>
                                <Field as={InputText} id="name" name="name" className="w-full" />
                                <ErrorMessage name="name" component="small" className="p-error" />
                            </div>
                            <Button type="submit" className='create-button' label={isSubmitting ? "Creando..." : "Crear"} disabled={isSubmitting} />
                        </Form>
                    )}
                </Formik>
            </Card>

            <Card className="category-list" title="Categorías Existentes" style={{ flex: 2 }}>
                <DataTable 
                    value={categories} 
                    scrollable 
                    scrollHeight="700px"
                    className='category-table'
                >
                    <Column field="id" header="ID" sortable />
                    <Column field="name" header="Nombre" sortable />
                    <Column header="Acciones" body={actionBodyTemplate} />
                </DataTable>
            </Card>

            <Dialog header="Editar Categoría" visible={editDialog} style={{ width: '30vw' }} onHide={() => setEditDialog(false)} footer={null}>
                {currentCategory && (
                    <Formik
                        initialValues={{ name: currentCategory.name }}
                        validationSchema={validationSchema}
                        onSubmit={handleEdit}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="form-field" style={{ marginBottom: '1rem' }}>
                                    <label htmlFor="edit_name">Nombre</label>
                                    <Field as={InputText} id="edit_name" name="name" className="w-full" />
                                    <ErrorMessage name="name" component="small" className="p-error" />
                                </div>
                                <Button className='edit-button' type="submit" label={isSubmitting ? "Guardando..." : "Guardar Cambios"} />
                            </Form>
                        )}
                    </Formik>
                )}
            </Dialog>
        </div>
    );
}