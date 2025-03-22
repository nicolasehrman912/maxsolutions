'use client';

// Constantes para las claves de Local Storage
export const STORAGE_KEYS = {
  ZECAT_CATEGORIES: 'zecat_categories',
  CDO_CATEGORIES: 'cdo_categories',
  CATEGORIES_TIMESTAMP: 'categories_timestamp',
};

// Tiempo de expiración para las categorías almacenadas (24 horas en ms)
const CATEGORIES_EXPIRATION = 24 * 60 * 60 * 1000;

// Using a type to ensure consistent storage format
interface StoredCategoryMap {
  [source: string]: any[];
}

/**
 * Save categories to localStorage for a specific source
 */
export function saveCategories(source: string, categories: any[]): void {
  // Early return if running on server
  if (typeof window === 'undefined') return;

  try {
    // Get existing stored data or create new object
    const storedData = localStorage.getItem('categories');
    const categoryMap: StoredCategoryMap = storedData ? JSON.parse(storedData) : {};
    
    // Update the specific source with new categories
    categoryMap[source] = categories;
    
    // Save back to localStorage
    localStorage.setItem('categories', JSON.stringify(categoryMap));
  } catch (error) {
    // Silently handle localStorage errors
  }
}

/**
 * Get categories from localStorage for a specific source
 */
export function getStoredCategories(source: string): any[] | null {
  // Early return if running on server
  if (typeof window === 'undefined') return null;

  try {
    // Get existing stored data
    const storedData = localStorage.getItem('categories');
    if (!storedData) return null;
    
    // Parse and return categories for the specific source
    const categoryMap: StoredCategoryMap = JSON.parse(storedData);
    return categoryMap[source] || null;
  } catch (error) {
    // If there's an error, return null
    return null;
  }
}

/**
 * Clear all stored categories
 */
export function clearStoredCategories(): void {
  // Early return if running on server
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('categories');
  } catch (error) {
    // Silently handle localStorage errors
  }
} 