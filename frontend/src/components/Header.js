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
                    <li><Link to="/" className="nav-link">Home</Link></li>
                    <li className="disabled"><Link to="#" onClick={(e) => e.preventDefault()} className="nav-link">Portfolio</Link></li>
                    <li className="disabled"><Link to="#" onClick={(e) => e.preventDefault()} className="nav-link">Blog</Link></li>
                    <li className="social-glyph">
                        <a href="https://www.instagram.com/bellieeichler" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="nav-link">
                            <img src={instagramIcon} alt="Instagram" className="social-icon" />
                        </a>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
