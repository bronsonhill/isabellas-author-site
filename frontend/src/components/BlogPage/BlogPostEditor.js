import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost, 
  uploadBlogImage 
} from '../../services/firebase';
import './BlogPostEditor.css';

const BlogPostEditor = ({ postToEdit, onClose, onSave }) => {
  const { currentUser, isAdmin } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [tag, setTag] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);

  // Load existing data if editing
  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title || '');
      setContent(postToEdit.content || '');
      setDate(postToEdit.publishedDate || postToEdit.date ? 
        new Date(postToEdit.publishedDate || postToEdit.date).toISOString().split('T')[0] : '');
      setTag(postToEdit.tag || '');
      setImageUrl(postToEdit.imageUrl || '');
    } else {
      // Default date to today for new posts
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [postToEdit]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!content.trim()) newErrors.content = 'Content is required';
    if (!date) newErrors.date = 'Date is required';
    if (!postToEdit && !imageFile && !imageUrl) newErrors.image = 'Image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image must be less than 5MB' });
      return;
    }

    setImageFile(file);
    setErrors({ ...errors, image: null });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      alert('You do not have permission to perform this action');
      return;
    }

    if (!validate()) return;

    setLoading(true);
    try {
      let finalImageUrl = imageUrl;
      
      // Upload new image if one was selected
      if (imageFile) {
        finalImageUrl = await uploadBlogImage(imageFile);
      }

      const blogPostData = {
        title,
        content,
        publishedDate: new Date(date).toISOString(),
        tag: tag.trim() || null,
        imageUrl: finalImageUrl
      };

      if (postToEdit) {
        await updateBlogPost(postToEdit.id, blogPostData);
      } else {
        await createBlogPost(blogPostData);
      }

      // Reset form and close
      resetForm();
      onSave();
    } catch (error) {
      console.error('Error saving blog post:', error);
      setErrors({ submit: 'Failed to save blog post. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin || !postToEdit) return;

    setLoading(true);
    try {
      await deleteBlogPost(postToEdit.id);
      resetForm();
      onSave();
    } catch (error) {
      console.error('Error deleting blog post:', error);
      setErrors({ submit: 'Failed to delete blog post. Please try again.' });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setDate(new Date().toISOString().split('T')[0]);
    setTag('');
    setImageFile(null);
    setImageUrl('');
    setImagePreview('');
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isAdmin) {
    return <p>You do not have permission to access this feature.</p>;
  }

  return (
    <div className="blog-post-editor">
      <h2>{postToEdit ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
      
      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={errors.title ? 'input-error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Content * (Markdown supported)</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="15"
            className={errors.content ? 'input-error' : ''}
            placeholder="Markdown formatting is supported. Use **bold**, *italic*, [links](url), etc."
          ></textarea>
          {errors.content && <span className="error-message">{errors.content}</span>}
          <div className="markdown-help">
            <details>
              <summary>Markdown formatting guide</summary>
              <div className="markdown-help-content">
                <p><code># Heading 1</code> - Creates a large heading</p>
                <p><code>## Heading 2</code> - Creates a medium heading</p>
                <p><code>**Bold text**</code> - Makes text <strong>bold</strong></p>
                <p><code>*Italic text*</code> - Makes text <em>italic</em></p>
                <p><code>[Link text](https://example.com)</code> - Creates a link</p>
                <p><code>![Alt text](image-url.jpg)</code> - Inserts an image</p>
                <p><code>- Item</code> - Creates a bullet list</p>
                <p><code>1. Item</code> - Creates a numbered list</p>
                <p><code>```code block```</code> - Formats text as code</p>
                <p><code>> Quote</code> - Creates a blockquote</p>
              </div>
            </details>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Published Date * (when blog post will appear)</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={errors.date ? 'input-error' : ''}
          />
          {errors.date && <span className="error-message">{errors.date}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="tag">Tag (optional)</label>
          <input
            type="text"
            id="tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g., News, Update, Feature"
            maxLength={20}
          />
        </div>
        
        
        <div className="form-group">
          <label htmlFor="image">Featured Image {!postToEdit && '*'}</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className={errors.image ? 'input-error' : ''}
          />
          {errors.image && <span className="error-message">{errors.image}</span>}
          
          {(imagePreview || imageUrl) && (
            <div className="image-preview">
              <img src={imagePreview || imageUrl} alt="Preview" />
            </div>
          )}
        </div>
        
        {errors.submit && <div className="global-error">{errors.submit}</div>}
        
        <div className="form-actions">
          <div className="form-actions-right">
            <button type="button" className="cancel-button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save Blog Post'}
            </button>
            {postToEdit && (
              <button
                type="button"
                className="delete-button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </form>
      
      {showDeleteConfirm && (
        <div className="delete-confirmation">
          <div className="delete-confirmation-content">
            <h3>Delete Blog Post</h3>
            <p>Are you sure you want to delete this blog post? This action cannot be undone.</p>
            <div className="delete-confirmation-buttons">
              <button 
                className="cancel-delete-button" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-button" 
                onClick={handleDelete} 
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostEditor;