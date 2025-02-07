import React from 'react';
import BlogList from '../components/BlogPage/BlogList';
import './page.css';
import './Blog.css';

const Blog = () => {
    return (
        <div className="blog-page-container">
            <main>
                <h1 className="blog-page-heading">
                    Latest Blogs
                </h1>
                <BlogList />
            </main>
        </div>
    );
};

export default Blog;
