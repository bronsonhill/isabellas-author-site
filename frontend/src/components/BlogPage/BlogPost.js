import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import BlogPostContent from './BlogPostContent';
import { fetchBlogPost } from '../../services/firebase';
import './BlogPostContent.css';

/**
 * BlogPost component fetches and displays a single blog post
 * Uses URL parameters and location state for data retrieval
 */
const BlogPost = () => {
    const location = useLocation();
    const { id } = useParams();
    const [blog, setBlog] = useState(location.state?.blog || null);
    const [isLoading, setIsLoading] = useState(!location.state?.blog);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Only fetch if blog isn't already available from navigation state
        if (!blog) {
            setIsLoading(true);
            fetchBlogPost(id)
                .then(fetchedBlog => {
                    setBlog(fetchedBlog);
                    setIsLoading(false);
                })
                .catch(err => {
                    setError('Failed to load blog post. Please try again later.');
                    setIsLoading(false);
                });
        }
    }, [blog, id]);

    if (error) {
        return <div className="blog-error">{error}</div>;
    }

    if (isLoading) {
        return <div className="blog-loading">Loading...</div>;
    }

    return blog ? <BlogPostContent post={blog} /> : null;
};

export default BlogPost;