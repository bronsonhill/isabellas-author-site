import React, { useState } from 'react';
import { getAuth, signInAnonymously } from "firebase/auth";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import './SectionHomeMail.css';
import useScrollAnimation from '../hooks/useScrollAnimation';
import countryList from 'react-select-country-list';

const SectionHomeMail = () => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState('');
    const [showNameFields, setShowNameFields] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [mailRef, isMailVisible] = useScrollAnimation(0.1);
    const countries = countryList().getData();

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        setShowNameFields(true);
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            // Ensure user is authenticated anonymously
            const auth = getAuth();
            const user = auth.currentUser || (await signInAnonymously(auth)).user;
    
            // Add email to Firestore
            const docRef = await addDoc(collection(db, "mailingList"), {
                email,
                firstName,
                lastName,
                phone,
                country,
                userId: user.uid, // Store the user ID
                timestamp: new Date(),
            });
    
            console.log("Document written with ID: ", docRef.id);
            setIsSuccess(true);
            setEmail('');
            setFirstName('');
            setLastName('');
            setPhone('');
            setCountry('');
            setShowNameFields(false);
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Something went wrong. Please try again!");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="mail-section-background">
                <div className="mail-container">
                    <section ref={mailRef} className={`mail-content scroll-animate ${isMailVisible ? 'visible' : ''}`}>
                        <h2>Thank You!</h2>
                        <p>You've successfully joined the mailing list.</p>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div className="mail-section-background">
            <div className="mail-container">
                <section ref={mailRef} className={`mail-content scroll-animate ${isMailVisible ? 'visible' : ''}`}>
                    <h2>Join the Journey</h2>
                    <p>Subscribe to receive updates about new work, blog posts and more.</p>
                    <form onSubmit={showNameFields ? handleFinalSubmit : handleEmailSubmit}>
                        <div className="form-fields">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                disabled={showNameFields}
                            />
                            {showNameFields && (
                                <div className="name-fields">
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="First name (optional)"
                                        className="name-field"
                                    />
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Last name (optional)"
                                        className="name-field"
                                    />
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Phone number (optional)"
                                        className="name-field"
                                    />
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="name-field"
                                    >
                                        <option value="">Select Country (optional)</option>
                                        {countries.map((country) => (
                                            <option key={country.value} value={country.label}>
                                                {country.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Subscribing...' : showNameFields ? 'Complete Subscription' : 'Become a reader'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default SectionHomeMail;
