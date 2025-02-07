import React from 'react';
import './UpcomingSection.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const UpcomingSection = () => {
  const [titleRef, isTitleVisible] = useScrollAnimation(0.1);
  const [gridRef, isGridVisible] = useScrollAnimation(0.1);

  const features = [
    {
      title: 'Portfolio',
      description: 'Browse through my published works, poetry collections, and creative writing pieces.'
    },
    {
      title: 'Blog',
      description: 'Explore my thoughts on writing, creativity, and cultural connection through regular blog posts.'
    },
    {
      title: 'More',
      description: 'Coming soon, including some fun experimental projects.'
    }
  ];

  return (
    <div className="coming-soon-section">
      <div className="coming-soon-content">
        <h2 
          ref={titleRef} 
          className={`section-title scroll-animation ${isTitleVisible ? 'visible' : ''}`}
        >
          Coming Soon
        </h2>
        <div 
          ref={gridRef} 
          className={`features-grid`}
        >
          {features.map((feature, index) => (
            <div key={index} className={`feature-card scroll-animation interactive ${isGridVisible ? 'visible' : ''}`}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingSection;
