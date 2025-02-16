import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './BlogCard.css';

/**
 * BlogCard component displays a blog post preview with animation
 * 
 * @param {Object} props
 * @param {Object} props.blog - Blog post data containing id, title, date, content, imageUrl, and readTime
 * @param {Function} props.onCardClick - Handler for card click
 * @param {Function} props.onReadMore - Handler for read more button click
 * @param {boolean} [props.shouldAnimate=true] - Whether the card should animate on scroll
 */
const BlogCard = ({ blog, onCardClick, onReadMore, shouldAnimate = true }) => {
    const [ref, isVisible] = useScrollAnimation(0.1);
    const [excerptLength, setExcerptLength] = useState(200);
    const contentRef = useRef(null);
    const charWidthRef = useRef(null);

    const visibilityClass = shouldAnimate ? (isVisible ? 'visible' : '') : 'visible';

    const formattedDate = new Date(blog.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        if (contentRef.current && charWidthRef.current) {
            const availableWidth = contentRef.current.clientWidth;
            const charWidth = charWidthRef.current.clientWidth;
            const calculatedLength = Math.floor(availableWidth / charWidth);
            setExcerptLength(calculatedLength);
        }
    }, [contentRef.current, charWidthRef.current]);

    const excerpt = blog.content.length > excerptLength ? blog.content.substring(0, excerptLength) + '...' : blog.content;
    
    return (
        <article 
            ref={shouldAnimate ? ref : undefined}
            className={`blog-card ${visibilityClass}`}
            onClick={(e) => {
                e.preventDefault();
                onCardClick(e, blog);
            }}
        >
            <div className="blog-image">
                <img src={blog.imageUrl} alt={blog.title} />
            </div>
            <div className="blog-content" ref={contentRef}>
                <h2>{blog.title}</h2>
                <p className="blog-date">{formattedDate} • {blog.readTime}</p>
                <p className="blog-excerpt">{excerpt}</p>
                <button 
                    className="read-more" 
                    onClick={(e) => {
                        e.preventDefault();
                        onReadMore(e, blog);
                    }}
                >
                    Read More
                </button>
            </div>
            <div ref={charWidthRef} style={{ visibility: 'hidden', position: 'absolute', whiteSpace: 'nowrap' }}>a</div>
        </article>
    );
};

BlogCard.propTypes = {
    blog: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        imageUrl: PropTypes.string.isRequired,
        readTime: PropTypes.string.isRequired
    }).isRequired,
    onCardClick: PropTypes.func.isRequired,
    onReadMore: PropTypes.func.isRequired,
    shouldAnimate: PropTypes.bool
};

export default BlogCard;