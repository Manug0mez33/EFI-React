import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { Dropdown } from 'primereact/dropdown'
import { Password } from 'primereact/password'
import "../styles/RegisterForm.css"

const validationSchema = Yup.object({
    username: Yup.string().required("El nombre es obligatorio"),
    email: Yup.string().email("Email invalido").required('El email es obligatorio'),
    password: Yup.string().required('La contraseña es obligatoria')
})


export default function RegisterForm() {

    const navigate = useNavigate()

    const handleSubmit = async (values, { resetForm }) => {
        try {
            const response = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            })

            if (response.ok) {
                toast.success("Usuario registrado con exito")
                resetForm()
                setTimeout(() => navigate('/posts'), 2000)
            } else {
                toast.error("Hubo un erro al registrar el usuario")
            }
        } catch (error) {
            toast.error("hubo un error con el servidor", error)
        }
    }

    const roles = [
        { label: 'Usuario', value: 'user' },
        { label: 'Administrador', value: 'admin' },
        { label: 'Moderador', value: 'moderator' }
    ]

    return (
        <div className='register-container'>
            <h2>Crear cuenta</h2>
            <Formik
                initialValues={{ username: '', email: '', password: '', role: 'user' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className='register-form'>
                        <div className='form-field'>
                            <label>Nombre de usuario</label>
                            <Field as={InputText} id='username' name='username' />
                            <ErrorMessage name='username' component='small' className='error' />
                        </div>
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
                        <div className='form-field'>
                            <label>Rol</label>
                            <Field as={Dropdown} id='role' name='role' options={roles} optionLabel='label' optionValue='value'/>
                            <ErrorMessage name='role' component='small' className='error' />
                        </div>
                        <Button type='submit' className='register-button' label={isSubmitting ? "Registrando..." : 'Registrarse'} />
                    </Form>
                )}
            </Formik>
        </div>
    )
}