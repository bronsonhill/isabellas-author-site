import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PortfolioItem from './PortfolioItem';
import { fetchPortfolioItems } from '../../services/firebase';

/**
 * PortfolioGrid component displays a grid of portfolio items
 * with load more functionality and Firebase integration
 */
const PortfolioGrid = ({ itemsPerPage = 4 }) => {
    const [items, setItems] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [animateFrom, setAnimateFrom] = useState(0);

    useEffect(() => {
        loadInitialItems();
    }, []);

    const loadInitialItems = async () => {
        try {
            setLoading(true);
            const { items: portfolioItems, lastVisible: last } = await fetchPortfolioItems(itemsPerPage);
            setItems(portfolioItems);
            setLastVisible(last);
        } catch (err) {
            setError('Failed to load portfolio items');
            console.error('Error loading portfolio items:', err);
        } finally {
            setLoading(false);
        }
    };
    
    const showMoreItems = async () => {
        if (!lastVisible || loading) return;

        try {
            setLoading(true);
            setAnimateFrom(items.length);
            const { items: newItems, lastVisible: last } = await fetchPortfolioItems(itemsPerPage, lastVisible);
            setItems(prev => [...prev, ...newItems]);
            setLastVisible(last);
        } catch (err) {
            setError('Failed to load more items');
            console.error('Error loading more items:', err);
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="portfolio-grid-error">
                <p>{error}</p>
                <button onClick={loadInitialItems}>Try Again</button>
            </div>
        );
    }

    return (
        <section className="portfolio-grid">
            <h2>Portfolio Works</h2>
            <div className="portfolio-items">
                {items.map((item, index) => (
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
            {lastVisible && (
                <div className="load-more-container">
                    <button 
                        className="load-more-button"
                        onClick={showMoreItems}
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
    itemsPerPage: PropTypes.number
};

export default PortfolioGrid;