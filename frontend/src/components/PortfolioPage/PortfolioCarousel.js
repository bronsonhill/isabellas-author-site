import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import CarouselSlide from './CarouselSlide';
import './PortfolioCarousel.css';

/**
 * PortfolioCarousel component displays a rotating carousel of featured portfolio items
 * with auto-advance and manual navigation capabilities
 * 
 * @param {Object} props
 * @param {Array} props.items - Array of featured portfolio items to display
 * @param {number} [props.autoAdvanceInterval=5000] - Time in ms between auto-advances
 * @param {boolean} [props.isAdmin=false] - Whether the user is in admin mode
 * @param {Function} [props.onEditItem] - Callback for editing an item
 */
const PortfolioCarousel = ({ 
    items, 
    autoAdvanceInterval = 5000, 
    isAdmin = false, 
    onEditItem 
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    
    const goToSlide = useCallback((index) => {
        setCurrentIndex(index);
    }, []);

    // Handle editing a carousel item
    const handleEditItem = useCallback((item) => {
        if (isAdmin && onEditItem) {
            // Pause auto-rotation when editing
            setIsPaused(true);
            onEditItem(item);
        }
    }, [isAdmin, onEditItem]);

    useEffect(() => {
        // Skip auto-advance if paused or in admin mode
        if (isPaused || isAdmin) return;
        
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === items.length - 1 ? 0 : prevIndex + 1
            );
        }, autoAdvanceInterval);
        
        return () => clearInterval(timer);
    }, [items.length, autoAdvanceInterval, isPaused, isAdmin]);

    return (
        <div 
            className="portfolio-carousel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="carousel-container">
                {items.map((item, index) => (
                    <CarouselSlide
                        key={item.id}
                        item={item}
                        isActive={index === currentIndex}
                        offset={index - currentIndex}
                        isAdmin={isAdmin}
                        onEditItem={handleEditItem}
                    />
                ))}
            </div>
            <div className="carousel-indicators">
                {items.map((item, index) => (
                    <button
                        key={item.id}
                        className={`indicator ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

PortfolioCarousel.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        imageUrl: PropTypes.string.isRequired,
        link: PropTypes.string,
        featured: PropTypes.bool
    })).isRequired,
    autoAdvanceInterval: PropTypes.number,
    isAdmin: PropTypes.bool,
    onEditItem: PropTypes.func
};

export default PortfolioCarousel;