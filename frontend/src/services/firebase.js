import { getFunctions, httpsCallable } from "firebase/functions";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { getAuth } from "firebase/auth";

const functions = getFunctions(undefined, 'asia-southeast1');
const storage = getStorage();
const auth = getAuth();

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

export const fetchPortfolioItems = async (pageSize = ITEMS_PER_PAGE.PORTFOLIO, lastVisible = null, isAdmin = false) => {
    try {
        const params = {
            pageSize: parseInt(pageSize),
            isAdmin: Boolean(isAdmin),
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

export const fetchFeaturedItems = async (isAdmin = false) => {
    console.log('Fetching featured items, isAdmin:', isAdmin);
    try {
        const result = await getPortfolio({ 
            featured: true, 
            pageSize: 10,
            isAdmin: Boolean(isAdmin)
        });
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

/**
 * Uploads an image to Firebase Storage
 * @param {File} file - The file object to upload
 * @param {string} path - The storage path where the file should be saved
 * @returns {Promise<string>} - A promise that resolves to the download URL
 */
export const uploadImage = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

/**
 * Uploads an image to Firebase Storage for portfolio items
 * @param {File} file - The file to upload
 * @param {string} [token] - Optional authentication token
 * @returns {Promise<string>} The download URL of the uploaded file
 */
export const uploadPortfolioImage = async (file, token) => {
  if (!file) return null;
  
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `portfolio/${fileName}`);
    
    // Include auth token in metadata if provided
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: auth.currentUser ? auth.currentUser.uid : 'unknown'
      }
    };
    
    // Start the upload task
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
    // Return a promise that resolves with the download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Optional: Track upload progress if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% complete`);
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error("Upload failed:", error.code, error.message);
          
          // Provide more specific error messages
          if (error.code === 'storage/unauthorized') {
            reject(new Error('You do not have permission to upload files. Please make sure you are logged in with an admin account.'));
          } else {
            reject(error);
          }
        },
        async () => {
          // Handle successful upload
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (urlError) {
            reject(urlError);
          }
        }
      );
    });
  } catch (error) {
    console.error("Error starting upload:", error);
    throw error;
  }
};

/**
 * Creates a portfolio item with an uploaded image
 * @param {Object} portfolioData - The portfolio item data
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} - A promise that resolves to the created portfolio item
 */
export const createPortfolioItem = async (portfolioData, imageFile) => {
  try {
    // Log input data with publishedDate
    console.log('createPortfolioItem received data:', portfolioData);
    console.log('publishedDate from input:', portfolioData.publishedDate);
    
    // 1. Upload image first if provided
    let imageURL = null;
    if (imageFile) {
      const imagePath = `portfolio/${Date.now()}_${imageFile.name}`;
      imageURL = await uploadImage(imageFile, imagePath);
    }
    
    // 2. Prepare portfolio data with image URL
    const portfolioItemData = {
      ...portfolioData,
      ...(imageURL && { imageUrl: imageURL }),
      // Ensure publishedDate is properly formatted if it exists
      ...(portfolioData.publishedDate && { 
        publishedDate: portfolioData.publishedDate 
      }),
      createdAt: new Date().toISOString()
    };
    
    // Log the final data being sent to the cloud function
    console.log('Final portfolioItemData being sent to cloud function:', portfolioItemData);
    
    // 3. Save to Firestore through Cloud Function
    const createPortfolioItemFn = httpsCallable(functions, 'create_portfolio_item');
    const result = await createPortfolioItemFn(portfolioItemData);
    console.log('Cloud function response for portfolio item:', result);
    return result.data;
  } catch (error) {
    console.error("Error creating portfolio item:", error);
    throw error;
  }
};

/**
 * Deletes a portfolio item by ID
 * @param {string} id - The ID of the portfolio item to delete
 * @returns {Promise<Object>} - A promise that resolves when the item is deleted
 */
