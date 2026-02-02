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

/**
 * Intelligently truncates text while preserving sentence boundaries or word breaks.
 *
 * This function attempts to find natural break points in text:
 * 1. First, it looks for complete sentences (ending with . ? !) within the limit
 * 2. If no good sentence break exists, it truncates at a word boundary
 * 3. Falls back to hard truncation only if necessary
 *
 * Useful for creating SEO descriptions that remain readable.
 *
 * @param text The text to truncate
 * @param maxLength Maximum length of the result (including ellipsis if added)
 * @param minBreakRatio Minimum position (as ratio of maxLength) for a valid break point (default: 0.6)
 * @returns Truncated text, potentially with ellipsis
 *
 * @example
 * smartTruncate("This is a sentence. This is another.", 30)
 * // Returns: "This is a sentence."
 *
 * @example
 * smartTruncate("A very long text without sentence breaks here", 20)
 * // Returns: "A very long text..."
 */
export function smartTruncate(
	text: string,
	maxLength: number,
	minBreakRatio: number = 0.6
): string {
	if (text.length <= maxLength) return text;

	// Find the last complete sentence within the limit
	const truncated = text.substring(0, maxLength);
	const lastSentenceEnd = Math.max(
		truncated.lastIndexOf('. '),
		truncated.lastIndexOf('? '),
		truncated.lastIndexOf('! ')
	);

	const minBreakPosition = maxLength * minBreakRatio;

	if (lastSentenceEnd > minBreakPosition) {
		// If we have a good sentence break, use it
		return text.substring(0, lastSentenceEnd + 1).trim();
	}

	// Otherwise, truncate at word boundary and add ellipsis
	const lastSpace = truncated.lastIndexOf(' ');
	return lastSpace > minBreakPosition
		? text.substring(0, lastSpace) + '...'
		: text.substring(0, maxLength - 3) + '...';
}
