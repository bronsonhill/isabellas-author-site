import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './BlogList.css';

/**
 * BlogCard component displays a blog post preview with animation
 * 
 * @param {Object} props
 * @param {Object} props.blog - Blog post data
 * @param {Function} props.onCardClick - Handler for card click
 * @param {Function} props.onReadMore - Handler for read more button click
 */
const BlogCard = ({ blog, onCardClick, onReadMore }) => {
    const [ref, isVisible] = useScrollAnimation(0.1);
    
    return (
        <article 
            ref={ref}
            className={`blog-card scroll-animation interactive ${isVisible ? 'visible' : ''}`}
            onClick={(e) => onCardClick(e, blog.id)}
        >
            <div className="blog-image">
                <img src={blog.imageUrl} alt={blog.title} />
            </div>
            <div className="blog-content">
                <h2>{blog.title}</h2>
                <p className="blog-date">{blog.date}</p>
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
        imageUrl: PropTypes.string.isRequired
    }).isRequired,
    onCardClick: PropTypes.func.isRequired,
    onReadMore: PropTypes.func.isRequired
};

const BlogList = () => {
    const navigate = useNavigate();
    
    const placeholderBlogs = [
        {
            id: 1,
            title: "The Art of Storytelling",
            date: "March 15, 2024",
            excerpt: "Exploring the fundamental elements that make a story captivating and memorable...",
            imageUrl: "https://placekitten.com/800/400"
        },
        {
            id: 2,
            title: "Character Development Tips",
            date: "March 1, 2024",
            excerpt: "Creating compelling characters that readers will connect with and remember...",
            imageUrl: "https://placekitten.com/801/400"
        },
        {
            id: 3,
            title: "Writing Process Insights",
            date: "February 15, 2024",
            excerpt: "A behind-the-scenes look at my personal writing journey and creative process...",
            imageUrl: "https://placekitten.com/802/400"
        }
    ];

    const handleCardClick = (e, blogId) => {
        // Don't navigate if clicking the read more button
        if (e.target.className === 'read-more') {
            return;
        }
        navigate(`/blogs/${blogId}`);
    };

    const handleReadMore = (e, blogId) => {
        e.stopPropagation(); // Prevent card click
        navigate(`/blogs/${blogId}`);
    };

    return (
        <div className="blog-list">
            {placeholderBlogs.map(blog => (
                <BlogCard
                    key={blog.id}
                    blog={blog}
                    onCardClick={handleCardClick}
                    onReadMore={handleReadMore}
                />
            ))}
        </div>
    );
};

export default BlogList;