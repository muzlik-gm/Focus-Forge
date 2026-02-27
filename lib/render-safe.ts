/**
 * Utility functions to safely render values in React components
 * Prevents "Objects are not valid as a React child" errors
 */

/**
 * Safely converts any value to a string for rendering
 * @param value - Any value that might be an object
 * @returns A string representation safe for React rendering
 */
export function toSafeString(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  // If it's a Date object
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  // If it's an array, join with commas
  if (Array.isArray(value)) {
    return value.map(toSafeString).join(', ');
  }
  
  // If it's an object, try to extract common properties
  if (typeof value === 'object') {
    // Try common property names in order of priority
    if ('name' in value && typeof value.name === 'string') {
      return value.name;
    }
    if ('title' in value && typeof value.title === 'string') {
      return value.title;
    }
    if ('label' in value && typeof value.label === 'string') {
      return value.label;
    }
    if ('key' in value && typeof value.key === 'string') {
      return value.key;
    }
    if ('message' in value && typeof value.message === 'string') {
      return value.message;
    }
    if ('text' in value && typeof value.text === 'string') {
      return value.text;
    }
    if ('value' in value && (typeof value.value === 'string' || typeof value.value === 'number')) {
      return String(value.value);
    }
    
    // Last resort: convert to JSON string (for debugging)
    console.warn('[toSafeString] Rendering object as JSON:', value);
    return JSON.stringify(value);
  }
  
  return String(value);
}

/**
 * Safely renders a value, returning empty string for null/undefined
 * @param value - Any value to render
 * @returns The value if it's safe to render, empty string otherwise
 */
export function safeRender(value: any): string | number | boolean {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  
  // If it's an object, convert to safe string
  return toSafeString(value);
}
