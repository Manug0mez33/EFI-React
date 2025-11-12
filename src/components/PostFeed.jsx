import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';        
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const CommentForm = ({ postId, token, onCommentAdded }) => {
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const response = await fetch(
                `http://localhost:5000/post/${postId}/comments`, //
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ content: values.content })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al comentar');
            }

            toast.success("Comentario añadido");
            resetForm();
            onCommentAdded(); 
        } catch (error) {
            toast.error(error.message);
            console.error(error);
        }
        setSubmitting(false);
    };

    return (
        <Formik
            initialValues={{ content: '' }}
            validationSchema={Yup.object({ content: Yup.string().required('El comentario no puede estar vacío') })}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting }) => (
                <Form style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <Field 
                        as={InputTextarea} 
                        name="content" 
                        placeholder="Escribe un comentario..." 
                        rows={1} 
                        autoResize
                        style={{ flex: 1 }}
                    />
                    <Button type="submit" label="Comentar" className='send-comment-button' disabled={isSubmitting} />
                </Form>
            )}
        </Formik>
    );
};


export default function PostFeed() {
    const { user, token } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    const [editingId, setEditingId] = useState(null)
    const [editContent, setEditContent] =useState('')

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:5000/post');
            if (!response.ok) {
                if (response.status === 429) {
                    toast.error("Demasiados intentos.");
                }
                throw new Error('Error al cargar posts');
            }
            
            const postData = await response.json(); 

            setPosts(postData.posts);
        
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDeletePost = async (postId) => {
        try {
            const response = await fetch(`http://localhost:5000/post/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('No se pudo eliminar el post');
            toast.success('Post eliminado');
            fetchPosts(); // Recarga todos los posts
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await fetch(`http://localhost:5000/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('No se pudo eliminar el comentario');
            toast.success('Comentario eliminado');
            fetchPosts(); // Recarga los posts para actualizar la lista de comentarios
        } catch (error) {
            toast.error(error.message);
        }
    };

    const confirmDeletePost = (postId) => {
        confirmDialog({
            message: '¿Estás seguro de que quieres eliminar este post?',
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            acceptClassName: 'p-button-danger',
            accept: () => handleDeletePost(postId)
        });
    };

    const confirmDeleteComment = (commentId) => {
        confirmDialog({
            message: '¿Estás seguro de que quieres eliminar este comentario?',
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            acceptClassName: 'p-button-danger',
            accept: () => handleDeleteComment(commentId)
        });
    };

    return (
        <div className="post-feed">
            <ConfirmDialog />

            {posts.map((post) => (
                <Card 
                    className="post-card" 
                    key={post.id} 
                    title={post.title} 
                    subTitle={`Por: ${post.user.username} - ${new Date(post.date_created).toLocaleDateString()}`}
                >
                    <p>{post.content}</p>
                    
                    <div className="categories-tags" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {post.categories_data && post.categories_data.map((category) => (
                            <Tag 
                                key={category.id} 
                                value={category.name} 
                                severity="warning"
                                className='category-tag'
                            />
                        ))}
                    </div>

                    {user && user.role === 'admin' && (
                        <Button
                            label="Eliminar Post"
                            icon="pi pi-trash"
                            className="p-button-danger p-button-sm"
                            style={{ marginTop: '1rem', display: 'block' }}
                            onClick={() => confirmDeletePost(post.id)}
                        />
                    )}

                    <div className="comments-section">
                        <h5>Comentarios:</h5>
                        {post.comments && post.comments.length > 0 ? (
                            post.comments.map((comment) => (
                                <div 
                                    key={comment.id} 
                                    style={{ 
                                        borderBottom: '1px solid #eee', 
                                        padding: '0.5rem 0', 
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'    
                                    }}>
                                    <strong>{comment.user.username}:</strong>
                                    <p style={{ margin: 0 }}>{comment.content}</p>

                                    {user && (user.role === 'admin' || user.role === 'moderator') && (
                                        <Button
                                            icon="pi pi-trash"
                                            className="p-button-danger p-button-text p-button-sm"
                                            onClick={() => confirmDeleteComment(comment.id)}
                                            tooltip="Eliminar comentario"
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No hay comentarios. ¡Sé el primero!</p>
                        )}
                        
                        {user && token && (
                            <CommentForm 
                                postId={post.id} 
                                token={token} 
                                onCommentAdded={fetchPosts} 
                            />
                        )}

                        {!user && !token && (
                            <div>
                                <p>Inicia sesion para dejar un comentario.</p>
                                <Button label='Iniciar sesion' className='extra-button' onClick={() => navigate('/login')} icon='pi pi-sign-in'/>
                            </div>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
}