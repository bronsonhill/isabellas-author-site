import React from 'react';
import './AdminControls.css';

/**
 * Container for admin-only controls with consistent styling
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to render inside the controls container
 */
const AdminControls = ({ children }) => {
    return (
        <div className="admin-controls">
            {children}
        </div>
    );
};

export default AdminControls;
