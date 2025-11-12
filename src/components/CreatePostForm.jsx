import React, { useState, useEffect, useContext} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext'; //
import { toast } from 'react-toastify';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { MultiSelect } from 'primereact/multiselect';
import { useNavigate, useParams } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import "../styles/CreatePostForm.css"

const validationSchema = Yup.object({
    title: Yup.string().required('El título es obligatorio'),
    content: Yup.string().required('El contenido es obligatorio'),
    categories: Yup.array().min(1, 'Debes seleccionar al menos una categoría')
})

export default function CreatePostForm() {
    const { token } = useContext(AuthContext)
    const navigate = useNavigate()

    const { postId } = useParams()
    const isEditMode = Boolean(postId)

    const [categories, setCategories] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const [initialValues, setInitialValues] = useState({
        title: '',
        content: '',
        categories: []
    })

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/category')

                if (!response.ok) {
                    throw new Error('No se pudieron cargar las categorías')
                }
                const data = await response.json()
                setCategories(data)
            } catch (error) {
                toast.error(error.message)
                console.error(error)
            }
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        if (isEditMode) {
            const fetchPostData = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/post/${postId}`)
                    if (!response.ok) {
                        throw new Error('No se pudo cargar el post')
                    }
                    const postData = await response.json()
                    setInitialValues({
                        title: postData.title,
                        content: postData.content,
                        categories: postData.categories_data.map(category => category.id)
                    })
                } catch (error) {
                    toast.error(error.message)
                    navigate('/posts')
                } finally {
                    setIsLoading(false)
                }
            }
            fetchPostData()
        } 
    }, [isEditMode, postId, navigate])
                

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        if (!token) {
            toast.error("Debes iniciar sesión para postear")
            setSubmitting(false)
            return
        }

        const url = isEditMode ? `http://localhost:5000/post/${postId}` : 'http://localhost:5000/post'
        const method = isEditMode ? 'PUT' : 'POST'

        try {
            const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify(values) 
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || errorData.message || 'Error al crear el post')
            }

            toast.success(isEditMode ? "Post actualizado" : "Post creado")
            setTimeout(() => navigate('/posts'), 2000) 
        } catch (error) {
            toast.error(error.message)
            console.error(error)
        }
        setSubmitting(false)
    }

    if (isLoading) {
        return (
            <div className='post-content-container' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ProgressSpinner />
            </div>
        )
    }

    return (
        <div className='post-content-container'>
            <div className="post-container">
                <h3>{isEditMode ? "Editar Post" : "Crear Post"}</h3>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ isSubmitting }) => (
                        <Form className="post-form">
                            <div className="form-field">
                                <label htmlFor="title">Título</label>
                                <Field as={InputText} id="title" name="title" className="w-full" />
                                <ErrorMessage name="title" component="small" className="p-error" />
                            </div>

                            <div className="form-field">
                                <label htmlFor="content">Contenido</label>
                                <Field as={InputTextarea} id="content" name="content" rows={5} className="w-full" />
                                <ErrorMessage name="content" component="small" className="p-error" />
                            </div>

                            <div className="form-field">
                                <label htmlFor="categories">Categorías</label>
                                <Field 
                                    as={MultiSelect}
                                    id="categories"
                                    name="categories"
                                    options={categories} 
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Selecciona categorías"
                                    className="w-full"
                                />
                                <ErrorMessage name="categories" component="small" className="p-error" />
                            </div>

                            <Button 
                                type="submit" 
                                className='post-button' 
                                label={isSubmitting ? "Guardando..." : (isEditMode ? "Guardar Cambios" : "Postear")}
                                disabled={isSubmitting} 
                            />
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}