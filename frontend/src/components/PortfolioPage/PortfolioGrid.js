import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PortfolioItem from './PortfolioItem';

/**
 * PortfolioGrid component displays a grid of portfolio items
 * with load more functionality
 * 
 * @param {Object} props
 * @param {Array} props.items - Array of portfolio items to display
 * @param {number} [props.itemsPerPage=4] - Number of items to show per page
 */
const PortfolioGrid = ({ items, itemsPerPage = 4 }) => {
    const [visibleItems, setVisibleItems] = useState(itemsPerPage);
    const [animateFrom, setAnimateFrom] = useState(0);
    
    const showMoreItems = () => {
        setAnimateFrom(visibleItems);
        setVisibleItems(prev => Math.min(prev + itemsPerPage, items.length));
    };

    const displayedItems = items.slice(0, visibleItems);
    const hasMoreItems = visibleItems < items.length;

    return (
        <section className="portfolio-grid">
            <h2>Portfolio</h2>
            <div className="portfolio-items">
                {displayedItems.map((item, index) => (
                    item.link ? (
                        <a 
                            key={item.id}
                            href={item.link} 
                            className="portfolio-item-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <PortfolioItem item={item} shouldAnimate={index >= animateFrom} />
                        </a>
                    ) : (
                        <div key={item.id} className="portfolio-item-container">
                            <PortfolioItem item={item} shouldAnimate={index >= animateFrom} />
                        </div>
                    )
                ))}
            </div>
            {hasMoreItems && (
                <div className="load-more-container">
                    <button 
                        className="load-more-button"
                        onClick={showMoreItems}
                        aria-label={`Load ${Math.min(itemsPerPage, items.length - visibleItems)} more portfolio items`}
                    >
                        Load More
                    </button>
                </div>
            )}
        </section>
    );
};

PortfolioGrid.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        imageUrl: PropTypes.string.isRequired,
        link: PropTypes.string
    })).isRequired,
    itemsPerPage: PropTypes.number
};

export default PortfolioGrid;