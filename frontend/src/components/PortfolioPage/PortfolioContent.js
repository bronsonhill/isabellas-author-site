import React, { useState, useEffect } from 'react';
import PortfolioCarousel from './PortfolioCarousel';
import PortfolioGrid from './PortfolioGrid';
import PortfolioItemEditor from './PortfolioItemEditor';
import AdminControls from '../common/AdminControls';
import ErrorMessage from '../common/ErrorMessage';
import { fetchFeaturedItems, fetchPortfolioItems } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import './PortfolioContent.css';

const PortfolioContent = () => {
    const [featuredItems, setFeaturedItems] = useState([]);
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const { isAdmin } = useAuth();
    const [uploadError, setUploadError] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, [isAdmin]); // Re-run when admin status changes

    const loadInitialData = async () => {
        setLoading(true);
        try {
            console.log('Loading portfolio data with isAdmin:', isAdmin);
            const [featured, portfolio] = await Promise.all([
                fetchFeaturedItems(isAdmin),
                fetchPortfolioItems(undefined, null, isAdmin)
            ]);
            
            setFeaturedItems(featured || []);
            setPortfolioItems(portfolio.items || []);
            setLastVisible(portfolio.lastVisible);
            setHasMore(portfolio.lastVisible !== null);
        } catch (err) {
            console.error('Error loading portfolio data:', err);
            setError('Failed to load portfolio data');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        if (!hasMore || loading) return;
        
        try {
            setLoading(true);
            const result = await fetchPortfolioItems(undefined, lastVisible, isAdmin);
            
            if (result.items && result.items.length > 0) {
                setPortfolioItems(prev => [...prev, ...result.items]);
                setLastVisible(result.lastVisible);
                setHasMore(result.lastVisible !== null);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Error loading more items:', err);
            setError('Failed to load more items');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setEditItem(null);
        setShowEditor(true);
    };

    const handleEditItem = (item) => {
        setEditItem(item);
        setShowEditor(true);
    };

    const handleSaveItem = (success, error) => {
        if (error) {
            setUploadError(error);
            console.error("Upload error:", error);
            // Don't close the editor if there was an error
            return;
        }
        
        setShowEditor(false);
        setUploadError(null);
        loadInitialData();
    };

    const handleCancelEdit = () => {
        setShowEditor(false);
        setEditItem(null);
        setUploadError(null);
    };

    if (error) {
        return <ErrorMessage message={error} onRetry={loadInitialData} />;
    }

    if (showEditor) {
        return (
            <div className="portfolio-page-container">
                {uploadError && (
                    <div className="error-banner">
                        <p>Error saving item: {uploadError}</p>
                        <button onClick={() => setUploadError(null)}>Dismiss</button>
                    </div>
                )}
                <PortfolioItemEditor 
                    initialValues={editItem || {}}
                    onSave={handleSaveItem}
                    onCancel={handleCancelEdit}
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                />
            </div>
        );
    }

    return (
        <>
            {isAdmin && (
                <AdminControls>
                    <button className="add-portfolio-item" onClick={handleAddNew}>
                        Add New Portfolio Item
                    </button>
                </AdminControls>
            )}
            <h1 className="portfolio-page-heading">My Portfolio</h1>
            
            {!loading && featuredItems.length > 0 && (
                <section className="featured-section">
                    <PortfolioCarousel 
                        items={featuredItems} 
                        isAdmin={isAdmin}
                        onEditItem={handleEditItem}
                    />
                </section>
            )}
            <PortfolioGrid 
                items={portfolioItems}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
                loading={loading}
                isAdmin={isAdmin}
                onEditItem={handleEditItem}
            />
        </>
    );
};

export default PortfolioContent;
