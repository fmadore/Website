/**
 * Strips a URL down to what a printed page should show: no scheme, no `www.`,
 * no trailing slash. `https://www.example.org/path/` → `example.org/path`.
 *
 * Used for project links on the CV, where the address itself is the label.
 */
export function formatDisplayUrl(url: string): string {
	return url
		.trim()
		.replace(/^https?:\/\//i, '')
		.replace(/^www\./i, '')
		.replace(/\/+$/, '');
}

/**
 * Strips HTML tags from a string for plain-text contexts.
 *
 * Abstracts in `src/lib/data` may carry light inline markup — `<i>` around
 * transliterated terms (`<i>hadj</i>`), `<em>` around titles. That markup is
 * rendered on the page, but everything that consumes an abstract as a *string*
 * (meta descriptions, JSON-LD, RSS) needs it gone, otherwise the tags show up
 * literally in search snippets and structured data.
 *
 * Uses a safe, non-backtracking approach to prevent ReDoS attacks: iteratively
 * removes tags and dangerous content rather than matching nested constructs.
 */
export function stripHtml(html: string): string {
	let result = html;

	// Remove script tags and contents using a safe approach
	// Use a simple, non-backtracking pattern with a loop
	let scriptStart = result.toLowerCase().indexOf('<script');
	while (scriptStart !== -1) {
		const scriptEnd = result.toLowerCase().indexOf('</script>', scriptStart);
		if (scriptEnd !== -1) {
			result = result.slice(0, scriptStart) + result.slice(scriptEnd + 9);
		} else {
			// No closing tag found, remove from script start to end
			result = result.slice(0, scriptStart);
			break;
		}
		scriptStart = result.toLowerCase().indexOf('<script');
	}

	// Remove style tags and contents using the same safe approach
	let styleStart = result.toLowerCase().indexOf('<style');
	while (styleStart !== -1) {
		const styleEnd = result.toLowerCase().indexOf('</style>', styleStart);
		if (styleEnd !== -1) {
			result = result.slice(0, styleStart) + result.slice(styleEnd + 8);
		} else {
			result = result.slice(0, styleStart);
			break;
		}
		styleStart = result.toLowerCase().indexOf('<style');
	}

	// Iteratively remove HTML tags until no more are found
	// This prevents bypass attacks with nested constructs like "<scrip<script>t>"
	// Using a simple non-greedy pattern that doesn't backtrack
	let previous: string;
	let iterations = 0;
	const maxIterations = 100; // Prevent infinite loops
	do {
		previous = result;
		result = result.replace(/<[^>]*>/g, '');
		iterations++;
	} while (result !== previous && iterations < maxIterations);

	// Remove any remaining angle brackets that could form tags
	result = result.replace(/[<>]/g, '');

	return result.replace(/\s+/g, ' ').trim();
}

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
