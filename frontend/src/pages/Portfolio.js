import React from 'react';
import PortfolioCarousel from '../components/PortfolioPage/PortfolioCarousel';
import useScrollAnimation from '../hooks/useScrollAnimation';
import './page.css';
import './Portfolio.css';

const Portfolio = () => {
    const featuredItems = [
        {
            id: 1,
            title: "Featured Work 1",
            description: "An exciting project showcasing creativity and innovation",
            imageUrl: "https://placekitten.com/1200/500",
            link: "https://example.com/work1"
        },
        {
            id: 2,
            title: "Featured Work 2",
            description: "A compelling piece that demonstrates storytelling mastery",
            imageUrl: "https://placekitten.com/1201/500",
            link: "https://example.com/work2"
        },
        {
            id: 3,
            title: "Featured Work 3",
            description: "An inspiring creation that pushes boundaries",
            imageUrl: "https://placekitten.com/1202/500",
            link: "https://example.com/work3"
        }
    ];

    const portfolioItems = [
        {
            id: 1,
            title: "Short Story Collection",
            category: "Fiction",
            date: "2024",
            description: "A collection of interconnected stories exploring themes of family and identity",
            imageUrl: "https://placekitten.com/600/400",
            link: "https://example.com/story-collection"
        },
        {
            id: 2,
            title: "Poetry Anthology",
            category: "Poetry",
            date: "2023",
            description: "An exploration of nature and human connection through verse",
            imageUrl: "https://placekitten.com/601/400"
        },
        {
            id: 3,
            title: "Literary Magazine Feature",
            category: "Publication",
            date: "2023",
            description: "Featured work in prestigious literary magazine",
            imageUrl: "https://placekitten.com/602/400",
            link: "https://example.com/magazine"
        },
        {
            id: 4,
            title: "Novel Manuscript",
            category: "Fiction",
            date: "2022-2024",
            description: "Currently in development - A coming-of-age story set in a small coastal town",
            imageUrl: "https://placekitten.com/603/400"
        }
    ];

    const PortfolioItemContent = ({ item }) => {
        const [ref, isVisible] = useScrollAnimation(0.3);
        
        return (
            <article ref={ref} className={`portfolio-item ${isVisible ? 'visible' : ''}`}>
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

    return (
        <div className="portfolio-page">
            <main>
                <section className="featured-section">
                    <PortfolioCarousel items={featuredItems} />
                </section>
                
                <section className="portfolio-grid">
                    <h2>Portfolio Works</h2>
                    <div className="portfolio-items">
                        {portfolioItems.map(item => (
                            item.link ? (
                                <a 
                                    key={item.id} 
                                    href={item.link} 
                                    className="portfolio-item-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <PortfolioItemContent item={item} />
                                </a>
                            ) : (
                                <div key={item.id} className="portfolio-item-container">
                                    <PortfolioItemContent item={item} />
                                </div>
                            )
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Portfolio;
