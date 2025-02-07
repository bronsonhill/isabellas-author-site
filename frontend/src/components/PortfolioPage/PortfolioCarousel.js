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
 */
const PortfolioCarousel = ({ items, autoAdvanceInterval = 5000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const goToSlide = useCallback((index) => {
        setCurrentIndex(index);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === items.length - 1 ? 0 : prevIndex + 1
            );
        }, autoAdvanceInterval);

        return () => clearInterval(timer);
    }, [items.length, autoAdvanceInterval]);

    return (
        <div className="portfolio-carousel">
            <div className="carousel-container">
                {items.map((item, index) => (
                    <CarouselSlide
                        key={item.id}
                        item={item}
                        isActive={index === currentIndex}
                        offset={index - currentIndex}
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
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        imageUrl: PropTypes.string.isRequired,
        link: PropTypes.string
    })).isRequired,
    autoAdvanceInterval: PropTypes.number
};

export default PortfolioCarousel;