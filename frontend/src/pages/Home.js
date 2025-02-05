import React from 'react';
import SectionHomeAbout from '../components/SectionHomeAbout';
import SectionHomeMail from '../components/SectionHomeMail';
import SectionHomeComingSoon from '../components/SectionHomeComingSoon';
import './page.css';

const Home = () => {
    return (
        <div className="home-page">
            <main>
                <SectionHomeAbout />
                <SectionHomeMail />
                <SectionHomeComingSoon />
            </main>
        </div>
    );
};

export default Home;