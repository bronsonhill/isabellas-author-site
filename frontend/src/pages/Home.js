import React from 'react';
import AboutSection from '../components/HomePage/AboutSection';
import NewsletterSection from '../components/HomePage/NewsletterSection';
import UpcomingSection from '../components/HomePage/UpcomingSection';
import './page.css';

const Home = () => {
    return (
        <div className="home-page">
            <main>
                <AboutSection />
                <NewsletterSection />
                <UpcomingSection />
            </main>
        </div>
    );
};

export default Home;