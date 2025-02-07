import React from 'react';
import PropTypes from 'prop-types';
import PortfolioItem from './PortfolioItem';

/**
 * PortfolioGrid component displays a grid of portfolio items
 * 
 * @param {Object} props
 * @param {Array} props.items - Array of portfolio items to display
 */
const PortfolioGrid = ({ items }) => (
    <section className="portfolio-grid">
        <h2>Portfolio Works</h2>
        <div className="portfolio-items">
            {items.map(item => (
                item.link ? (
                    <a 
                        key={item.id} 
                        href={item.link} 
                        className="portfolio-item-link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <PortfolioItem item={item} />
                    </a>
                ) : (
                    <div key={item.id} className="portfolio-item-container">
                        <PortfolioItem item={item} />
                    </div>
                )
            ))}
        </div>
    </section>
);

PortfolioGrid.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        imageUrl: PropTypes.string.isRequired,
        link: PropTypes.string
    })).isRequired
};

export default PortfolioGrid;