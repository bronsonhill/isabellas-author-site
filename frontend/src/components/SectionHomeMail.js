import React, { useState } from 'react';
import './SectionHomeMail.css';
import useScrollAnimation from '../hooks/useScrollAnimation';

const SectionHomeMail = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [showNameField, setShowNameField] = useState(false);
    const [mailRef, isMailVisible] = useScrollAnimation(0.1);

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        setShowNameField(true);
    };

    const handleFinalSubmit = (e) => {
        e.preventDefault();
        // TODO: Add mailing list integration
        console.log('Subscription details:', { email, name });
    };

    return (
        <div className="mail-section-background">
            <div className="mail-container">
                <section ref={mailRef} className={`mail-content scroll-animate ${isMailVisible ? 'visible' : ''}`}>
                    <h2>Join the Journey</h2>
                    <p>Subscribe to receive updates about new work, blog posts and more.</p>
                    <form onSubmit={showNameField ? handleFinalSubmit : handleEmailSubmit}>
                        <div className="form-fields">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                disabled={showNameField}
                            />
                            {showNameField && (
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name (optional)"
                                    className="name-field"
                                />
                            )}
                        </div>
                        <button type="submit">
                            {showNameField ? 'Complete Subscription' : 'Become a reader'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default SectionHomeMail;
