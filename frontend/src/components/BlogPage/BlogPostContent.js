import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { calculateReadTime } from '../../utils/textUtils';
import './BlogPostContent.css';

/**
 * Renders a single blog post with markdown-formatted content
 * 
 * @param {Object} props
 * @param {Object} props.post - Blog post data to display
 */
const BlogPostContent = ({ post }) => {
    const formattedDate = new Date(post.publishedDate || post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <article className="blog-post">
            <header className="blog-header">
                <h1>{post.title}</h1>
                <p className="blog-date">
                    {formattedDate}
                    {post.tag && <span className="blog-tag">{post.tag}</span>}
                    <span className="read-time">{calculateReadTime(post.content)}</span>
                </p>
            </header>
            
            {post.imageUrl && (
                <div className="blog-post-image">
                    <img src={post.imageUrl} alt={post.title} />
                </div>
            )}
            
            <div className="blog-post-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content}
                </ReactMarkdown>
            </div>
        </article>
    );
};

BlogPostContent.propTypes = {
    post: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        date: PropTypes.string,
        publishedDate: PropTypes.string,
        imageUrl: PropTypes.string,
        content: PropTypes.string.isRequired,
        tag: PropTypes.string
    }).isRequired
};

export default BlogPostContent;