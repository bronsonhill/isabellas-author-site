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
          <h2>About Isabella</h2>
          <section className="about-content">
              <p>
                Isabella Eichler-Onus is a proud Gunditjmara writer living in Naarm (Melbourne). 
                She is studying a BA majoring in Creative Writing at the University of Melbourne 
                and has recently published poetry with various Australian literary magazines. 
                Her poetry and short fiction explore themes of identity, cultural connection and 
                the intricate relationship between land and body. She draws inspiration from great 
                Indigenous writers such as{' '}
                <a href="https://amzn.to/4jKORjA" target="_blank" rel="noopener noreferrer">Oodgeroo Noonuccal</a>,{' '}
              </p>
              <p>
                <a href="https://amzn.to/40PVUPx" target="_blank" rel="noopener noreferrer">Tony Birch</a>,{' '}
                <a href="https://amzn.to/3WQmDKt" target="_blank" rel="noopener noreferrer">Evelyn Araluen</a>, and{' '}
                <a href="https://amzn.to/413z0Wg" target="_blank" rel="noopener noreferrer">Maxine Beneba Clarke</a>,
                as well as renowned novelists like{' '}
                <a href="https://amzn.to/4jOukKW" target="_blank" rel="noopener noreferrer">Margaret Atwood</a>,{' '}
                <a href="https://amzn.to/42KTxzT" target="_blank" rel="noopener noreferrer">Kazuo Ishiguro</a>, and{' '}
                <a href="https://amzn.to/42I1wOa" target="_blank" rel="noopener noreferrer">Gabrielle Zevin</a>.
                Alongside her published work, she enjoys experimenting with playful and 
                unconventional storytelling techniques in personal projects, including 
                interactive fiction and other multimedia forms. She has many projects planned 
                for 2025; scroll down to sign up for the mailing list or you can find her 
                on Instagram{' '}
                <a href="https://www.instagram.com/bellieeichler" target="_blank" rel="noopener noreferrer">@bellieeichler</a>. 
              </p>
          </section>
        </section>
      </div>
    </div>
  );
};

export default HomeSection1;