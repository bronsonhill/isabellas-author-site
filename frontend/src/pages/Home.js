import React from 'react';
import AboutSection from '../components/HomePage/AboutSection';
import NewsletterSection from '../components/HomePage/NewsletterSection';
import UpcomingSection from '../components/HomePage/UpcomingSection';
import { useAuth } from '../contexts/AuthContext';
import AdminControls from '../components/common/AdminControls';
import './page.css';

const Home = () => {
    const { isAdmin } = useAuth();

    return (
        <div className="home-page">
            <main>
                {isAdmin && (
                    <AdminControls>
                        <button onClick={() => console.log('Edit about section')}>
                            Edit About Section
                        </button>
                    </AdminControls>
                )}
                <AboutSection />
                <NewsletterSection />
                <UpcomingSection />
            </main>
        </div>
    );
};

export default Home;