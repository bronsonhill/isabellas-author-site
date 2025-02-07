import React, { useState, useEffect } from 'react';
import './PortfolioCarousel.css';

const PortfolioCarousel = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === items.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(timer);
    }, [items.length]);

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    return (
        <div className="portfolio-carousel">
            <div className="carousel-container">
                {items.map((item, index) => (
                    <div 
                        key={index}
                        className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
                        style={{ transform: `translateX(${(index - currentIndex) * 100}%)` }}
                    >
                        <img src={item.imageUrl} alt={item.title} />
                        <div className="carousel-content">
                            <h2>{item.title}</h2>
                            <p>{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="carousel-indicators">
                {items.map((_, index) => (
                    <button
                        key={index}
                        className={`indicator ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default PortfolioCarousel;