import React from 'react';
import PropTypes from 'prop-types';
import './UpcomingSection.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import FeatureCard from './FeatureCard';
import { upcomingFeatures } from '../../data/upcomingFeatures';

/**
 * UpcomingSection component displays a section of upcoming features
 * with animated title and feature cards
 */
const UpcomingSection = () => {
    const [titleRef, isTitleVisible] = useScrollAnimation(0.1);
    
    return (
        <div className="coming-soon-section">
            <div className="coming-soon-content">
                <h2 
                    ref={titleRef} 
                    className={`section-title scroll-animation ${isTitleVisible ? 'visible' : ''}`}
                >
                    Coming Soon
                </h2>
                <div className="features-grid">
                    {upcomingFeatures.map(feature => (
                        <FeatureCard
                            key={feature.id}
                            title={feature.title}
                            description={feature.description}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UpcomingSection;
