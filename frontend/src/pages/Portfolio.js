import React, { useState, useEffect } from 'react';
import PortfolioCarousel from '../components/PortfolioPage/PortfolioCarousel';
import PortfolioGrid from '../components/PortfolioPage/PortfolioGrid';
import { fetchFeaturedItems } from '../services/firebase';
import './page.css';
import './Portfolio.css';

/**
 * Portfolio page component displaying featured works carousel 
 * and a grid of portfolio items
 */
const Portfolio = () => {
    const [featuredItems, setFeaturedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadFeaturedItems();
    }, []);

    const loadFeaturedItems = async () => {
        try {
            const items = await fetchFeaturedItems();
            setFeaturedItems(items);
        } catch (err) {
            setError('Failed to load featured items');
            console.error('Error loading featured items:', err);
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="portfolio-page">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={loadFeaturedItems}>Try Again</button>
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
                <PortfolioGrid />
            </main>
        </div>
    );
};

export default Portfolio;
