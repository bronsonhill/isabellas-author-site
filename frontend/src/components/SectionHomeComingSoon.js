import React from 'react';
import './SectionHomeComingSoon.css';
import useScrollAnimation from '../hooks/useScrollAnimation';

const SectionHomeComingSoon = () => {
  const [titleRef, isTitleVisible] = useScrollAnimation(0.1);
  const [gridRef, isGridVisible] = useScrollAnimation(0.1);

  return (
    <div className="coming-soon-section">
      <div className="coming-soon-content">
        <h2 ref={titleRef} className={`scroll-animate ${isTitleVisible ? 'visible' : ''}`}>
          Coming Soon
        </h2>
        <div ref={gridRef} className={`features-grid scroll-animate ${isGridVisible ? 'visible' : ''}`}>
          <div className="feature-card">
            <h3>Portfolio</h3>
            <p>Browse through my published works, poetry collections, and creative writing pieces.</p>
          </div>
          <div className="feature-card">
            <h3>Blog</h3>
            <p>Explore my thoughts on writing, creativity, and cultural connection through regular blog posts.</p>
          </div>
          <div className="feature-card">
            <h3>More</h3>
            <p>Coming soon, including some fun experimental projects.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionHomeComingSoon;
