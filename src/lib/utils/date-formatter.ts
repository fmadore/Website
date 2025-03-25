/**
 * Formats an ISO date string (YYYY-MM-DD) to a display format (e.g., "21 March 2025")
 * @param isoDate Date string in ISO format (YYYY-MM-DD)
 * @returns Formatted date string for display
 */
export function formatDisplayDate(isoDate: string): string {
    if (!isoDate || !isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return isoDate; // Return as is if not in ISO format
    }
    
    const date = new Date(isoDate);
    
    // Format the date as "DD Month YYYY"
    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Extracts the year from an ISO date string
 * @param isoDate Date string in ISO format (YYYY-MM-DD)
 * @returns Year as number
 */
export function getYearFromISODate(isoDate: string): number {
    if (!isoDate || !isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date().getFullYear(); // Return current year as fallback
    }
    
    return parseInt(isoDate.split('-')[0], 10);
} 