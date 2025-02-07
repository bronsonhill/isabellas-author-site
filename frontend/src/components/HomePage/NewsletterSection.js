import React, { useState } from 'react';
import { getAuth, signInAnonymously } from "firebase/auth";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import './NewsletterSection.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import countryList from 'react-select-country-list';

const NewsletterSection = () => {
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        country: ''
    });
    const [showNameFields, setShowNameFields] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [mailRef, isMailVisible] = useScrollAnimation(0.1);
    const countries = countryList().getData();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        setShowNameFields(true);
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            const auth = getAuth();
            const user = auth.currentUser || (await signInAnonymously(auth)).user;
    
            await addDoc(collection(db, "mailingList"), {
                ...formData,
                userId: user.uid,
                timestamp: new Date(),
            });
    
            setIsSuccess(true);
            setFormData({
                email: '',
                firstName: '',
                lastName: '',
                phone: '',
                country: ''
            });
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
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                required
                                disabled={showNameFields}
                            />
                            {showNameFields && (
                                <div className="name-fields">
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="First Name"
                                    />
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Last Name"
                                    />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Phone (optional)"
                                    />
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Country (optional)</option>
                                        {countries.map(country => (
                                            <option key={country.value} value={country.value}>
                                                {country.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Submitting...' : (showNameFields ? 'Submit' : 'Continue')}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default NewsletterSection;
