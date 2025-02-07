import React from 'react';
import PropTypes from 'prop-types';
import useScrollAnimation from '../../hooks/useScrollAnimation';

/**
 * PortfolioItem component renders an individual portfolio work item
 * with animation on scroll into view
 * 
 * @param {Object} props
 * @param {Object} props.item - Portfolio item data
 * @param {string} props.item.title - Title of the work
 * @param {string} props.item.imageUrl - URL of the work's image
 * @param {string} props.item.category - Category of the work
 * @param {string} props.item.date - Date or timeframe of the work
 * @param {string} props.item.description - Description of the work
 */
const PortfolioItem = ({ item }) => {
    const [ref, isVisible] = useScrollAnimation(0.1);
    
    return (
        <article ref={ref} className={`portfolio-item scroll-animation interactive ${isVisible ? 'visible' : ''}`}>
            <div className="portfolio-image">
                <img src={item.imageUrl} alt={item.title} />
            </div>
            <div className="portfolio-content">
                <h3>{item.title}</h3>
                <p className="portfolio-category">{item.category} • {item.date}</p>
                <p className="portfolio-description">{item.description}</p>
            </div>
        </article>
    );
};

PortfolioItem.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        imageUrl: PropTypes.string.isRequired,
        link: PropTypes.string
    }).isRequired
};

export default PortfolioItem;