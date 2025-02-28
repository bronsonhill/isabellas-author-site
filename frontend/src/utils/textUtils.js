/**
 * Utility functions for text processing
 */

/**
 * Calculate estimated reading time based on word count
 * @param {string} text - The text content to analyze
 * @param {number} wordsPerMinute - Average reading speed (default: 150 words per minute)
 * @returns {string} - Formatted reading time (e.g., "3 min read")
 */
export const calculateReadTime = (text, wordsPerMinute = 150) => {
  if (!text) return '1 min read';
  
  // Count words by splitting on whitespace
  const wordCount = text.trim().split(/\s+/).length;
  
  // Calculate minutes
  const minutes = Math.max(1, Math.round(wordCount / wordsPerMinute));
  
  return `${minutes} min read`;
};