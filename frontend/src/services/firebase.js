import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions(undefined, 'asia-southeast1');
const ITEMS_PER_PAGE = {
    BLOGS: 3,
    PORTFOLIO: 4
};

// Initialize callable functions
const getBlogs = httpsCallable(functions, 'get_blogs');
const getPortfolio = httpsCallable(functions, 'get_portfolio');
const search = httpsCallable(functions, 'search');
const saveContact = httpsCallable(functions, 'save_contact');

export const fetchBlogPosts = async (pageSize = ITEMS_PER_PAGE.BLOGS, lastVisible = null) => {
    try {
        const params = {
            pageSize: parseInt(pageSize),
            ...(lastVisible && { lastVisible })
        };
        console.log('Fetching blogs with params:', params);
        const result = await getBlogs(params);
        console.log('Fetched blog posts:', result.data);
        // Unwrap the triple-nested structure:
        // 1. result.data (from httpsCallable)
        // 2. .data (from response_data in Cloud Function)
        // 3. actual data object with items and lastVisible
        return result.data;
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        throw error;
    }
};

export const fetchPortfolioItems = async (pageSize = ITEMS_PER_PAGE.PORTFOLIO, lastVisible = null) => {
    try {
        const params = {
            pageSize: parseInt(pageSize),
            ...(lastVisible && { lastVisible })
        };
        console.log('Fetching portfolio items with params:', params);
        const result = await getPortfolio(params);
        return result.data; // Cloud Functions returns our response directly
    } catch (error) {
        console.error('Error fetching portfolio items:', error);
        throw error;
    }
};

export const fetchFeaturedItems = async () => {
    console.log('Fetching featured items');
    try {
        const result = await getPortfolio({ featured: true, pageSize: 10 });
        return result.data.items || [];
    } catch (error) {
        console.error('Error fetching featured items:', error);
        throw error;
    }
};

export const fetchBlogPost = async (id) => {
    try {
        console.log('Fetching blogpost with id:', id);
        const result = await getBlogs({ id });
        console.log('Fetched blog post result:', result);
        return result.data;
    } catch (error) {
        console.error('Error fetching blog post:', error);
        throw error;
    }
};

export const searchItems = async (query, type = 'blog', limit = 10) => {
    try {
        const result = await search({ query, type, limit });
        return result.data.items;
    } catch (error) {
        console.error('Error searching items:', error);
        throw error;
    }
};

export const saveContactInfo = async (contactData) => {
    try {
        const response = await saveContact(contactData);
        return response.data;
    } catch (error) {
        console.error('Error saving contact:', error);
        throw error;
    }
};

// Usage example
// saveContactInfo({
//     email: 'example@example.com',
//     firstName: 'John',
//     lastName: 'Doe',
//     phone: '1234567890',
//     country: 'USA'
// }).then(response => console.log('Contact saved:', response));