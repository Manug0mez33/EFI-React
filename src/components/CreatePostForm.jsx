import React, { useState, useEffect, useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext'; //
import { toast } from 'react-toastify';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { MultiSelect } from 'primereact/multiselect';
import "../styles/CreatePostForm.css"

const validationSchema = Yup.object({
    title: Yup.string().required('El título es obligatorio'),
    content: Yup.string().required('El contenido es obligatorio'),
    categories: Yup.array().min(1, 'Debes seleccionar al menos una categoría')
});

export default function CreatePostForm() {
    const { token } = useContext(AuthContext);

    const [categories, setCategories] = useState([]);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/category');

                if (!response.ok) {
                    throw new Error('No se pudieron cargar las categorías');
                }

                const data = await response.json();
                setCategories(data);
            } catch (error) {
                toast.error(error.message);
                console.error(error);
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        if (!token) {
            toast.error("Debes iniciar sesión para postear");
            setSubmitting(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/post', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify(values) 
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Error al crear el post');
            }

            toast.success("Post creado con éxito");
            resetForm();
            window.location.reload();
        } catch (error) {
            toast.error(error.message);
            console.error(error);
        }
        setSubmitting(false);
    };

    return (
        <div className="post-container">
            <h3>Crear un nuevo post</h3>
            <Formik
                initialValues={{ title: '', content: '', categories: [] }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
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

                        <Button type="submit" label={isSubmitting ? "Posteando..." : "Postear"} disabled={isSubmitting} />
                    </Form>
                )}
            </Formik>
        </div>
    );
}