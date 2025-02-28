import React from 'react';
import PropTypes from 'prop-types';

/**
 * CarouselSlide component represents a single slide in the portfolio carousel
 * The entire slide is clickable when a link is provided
 * 
 * @param {Object} props
 * @param {Object} props.item - The portfolio item to display
 * @param {boolean} props.isActive - Whether this slide is currently active
 * @param {number} props.offset - The position offset for this slide
 * @param {boolean} props.isAdmin - Whether the user is in admin mode
 * @param {Function} props.onEditItem - Callback for editing an item
 */
const CarouselSlide = ({ item, isActive, offset, isAdmin = false, onEditItem }) => {
    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isAdmin && onEditItem) {
            onEditItem(item);
        }
    };
    
    const SlideContent = (
        <>
            <img src={item.imageUrl} alt={item.title} />
            <div className="carousel-content">
                <h2>{item.title}</h2>
            </div>
            
            {/* Admin edit controls */}
            {isAdmin && (
                <div className="carousel-edit-controls">
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
        </>
    );
    
    // If we're in admin mode, don't make the slide a link
    if (item.link && !isAdmin) {
        return (
            <a 
                href={item.link}
                className={`carousel-slide clickable ${isActive ? 'active' : ''}`}
                style={{ transform: `translateX(${offset * 100}%)` }}
                target="_blank"
                rel="noopener noreferrer"
            >
                {SlideContent}
            </a>
        );
    } else {
        return (
            <div 
                className={`carousel-slide ${isActive ? 'active' : ''} ${isAdmin ? 'admin-mode' : ''}`}
                style={{ transform: `translateX(${offset * 100}%)` }}
            >
                {SlideContent}
            </div>
        );
    }
};

CarouselSlide.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        imageUrl: PropTypes.string.isRequired,
        link: PropTypes.string,
        featured: PropTypes.bool
    }).isRequired,
    isActive: PropTypes.bool.isRequired,
    offset: PropTypes.number.isRequired,
    isAdmin: PropTypes.bool,
    onEditItem: PropTypes.func
};

export default CarouselSlide;