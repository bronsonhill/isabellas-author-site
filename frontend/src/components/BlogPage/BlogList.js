import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBlogPosts } from '../../services/firebase';
import BlogCard from './BlogCard';
import './BlogList.css';

/**
 * BlogList component displays a paginated list of blog posts with infinite scroll
 * Handles loading states, errors, and animations for new posts
 */
const BlogList = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [animateFrom, setAnimateFrom] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const itemsPerPage = 3;

    useEffect(() => {
        loadInitialPosts();
    }, []);

    // Update animateFrom whenever posts length changes
    useEffect(() => {
        setAnimateFrom(posts.length - (posts.length % itemsPerPage || itemsPerPage));
    }, [posts.length]);

    const loadInitialPosts = async () => {
        try {
            setLoading(true);
            const result = await fetchBlogPosts(itemsPerPage);
            console.log('Initial posts loaded:', result);
            if (result?.error) {
                throw new Error(result.error);
            }
            setPosts(result?.items || []);
            setLastVisible(result?.lastVisible);
            setHasMore(result?.lastVisible !== null);
        } catch (err) {
            console.error('Error loading blog posts:', err);
            setError(err?.message || 'Failed to load blog posts');
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (e, blog) => {
        if (e.target.className === 'read-more') {
            return;
        }
        navigate(`/blogs/${blog.id}`, { state: { blog } });
    };

    const handleReadMore = (e, blog) => {
        e.stopPropagation();
        navigate(`/blogs/${blog.id}`, { state: { blog } });
    };

    const showMoreItems = async () => {
        if (!hasMore || loading) return;

        try {
            setLoading(true);
            setAnimateFrom(posts.length);
            const result = await fetchBlogPosts(itemsPerPage, lastVisible);
            
            if (result?.error) {
                throw new Error(result.error);
            }

            if (result?.items?.length > 0) {
                setPosts(prev => [...prev, ...result.items]);
                setLastVisible(result.lastVisible);
                setHasMore(result.lastVisible !== null);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Error loading more posts:', err);
            setError(err?.message || 'Failed to load more posts');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="blog-list-error">
                <p>{error}</p>
                <button onClick={loadInitialPosts}>Try Again</button>
            </div>
        );
    }

    if (loading && posts.length === 0) {
        return <div className="blog-list-loading">Loading posts...</div>;
    }

    return (
        <div className="blog-list">
            {posts.map((blog, index) => (
                <BlogCard
                    key={blog.id}
                    blog={blog}
                    onCardClick={handleCardClick}
                    onReadMore={handleReadMore}
                    shouldAnimate={index >= animateFrom}
                />
            ))}
            {hasMore && (
                <div className="load-more-container">
                    <button 
                        className="load-more-button"
                        onClick={showMoreItems}
                        disabled={loading}
                        aria-label="Load more blog posts"
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default BlogList;