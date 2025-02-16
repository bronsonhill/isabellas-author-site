import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import BlogPostContent from './BlogPostContent';
import { fetchBlogPost } from '../../services/firebase';

const BlogPost = () => {
    const location = useLocation();
    const { id } = useParams();
    const [blog, setBlog] = useState(location.state?.blog || null);
    console.log('Blog post ID:', id);

    useEffect(() => {
        if (!blog) {
            fetchBlogPost(id).then(fetchedBlog => {
                setBlog(fetchedBlog);
                console.log('Blog post:', fetchedBlog);
            });
        } else {
            console.log('Blog post:', blog);
        }
    }, [blog, id]);

    if (!blog) {
        return <div>Loading...</div>;
    }

    return <BlogPostContent post={blog} />;
};

export default BlogPost;