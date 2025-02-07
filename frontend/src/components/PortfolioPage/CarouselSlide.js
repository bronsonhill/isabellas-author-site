import React from 'react';
import PropTypes from 'prop-types';

/**
 * CarouselSlide component represents a single slide in the portfolio carousel
 * The entire slide is clickable when a link is provided
 */
const CarouselSlide = ({ item, isActive, offset }) => {
    const SlideContent = (
        <>
            <img src={item.imageUrl} alt={item.title} />
            <div className="carousel-content">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
            </div>
        </>
    );

    return item.link ? (
        <a 
            href={item.link}
            className={`carousel-slide clickable ${isActive ? 'active' : ''}`}
            style={{ transform: `translateX(${offset * 100}%)` }}
            target="_blank"
            rel="noopener noreferrer"
        >
            {SlideContent}
        </a>
    ) : (
        <div 
            className={`carousel-slide ${isActive ? 'active' : ''}`}
            style={{ transform: `translateX(${offset * 100}%)` }}
        >
            {SlideContent}
        </div>
    );
};

CarouselSlide.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        imageUrl: PropTypes.string.isRequired,
        link: PropTypes.string
    }).isRequired,
    isActive: PropTypes.bool.isRequired,
    offset: PropTypes.number.isRequired
};

export default CarouselSlide;