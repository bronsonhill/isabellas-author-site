import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBlogPosts } from '../../services/firebase';
import BlogCard from './BlogCard';
import './BlogList.css';

/**
 * BlogList component displays a list of blog posts with infinite scroll
 * Automatically loads more posts when user scrolls to the bottom
 * Handles loading states, errors, and animations for new posts
 */
const BlogList = ({ onEditPost }) => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [animateFrom, setAnimateFrom] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef(null);
    const loaderRef = useRef(null);
    const ITEMS_PER_PAGE = 3;
    const isAdmin = Boolean(onEditPost);

    useEffect(() => {
        loadInitialPosts();
    }, []);

    // Update animateFrom whenever posts length changes
    useEffect(() => {
        setAnimateFrom(posts.length - (posts.length % ITEMS_PER_PAGE || ITEMS_PER_PAGE));
    }, [posts.length]);

    const loadInitialPosts = async () => {
        try {
            setLoading(true);
            const result = await fetchBlogPosts(ITEMS_PER_PAGE);
            
            if (result?.error) {
                throw new Error(result.error);
            }
            
            setPosts(result?.items || []);
            setLastVisible(result?.lastVisible);
            setHasMore(result?.lastVisible !== null);
        } catch (err) {
            setError(err?.message || 'Failed to load blog posts');
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (e, blog) => {
        // Check if the edit button was clicked
        if (e.target.closest('.blog-card-edit-btn')) {
            e.stopPropagation();
            if (onEditPost) {
                onEditPost(blog);
            }
        } else {
            navigate(`/blogs/${blog.id}`, { state: { blog } });
        }
    };

    const loadMorePosts = useCallback(async () => {
        if (!hasMore || loading) return;
        
        try {
            setLoading(true);
            setAnimateFrom(posts.length);
            const result = await fetchBlogPosts(ITEMS_PER_PAGE, lastVisible);
            
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
            setError(err?.message || 'Failed to load more posts');
        } finally {
            setLoading(false);
        }
    }, [hasMore, loading, posts.length, lastVisible]);

    // Setup IntersectionObserver to detect when user scrolls to loader element
    useEffect(() => {
        if (loading) return;

        // Disconnect any existing observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        // Create a new observer
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMorePosts();
                }
            },
            { threshold: 0.1 }
        );
        
        observerRef.current = observer;
        
        // Observe the loader element if it exists and we have more content
        if (loaderRef.current && hasMore) {
            observer.observe(loaderRef.current);
        }

        // Cleanup
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loading, hasMore, loadMorePosts]);

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
                <div key={blog.id} className="blog-card-container">
                    <BlogCard
                        blog={blog}
                        onCardClick={handleCardClick}
                        shouldAnimate={index >= animateFrom}
                    />
                    {isAdmin && (
                        <button 
                            className="blog-card-edit-btn" 
                            onClick={(e) => handleCardClick(e, blog)}
                            aria-label={`Edit ${blog.title}`}
                        >
                            Edit
                        </button>
                    )}
                </div>
            ))}
            
            {/* Invisible loading indicator that triggers more content when scrolled into view */}
            {hasMore && (
                <div 
                    className="blog-list-loader" 
                    ref={loaderRef}
                    aria-hidden="true"
                >
                    {loading && <div className="loader-spinner">Loading...</div>}
                </div>
            )}
        </div>
    );
};

export default BlogList;