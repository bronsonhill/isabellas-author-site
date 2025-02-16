import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PortfolioItem from './PortfolioItem';

const PortfolioGrid = ({ items = [], onLoadMore, hasMore, loading }) => {
    const [animateFrom, setAnimateFrom] = useState(0);

    useEffect(() => {
        setAnimateFrom(items.length - (items.length % 4 || 4));
    }, [items.length]);

    return (
        <section className="portfolio-grid">
            <h2>Portfolio</h2>
            <div className="portfolio-items">
                {Array.isArray(items) && items.map((item, index) => (
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
            {hasMore && (
                <div className="load-more-container">
                    <button 
                        className="load-more-button"
                        onClick={onLoadMore}
                        disabled={loading}
                        aria-label="Load more portfolio items"
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </section>
    );
};

PortfolioGrid.propTypes = {
    items: PropTypes.array,
    onLoadMore: PropTypes.func.isRequired,
    hasMore: PropTypes.bool,
    loading: PropTypes.bool
};

export default PortfolioGrid;