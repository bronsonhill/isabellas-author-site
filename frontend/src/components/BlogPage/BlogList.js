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
    const itemsPerPage = 3;

    useEffect(() => {
        loadInitialPosts();
    }, []);

    const loadInitialPosts = async () => {
        try {
            setLoading(true);
            const { items, lastVisible: last } = await fetchBlogPosts(itemsPerPage);
            setPosts(items);
            setLastVisible(last);
        } catch (err) {
            setError('Failed to load blog posts');
            console.error('Error loading blog posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (e, blogId) => {
        if (e.target.className === 'read-more') {
            return;
        }
        navigate(`/blogs/${blogId}`);
    };

    const handleReadMore = (e, blogId) => {
        e.stopPropagation();
        navigate(`/blogs/${blogId}`);
    };

    const showMoreItems = async () => {
        if (!lastVisible || loading) return;

        try {
            setLoading(true);
            setAnimateFrom(posts.length);
            const { items, lastVisible: last } = await fetchBlogPosts(itemsPerPage, lastVisible);
            setPosts(prev => [...prev, ...items]);
            setLastVisible(last);
        } catch (err) {
            setError('Failed to load more posts');
            console.error('Error loading more posts:', err);
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
            {lastVisible && (
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