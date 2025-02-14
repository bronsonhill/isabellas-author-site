import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchBlogPost } from '../../services/firebase';
import BlogPostContent from './BlogPostContent';

const BlogPost = () => {
    const { id } = useParams();
    const [blogPost, setBlogPost] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogPostData = async () => {
            try {
                const data = await fetchBlogPost(id);
                setBlogPost(data);
            } catch (error) {
                console.error("Error fetching blog post:", error);
                setError("Failed to load blog post");
            }
        };

        fetchBlogPostData();
    }, [id]);

    if (error) {
        return <div className="blog-error">{error}</div>;
    }

    if (!blogPost) {
        return <div className="blog-loading">Loading...</div>;
    }

    return <BlogPostContent post={blogPost} />;
};

export default BlogPost;