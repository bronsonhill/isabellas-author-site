import React from 'react';
import PropTypes from 'prop-types';
import './BlogPostContent.css';

const BlogPostContent = ({ post }) => {
    // Remove the items array access since we'll receive the post directly
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <article className="blog-post">
            <header className="blog-header">
                <h1>{post.title}</h1>
                <p className="blog-date">{formattedDate}</p>
            </header>
            {post.imageUrl && (
                <div className="blog-post-image">
                    <img src={post.imageUrl} alt={post.title} />
                </div>
            )}
            <div className="blog-post-content">
                <p>{post.content}</p>
            </div>
        </article>
    );
};

BlogPostContent.propTypes = {
    post: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        imageUrl: PropTypes.string,
        content: PropTypes.string.isRequired
    }).isRequired
};

export default BlogPostContent;