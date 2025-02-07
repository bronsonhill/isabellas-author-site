import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import { blogPosts } from '../../data/blogData';
import './BlogList.css';

/**
 * BlogCard component displays a blog post preview with animation
 * 
 * @param {Object} props
 * @param {Object} props.blog - Blog post data
 * @param {Function} props.onCardClick - Handler for card click
 * @param {Function} props.onReadMore - Handler for read more button click
 */
const BlogCard = ({ blog, onCardClick, onReadMore, shouldAnimate = true }) => {
    const [ref, isVisible] = useScrollAnimation(0.1);
    
    const animationClass = shouldAnimate ? 'scroll-animation interactive' : '';
    const visibilityClass = shouldAnimate ? (isVisible ? 'visible' : '') : 'visible';
    
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
                <p className="blog-date">{blog.date} • {blog.readTime}</p>
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

const BlogList = () => {
    const navigate = useNavigate();
    const [visibleItems, setVisibleItems] = useState(3);
    const itemsPerPage = 3;
    const [animateFrom, setAnimateFrom] = useState(0);

    const handleCardClick = (e, blogId) => {
        if (e.target.className === 'read-more') {
            return;
        }
        navigate(`/blogs/${blogId}`);
    };

    const handleReadMore = (e, blogId) => {
        e.stopPropagation();
        navigate(`/blogs/${blogId}`);
    };

    const showMoreItems = () => {
        setAnimateFrom(visibleItems);
        setVisibleItems(prev => Math.min(prev + itemsPerPage, blogPosts.length));
    };

    const displayedBlogs = blogPosts.slice(0, visibleItems);
    const hasMoreItems = visibleItems < blogPosts.length;

    return (
        <div className="blog-list">
            {displayedBlogs.map((blog, index) => (
                <BlogCard
                    key={blog.id}
                    blog={blog}
                    onCardClick={handleCardClick}
                    onReadMore={handleReadMore}
                    shouldAnimate={index >= animateFrom}
                />
            ))}
            {hasMoreItems && (
                <div className="load-more-container">
                    <button 
                        className="load-more-button"
                        onClick={showMoreItems}
                        aria-label={`Load ${Math.min(itemsPerPage, blogPosts.length - visibleItems)} more blog posts`}
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
};

export default BlogList;