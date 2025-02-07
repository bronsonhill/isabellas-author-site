import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import instagramIcon from '../assets/Instagram_Glyph_Black.svg';

const Header = () => {
    return (
        <header>
            <h1><Link to="/">Isabella Eichler-Onus</Link></h1>
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li className="disabled"><span>Portfolio</span></li>
                    <li className="disabled"><span>Blog</span></li>
                    <li className="social-glyph">
                        <a href="https://www.instagram.com/bellieeichler" 
                           target="_blank" 
                           rel="noopener noreferrer">
                            <img src={instagramIcon} alt="Instagram" className="social-icon" />
                        </a>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
