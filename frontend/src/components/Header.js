import React from 'react';
import './Header.css';
import instagramIcon from '../assets/Instagram_Glyph_Black.svg';

const Header = () => {
    return (
        <header>
            <h1><a href="/">Isabella Eichler-Onus</a></h1>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li className="disabled"><a href="#" onClick={(e) => e.preventDefault()}>Portfolio</a></li>
                    <li className="disabled"><a href="#" onClick={(e) => e.preventDefault()}>Blogs</a></li>
                    <li className="social-glyph"><a href="https://www.instagram.com/bellieeichler">
                        <img src={instagramIcon} alt="Instagram" className="social-icon" />
                    </a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
