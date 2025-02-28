import React from 'react';
import './ErrorMessage.css';

/**
 * Displays error messages with retry functionality
 * @param {Object} props - Component props
 * @param {string} props.message - The error message to display
 * @param {Function} props.onRetry - Function to call when the retry button is clicked
 */
const ErrorMessage = ({ message, onRetry }) => {
    return (
        <div className="error-container">
            <div className="error-message">
                <p>{message}</p>
                {onRetry && (
                    <button onClick={onRetry}>Try Again</button>
                )}
            </div>
        </div>
    );
};

export default ErrorMessage;
