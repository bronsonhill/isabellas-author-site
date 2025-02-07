import React from 'react';
import PropTypes from 'prop-types';
import useScrollAnimation from '../../hooks/useScrollAnimation';

/**
 * FeatureCard component displays an individual upcoming feature
 * with animation on scroll into view
 */
const FeatureCard = ({ title, description }) => {
    const [ref, isVisible] = useScrollAnimation(0.1);
    
    return (
        <div 
            ref={ref}
            className={`feature-card scroll-animation interactive ${isVisible ? 'visible' : ''}`}
        >
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
};

FeatureCard.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
};

export default FeatureCard;