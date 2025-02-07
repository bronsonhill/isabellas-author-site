import React from 'react';
import PortfolioCarousel from '../components/PortfolioPage/PortfolioCarousel';
import PortfolioGrid from '../components/PortfolioPage/PortfolioGrid';
import { featuredItems, portfolioItems } from '../data/portfolioData';
import './page.css';
import './Portfolio.css';

/**
 * Portfolio page component displaying featured works carousel 
 * and a grid of portfolio items
 */
const Portfolio = () => (
    <div className="portfolio-page">
        <main>
            <section className="featured-section">
                <PortfolioCarousel items={featuredItems} />
            </section>
            <PortfolioGrid items={portfolioItems} />
        </main>
    </div>
);

export default Portfolio;
