import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import { calculateReadTime } from '../../utils/textUtils';
import './BlogCard.css';

/**
 * BlogCard component displays a minimalist blog post preview with square image and centered text
 * 
 * @param {Object} props
 * @param {Object} props.blog - Blog post data containing id, title, date, imageUrl, and readTime
 * @param {Function} props.onCardClick - Handler for card click
 * @param {boolean} [props.shouldAnimate=true] - Whether the card should animate on scroll
 */
const BlogCard = ({ blog, onCardClick, shouldAnimate = true }) => {
    const [ref, isVisible] = useScrollAnimation(0.1);
    const contentRef = useRef(null);
    
    const visibilityClass = shouldAnimate ? (isVisible ? 'visible' : '') : 'visible';
    
    const formattedDate = new Date(blog.publishedDate || blog.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const handleCardClick = (e) => {
        e.preventDefault();
        onCardClick(e, blog);
    };
    
    return (
        <article 
            ref={shouldAnimate ? ref : undefined}
            className={`blog-card ${visibilityClass}`}
            onClick={handleCardClick}
            aria-label={`Blog post: ${blog.title}`}
        >
            <div className="blog-image">
                <img src={blog.imageUrl} alt={blog.title} />
            </div>
            <div className="blog-content" ref={contentRef}>
                <p className="blog-date">
                    {formattedDate} 
                    {blog.tag && <span className="blog-tag">{blog.tag}</span>} 
                    <span className="read-time">{calculateReadTime(blog.content)}</span>
                </p>
                <h2>{blog.title}</h2>
            </div>
        </article>
    );
};

BlogCard.propTypes = {
    blog: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        imageUrl: PropTypes.string.isRequired,
        // Either date or publishedDate must be present
        date: PropTypes.string,
        publishedDate: PropTypes.string,
        tag: PropTypes.string
    }).isRequired,
    onCardClick: PropTypes.func.isRequired,
    shouldAnimate: PropTypes.bool
};

export default BlogCard;