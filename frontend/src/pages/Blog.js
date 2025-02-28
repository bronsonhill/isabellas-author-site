import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BlogList from '../components/BlogPage/BlogList';
import BlogPostEditor from '../components/BlogPage/BlogPostEditor';
import AdminControls from '../components/common/AdminControls';
import './page.css';
import './Blog.css';

const Blog = () => {
    const { isAdmin } = useAuth();
    const [showEditor, setShowEditor] = useState(false);
    const [postToEdit, setPostToEdit] = useState(null);

    const handleCreateNew = () => {
        setPostToEdit(null);
        setShowEditor(true);
    };

    const handleEdit = (post) => {
        setPostToEdit(post);
        setShowEditor(true);
    };

    const handleClose = () => {
        setShowEditor(false);
        setPostToEdit(null);
    };

    const handleSave = () => {
        setShowEditor(false);
        setPostToEdit(null);
        // Refresh the blog list 
        // The BlogList component handles its own data fetching
    };

    return (
        <div className="blog-page-container">
            <main>
                <div className="blog-page-header">
                    <h1 className="blog-page-heading">Latest Blogs</h1>
                    {isAdmin && (
                        <button className="create-blog-btn" onClick={handleCreateNew}>
                            Create New Post
                        </button>
                    )}
                </div>
                
                {showEditor ? (
                    <BlogPostEditor 
                        postToEdit={postToEdit}
                        onClose={handleClose}
                        onSave={handleSave}
                    />
                ) : (
                    <BlogList onEditPost={isAdmin ? handleEdit : undefined} />
                )}
            </main>
        </div>
    );
};

export default Blog;
