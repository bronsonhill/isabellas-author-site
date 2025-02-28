import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import { formatPortfolioDate } from '../../utils/dateUtils';
import './PortfolioItem.css';

/**
 * PortfolioItem component renders an individual portfolio work item
 * with animation on scroll into view
 * 
 * @param {Object} props
 * @param {Object} props.item - Portfolio item data
 * @param {string} props.item.title - Title of the work
 * @param {string} props.item.imageUrl - URL of the work's image
 * @param {string} props.item.category - Category of the work
 * @param {string} props.item.publishedDate - Published date of the work (YYYY-MM-DD)
 * @param {boolean} props.isAdmin - Whether the user is in admin mode
 * @param {Function} props.onEditItem - Callback for editing an item
 */
const PortfolioItem = ({ item, shouldAnimate = true, isAdmin = false, onEditItem }) => {
    const [ref, isVisible] = useScrollAnimation(0.1);
    const visibilityClass = shouldAnimate ? (isVisible ? 'visible' : '') : 'visible';
    
    // Format the publishedDate to display as month and year
    const formattedDate = formatPortfolioDate(item.publishedDate);
    
    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onEditItem) {
            onEditItem(item);
        }
    };
    
    return (
        <article 
            ref={shouldAnimate ? ref : undefined}
            className={`portfolio-item ${visibilityClass}`}
        >
            {/* Featured badge for featured items */}
            {item.featured && <span className="featured-badge">Featured</span>}
            
            {/* Admin edit controls */}
            {isAdmin && (
                <div className="edit-controls">
                    <button 
                        className="edit-button" 
                        onClick={handleEdit}
                        title="Edit"
                        aria-label="Edit portfolio item"
                    >
                        ✎
                    </button>
                </div>
            )}
            
            <div className="portfolio-image">
                <img src={item.imageUrl} alt={item.title} />
            </div>
            <div className="portfolio-content">
                <h3>{item.title}</h3>
                <p className="portfolio-category">{item.category} • {formattedDate}</p>
            </div>
        </article>
    );
};

PortfolioItem.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        publishedDate: PropTypes.string, // Changed from date to publishedDate
        imageUrl: PropTypes.string.isRequired,
        link: PropTypes.string,
        featured: PropTypes.bool
    }).isRequired,
    shouldAnimate: PropTypes.bool,
    isAdmin: PropTypes.bool,
    onEditItem: PropTypes.func
};

export default PortfolioItem;