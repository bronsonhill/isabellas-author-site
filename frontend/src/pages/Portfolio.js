import React from 'react';
import PortfolioContent from '../components/PortfolioPage/PortfolioContent';
import './page.css';
import './Portfolio.css';

const Portfolio = () => {
    return (
        <div className="portfolio-page-container">
            <main>
                <PortfolioContent />
            </main>
        </div>
    );
};

export default Portfolio;
