import React, { useState } from 'react';
import { createPortfolioItem, deletePortfolioItem } from '../../services/firebase';
import './PortfolioItemEditor.css';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Component for creating or editing portfolio items with image upload
 */
const PortfolioItemEditor = ({ onSave, onCancel, initialValues = {} }) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState(initialValues.title || '');
  const [category, setCategory] = useState(initialValues.category || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [link, setLink] = useState(initialValues.link || '');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialValues.imageUrl || null);
  const [featured, setFeatured] = useState(initialValues.featured || false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Format date as YYYY-MM-DD for the date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0]; // Default to today
    return new Date(dateString).toISOString().split('T')[0];
  };
  
  // Log initial published date value for debugging
  console.log('Initial publishedDate value:', initialValues.publishedDate);
  
  const [publishedDate, setPublishedDate] = useState(
    formatDateForInput(initialValues.publishedDate)
  );
  
  // Log formatted published date after initialization
  console.log('Formatted publishedDate after initialization:', publishedDate);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({...errors, image: 'Image size should be less than 5MB'});
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors({...errors, image: null});
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!category.trim()) newErrors.category = 'Category is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!publishedDate) newErrors.publishedDate = 'Published date is required';
    if (!initialValues.imageUrl && !image) newErrors.image = 'Image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    // Verify user is authenticated before attempting upload
    if (!currentUser) {
      onSave(false, "You must be logged in to upload files.");
      return;
    }
    
    try {
      setLoading(true);
      setErrors({});
      
      // Log current published date before submitting
      console.log('Current publishedDate before submit:', publishedDate);
      
      const portfolioData = {
        title,
        category,
        description,
        link: link || null,
        featured,
        publishedDate,
        // Keep existing image URL if no new image is provided
        ...(initialValues.id && { id: initialValues.id }),
        ...(initialValues.imageUrl && !image && { imageUrl: initialValues.imageUrl })
      };
      
      // Log the complete portfolio data object
      console.log('Portfolio data being submitted:', portfolioData);
      
      // If this is an edit and no new image, pass null for imageFile param
      const result = await createPortfolioItem(portfolioData, image);
      
      // Log the result for debugging
      console.log('Result from createPortfolioItem:', result);
      
      setLoading(false);
      if (onSave) {
        onSave(result);
      }
    } catch (err) {
      setLoading(false);
      setErrors({ submit: `Error saving portfolio item: ${err.message}` });
      console.error('Error saving portfolio item:', err);
    }
  };
  
  const handleDelete = async () => {
    if (!initialValues.id) {
      // Nothing to delete if it's a new item
      return;
    }
    
    if (showDeleteConfirm) {
      try {
        setLoading(true);
        setErrors({});
        
        await deletePortfolioItem(initialValues.id);
        
        setLoading(false);
        if (onSave) {
          // Pass a special flag to indicate item was deleted
          onSave({ deleted: true, id: initialValues.id });
        }
      } catch (err) {
        setLoading(false);
        setErrors({ submit: `Error deleting portfolio item: ${err.message}` });
        console.error('Error deleting portfolio item:', err);
      }
    } else {
      // Show confirmation dialog
      setShowDeleteConfirm(true);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="portfolio-editor-container">
      <h2>{initialValues.id ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}</h2>
      
      {errors.submit && <div className="global-error">{errors.submit}</div>}
      
      {showDeleteConfirm && (
        <div className="delete-confirmation">
          <div className="delete-confirmation-content">
            <h3>Delete Portfolio Item</h3>
            <p>Are you sure you want to delete this portfolio item? This action cannot be undone.</p>
            <div className="delete-confirmation-buttons">
              <button 
                type="button" 
                className="cancel-delete-button" 
                onClick={cancelDelete}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="confirm-delete-button" 
                onClick={handleDelete}
                disabled={loading}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="portfolio-editor-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={errors.title ? 'input-error' : ''}
            disabled={loading}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={errors.category ? 'input-error' : ''}
            disabled={loading}
          />
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className={errors.description ? 'input-error' : ''}
            disabled={loading}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="link">Link (optional)</label>
          <input
            type="url"
            id="link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            disabled={loading}
            placeholder="https://example.com/your-work"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="publishedDate">Published Date *</label>
          <input
            type="date"
            id="publishedDate"
            value={publishedDate}
            onChange={(e) => {
              console.log('Date changed to:', e.target.value);
              setPublishedDate(e.target.value);
            }}
            className={errors.publishedDate ? 'input-error' : ''}
            disabled={loading}
          />
          {errors.publishedDate && <span className="error-message">{errors.publishedDate}</span>}
          <small>Items will only be visible to the public after this date</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Featured Image {!initialValues.imageUrl && '*'}</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className={errors.image ? 'input-error' : ''}
            disabled={loading}
          />
          {errors.image && <span className="error-message">{errors.image}</span>}
          
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            disabled={loading}
          />
          <label htmlFor="featured">Feature this item</label>
        </div>
        
        <div className="form-actions">
          {initialValues.id && (
            <button 
              type="button" 
              className="delete-button" 
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </button>
          )}
          <div className="form-actions-right">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Portfolio Item'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PortfolioItemEditor;