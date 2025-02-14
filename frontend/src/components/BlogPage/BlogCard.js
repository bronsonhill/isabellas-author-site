import React from 'react';
import PropTypes from 'prop-types';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './BlogCard.css';

/**
 * BlogCard component displays a blog post preview with animation
 * 
 * @param {Object} props
 * @param {Object} props.blog - Blog post data containing id, title, date, excerpt, imageUrl, and readTime
 * @param {Function} props.onCardClick - Handler for card click
 * @param {Function} props.onReadMore - Handler for read more button click
 * @param {boolean} [props.shouldAnimate=true] - Whether the card should animate on scroll
 */
const BlogCard = ({ blog, onCardClick, onReadMore, shouldAnimate = true }) => {
    const [ref, isVisible] = useScrollAnimation(0.1);
    
    const animationClass = shouldAnimate ? 'scroll-animation interactive' : '';
    const visibilityClass = shouldAnimate ? (isVisible ? 'visible' : '') : 'visible';

    const formattedDate = new Date(blog.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return (
        <article 
            ref={shouldAnimate ? ref : undefined}
            className={`blog-card ${animationClass} ${visibilityClass}`}
            onClick={(e) => onCardClick(e, blog.id)}
        >
            <div className="blog-image">
                <img src={blog.imageUrl} alt={blog.title} />
            </div>
            <div className="blog-content">
                <h2>{blog.title}</h2>
                <p className="blog-date">{formattedDate} • {blog.readTime}</p>
                <p className="blog-excerpt">{blog.excerpt}</p>
                <button 
                    className="read-more" 
                    onClick={(e) => onReadMore(e, blog.id)}
                >
                    Read More
                </button>
            </div>
        </article>
    );
};

BlogCard.propTypes = {
    blog: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        excerpt: PropTypes.string.isRequired,
        imageUrl: PropTypes.string.isRequired,
        readTime: PropTypes.string.isRequired
    }).isRequired,
    onCardClick: PropTypes.func.isRequired,
    onReadMore: PropTypes.func.isRequired,
    shouldAnimate: PropTypes.bool
};

export default BlogCard;