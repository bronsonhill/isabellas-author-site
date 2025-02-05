import React from 'react';
import './SectionHomeAbout.css';
import placeholderImage from '../assets/main_portrait.JPG';
import useScrollAnimation from '../hooks/useScrollAnimation';

const HomeSection1 = () => {
  const [aboutRef, isAboutVisible] = useScrollAnimation(0.1);

  return (
    <div className="section-background">
        
        <div className="home-container">
        <section className="image-section">
          <img src={placeholderImage} alt="Profile Placeholder" className="profile-image" />
        </section>
        
        <section ref={aboutRef} className={`about-section ${isAboutVisible ? 'visible' : ''}`}>
          <h1>About Isabella</h1>
          <section className="about-content">
              <p>
              Isabella Eichler-Onus is a proud Gunditjmara writer living in Naarm. She is studying a Bachelor of Creative
              Writing at the University of Melbourne and has published poetry with Red Room Poetry and Voiceworks. Her work
              explores themes of identity, cultural connection and the intricate relationship between land and body. You can
              find her on Instagram <a href="https://www.instagram.com/bellieeichler" target="_blank" rel="noopener noreferrer">@bellieeichler</a>.
              </p>
              <p>
              Aenean ut venenatis lorem, sed ultricies risus. Phasellus mattis urna ac arcu rhoncus, in ultricies urna dapibus.
              Duis vulputate porta augue sed dictum. Donec vitae mauris at dolor suscipit luctus vel sed massa. Aenean ut tempus
              dolor. Nulla scelerisque maximus efficitur. Vestibulum iaculis quis orci at pharetra. Aenean ultricies felis elementum
              mauris congue ullamcorper. Maecenas egestas mauris in iaculis varius.
              </p>
          </section>
        </section>
      </div>
    </div>
  );
};

export default HomeSection1;