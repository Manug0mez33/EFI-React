import React, { useContext } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import { Password } from 'primereact/password'
import "../styles/LoginForm.css"



const validationSchema = Yup.object({
    email: Yup.string().email("Email invalido").required('El email es obligatorio'),
    password: Yup.string().required('La contraseña es obligatoria')
})


export default function LoginForm() {
    const navigate = useNavigate()
    const { login } = useContext(AuthContext)

    const handleSubmit = async (values, { setSubmitting, setFieldValue, resetForm}) => {
        const success = await login(values.email, values.password)
        if (success) {
            resetForm()
            setTimeout(() => navigate('/posts'))   
        } else {
            setFieldValue('password', '')
        }
        setSubmitting(false)
    }

    return (
        <div className='login-container'>
            <h2>Iniciar Sesion</h2>
            <Formik
                initialValues={{ email: '', password: ''}}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className='login-form'>
                        <div className='form-field'>
                            <label>Email</label>
                            <Field as={InputText} id='email' name='email' />
                            <ErrorMessage name='email' component='small' className='error' />
                        </div>
                        <div className='form-field'>
                            <label>Contraseña</label>
                            <Field as={Password} id='password' name='password' className='w-full' inputClassName='w-full' feedback={false} toggleMask/>
                            <ErrorMessage name='password' component='small' className='error' />
                        </div>
                        <Button type='submit' label={isSubmitting ? "Ingresando..." : 'Ingresar'} disabled={isSubmitting} />
                    </Form>
                )}
            </Formik>
        </div>
    )
}