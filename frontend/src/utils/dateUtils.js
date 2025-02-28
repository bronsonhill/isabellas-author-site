/**
 * Date utility functions for formatting and manipulating dates
 */

/**
 * Formats a date string (YYYY-MM-DD) to a display format for portfolio items
 * Returns a string like "June 2023" or "2023" depending on format option
 * 
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {string} format - Format option ('month-year' or 'year')
 * @returns {string} Formatted date string
 */
export const formatPortfolioDate = (dateStr, format = 'month-year') => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    
    // Return empty string for invalid dates
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format: ${dateStr}`);
      return '';
    }
    
    if (format === 'year') {
      return date.getFullYear().toString();
    }
    
    // Default format is month and year
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error(`Error formatting date: ${dateStr}`, error);
    return '';
  }
};

/**
 * Parses a date string in YYYY-MM-DD format and returns a date object
 * 
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date|null} Date object or null if invalid
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}`, error);
    return null;
  }
};