/**
 * Truncates a string to a specified maximum length and appends an ellipsis.
 * 
 * @param text The string to truncate.
 * @param maxLength The maximum length of the truncated string (including the ellipsis).
 * @returns The truncated string or the original string if it's shorter than maxLength.
 */
export function truncateAbstract(text: string | undefined, maxLength: number = 200): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
} 