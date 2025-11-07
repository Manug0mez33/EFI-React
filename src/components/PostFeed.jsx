import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

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
                    <Button type="submit" label="Comentar" disabled={isSubmitting} />
                </Form>
            )}
        </Formik>
    );
};


export default function PostFeed() {
    const { user, token } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:5000/post');
            if (!response.ok) throw new Error('Error al cargar posts');
            
            const postData = await response.json(); 

            const postsWithComments = await Promise.all(
                postData.posts.map(async (post) => {
                    const commentsResponse = await fetch(`http://localhost:5000/post/${post.id}/comments`);
                    if (!commentsResponse.ok) throw new Error(`Error al cargar comentarios para el post ${post.id}`);
                    
                    const commentsData = await commentsResponse.json();
                    return { ...post, comments: commentsData };
                })
            );
            setPosts(postsWithComments.reverse()); 
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="post-feed">
            {posts.map((post) => (
                <Card 
                    key={post.id} 
                    title={post.title} 
                    subTitle={`Por: ${post.user.username} - ${new Date(post.date_created).toLocaleDateString()}`}
                    style={{ marginBottom: '2rem' }}
                >
                    <p>{post.content}</p>
                    
                    <div className="comments-section" style={{ marginTop: '1.5rem' }}>
                        <h5>Comentarios:</h5>
                        {post.comments && post.comments.length > 0 ? (
                            post.comments.map((comment) => (
                                <div key={comment.id} style={{ borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
                                    <strong>{comment.user.username}:</strong>
                                    <p style={{ margin: 0 }}>{comment.content}</p>
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
                    </div>
                </Card>
            ))}
        </div>
    );
}