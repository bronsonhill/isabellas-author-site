import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import PortfolioItem from './PortfolioItem';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import './PortfolioGrid.css';

/**
 * PortfolioGrid component displays a grid of portfolio items with infinite scroll
 * Automatically loads more items when user scrolls to the bottom
 */
const PortfolioGrid = ({ items = [], onLoadMore, hasMore, loading, isAdmin = false, onEditItem }) => {
    const [animateFrom, setAnimateFrom] = useState(0);
    const observerRef = useRef(null);
    const loaderRef = useRef(null);
    const ITEMS_PER_LOAD = items.length > 0 ? items.length : 6; // Estimate items per page or use actual initial count
    
    // Update animateFrom whenever items length changes
    useEffect(() => {
        // Only update for subsequent loads, not the initial load
        if (items.length > animateFrom) {
            setAnimateFrom(items.length - (items.length % ITEMS_PER_LOAD || ITEMS_PER_LOAD));
        }
    }, [items.length, ITEMS_PER_LOAD, animateFrom]);
    
    const loadMoreItems = useCallback(() => {
        if (!loading && hasMore) {
            // Set animateFrom to current items length before loading more
            setAnimateFrom(items.length);
            onLoadMore();
        }
    }, [loading, hasMore, onLoadMore, items.length]);

    // Setup IntersectionObserver to detect when user scrolls to loader element
    useEffect(() => {
        // Disconnect any existing observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }
        
        // Create a new observer
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMoreItems();
                }
            },
            { threshold: 0.1 }
        );
        
        observerRef.current = observer;
        
        // Observe the loader element if it exists and we have more content
        if (loaderRef.current && hasMore) {
            observer.observe(loaderRef.current);
        }
        
        // Cleanup
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, loading, loadMoreItems]);

    // Handle portfolio item click in admin mode to edit
    const handleItemEdit = (item) => {
        if (isAdmin && onEditItem) {
            onEditItem(item);
        }
    };

    return (
        <section className="portfolio-section">
            <h2>Portfolio</h2>
            <div className="portfolio-grid">
                {Array.isArray(items) && items.map((item, index) => (
                    item.link && !isAdmin ? (
                        <a 
                            key={item.id}
                            href={item.link} 
                            className="portfolio-item-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <PortfolioItem 
                                item={item} 
                                shouldAnimate={index >= animateFrom}
                                isAdmin={isAdmin}
                                onEditItem={handleItemEdit} 
                            />
                        </a>
                    ) : (
                        <div key={item.id} className="portfolio-item-container">
                            <PortfolioItem 
                                item={item} 
                                shouldAnimate={index >= animateFrom}
                                isAdmin={isAdmin}
                                onEditItem={handleItemEdit}
                            />
                        </div>
                    )
                ))}
            </div>
            
            {/* Invisible loading indicator that triggers more content when scrolled into view */}
            {hasMore && (
                <div 
                    className="portfolio-loader" 
                    ref={loaderRef}
                    aria-hidden="true"
                >
                    {loading && <div className="loader-spinner">Loading...</div>}
                </div>
            )}
        </section>
    );
};

PortfolioGrid.propTypes = {
    items: PropTypes.array,
    onLoadMore: PropTypes.func.isRequired,
    hasMore: PropTypes.bool,
    loading: PropTypes.bool,
    isAdmin: PropTypes.bool,
    onEditItem: PropTypes.func
};

export default PortfolioGrid;