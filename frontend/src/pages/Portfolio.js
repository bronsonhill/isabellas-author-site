import React, { useState, useEffect } from 'react';
import PortfolioCarousel from '../components/PortfolioPage/PortfolioCarousel';
import PortfolioGrid from '../components/PortfolioPage/PortfolioGrid';
import { fetchFeaturedItems, fetchPortfolioItems } from '../services/firebase';
import './page.css';
import './Portfolio.css';

const Portfolio = () => {
    const [featuredItems, setFeaturedItems] = useState([]);
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [featured, portfolio] = await Promise.all([
                fetchFeaturedItems(),
                fetchPortfolioItems()
            ]);
            
            console.log('Initial data loaded:', { featured, portfolio });
            setFeaturedItems(featured || []);
            setPortfolioItems(portfolio.items || []);
            setLastVisible(portfolio.lastVisible);
            setHasMore(portfolio.lastVisible !== null);
        } catch (err) {
            console.error('Error loading portfolio data:', err);
            setError('Failed to load portfolio data');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        if (!hasMore || loading) return;
        
        try {
            setLoading(true);
            console.log('Loading more items with lastVisible:', lastVisible);
            const result = await fetchPortfolioItems(undefined, lastVisible);
            
            console.log('More items loaded:', result);
            if (result.items && result.items.length > 0) {
                setPortfolioItems(prev => [...prev, ...result.items]);
                setLastVisible(result.lastVisible);
                setHasMore(result.lastVisible !== null);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Error loading more items:', err);
            setError('Failed to load more items');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="portfolio-page">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={loadInitialData}>Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="portfolio-page">
            <main>
                {!loading && featuredItems.length > 0 && (
                    <section className="featured-section">
                        <PortfolioCarousel items={featuredItems} />
                    </section>
                )}
                <PortfolioGrid 
                    items={portfolioItems}
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    loading={loading}
                />
            </main>
        </div>
    );
};

export default Portfolio;