export const deletePortfolioItem = async (id) => {
  if (!id) {
    throw new Error('Portfolio item ID is required for deletion');
  }
  
  try {
    console.log(`Deleting portfolio item with ID: ${id}`);
    
    // Create a reference to the delete_portfolio_item cloud function
    const deletePortfolioItemFn = httpsCallable(functions, 'delete_portfolio_item');
    
    // Call the cloud function with the item ID
    const result = await deletePortfolioItemFn({ id });
    console.log('Portfolio item deleted successfully:', result);
    return result.data;
  } catch (error) {
    console.error(`Error deleting portfolio item with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Uploads an image to Firebase Storage for blog posts
 * @param {File} file - The file to upload
 * @returns {Promise<string>} The download URL of the uploaded file
 */
export const uploadBlogImage = async (file) => {
  if (!file) return null;
  
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `blog/${fileName}`);
    
    // Include auth information in metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: auth.currentUser ? auth.currentUser.uid : 'unknown'
      }
    };
    
    // Start the upload task
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
    // Return a promise that resolves with the download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Optional: Track upload progress if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Blog image upload is ${progress}% complete`);
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error("Blog image upload failed:", error.code, error.message);
          
          // Provide more specific error messages
          if (error.code === 'storage/unauthorized') {
            reject(new Error('You do not have permission to upload files. Please make sure you are logged in with an admin account.'));
          } else {
            reject(error);
          }
        },
        async () => {
          // Handle successful upload
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (urlError) {
            reject(urlError);
          }
        }
      );
    });
  } catch (error) {
    console.error("Error starting blog image upload:", error);
    throw error;
  }
};

/**
 * Creates a new blog post
 * @param {Object} blogData - The blog post data
 * @returns {Promise<Object>} - A promise that resolves to the created blog post
 */
export const createBlogPost = async (blogData) => {
  try {
    console.log('Creating blog post with data:', blogData);
    
    // Create a reference to the create_blog_post cloud function
    const createBlogPostFn = httpsCallable(functions, 'create_blog_post');
    
    // Prepare blog data with current timestamp
    const postData = {
      ...blogData,
      createdAt: new Date().toISOString()
    };
    
    // Call the cloud function with the blog data
    const result = await createBlogPostFn(postData);
    console.log('Blog post created successfully:', result);
    return result.data;
  } catch (error) {
    console.error("Error creating blog post:", error);
    throw error;
  }
};

/**
 * Updates an existing blog post
 * @param {string} id - The ID of the blog post to update
 * @param {Object} blogData - The updated blog post data
 * @returns {Promise<Object>} - A promise that resolves to the updated blog post
 */
export const updateBlogPost = async (id, blogData) => {
  if (!id) {
    throw new Error('Blog post ID is required for update');
  }
  
  try {
    console.log(`Updating blog post with ID: ${id}`, blogData);
    
    // Create a reference to the update_blog_post cloud function
    const updateBlogPostFn = httpsCallable(functions, 'update_blog_post');
    
    // Prepare blog data with ID and update timestamp
    const postData = {
      ...blogData,
      id,
      updatedAt: new Date().toISOString()
    };
    
    // Call the cloud function with the blog data
    const result = await updateBlogPostFn(postData);
    console.log('Blog post updated successfully:', result);
    return result.data;
  } catch (error) {
    console.error(`Error updating blog post with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes a blog post by ID
 * @param {string} id - The ID of the blog post to delete
 * @returns {Promise<Object>} - A promise that resolves when the post is deleted
 */
export const deleteBlogPost = async (id) => {
  if (!id) {
    throw new Error('Blog post ID is required for deletion');
  }
  
  try {
    console.log(`Deleting blog post with ID: ${id}`);
    
    // Create a reference to the delete_blog_post cloud function
    const deleteBlogPostFn = httpsCallable(functions, 'delete_blog_post');
    
    // Call the cloud function with the post ID
    const result = await deleteBlogPostFn({ id });
    console.log('Blog post deleted successfully:', result);
    return result.data;
  } catch (error) {
    console.error(`Error deleting blog post with ID ${id}:`, error);
    throw error;
  }
};