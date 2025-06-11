/**
 * Utility functions for preserving scroll position during dynamic content changes
 */

/**
 * Preserves scroll position when executing a function that might change page content
 * @param fn - The function to execute (e.g., a filter toggle)
 * @param delay - Delay in ms before restoring scroll position (default: 50ms)
 */
export function preserveScrollPosition<T extends (...args: any[]) => any>(
	fn: T,
	delay: number = 50
): T {
	return ((...args: Parameters<T>) => {
		// Check if we're in a browser environment
		if (typeof window === 'undefined') {
			return fn(...args);
		}
		
		// Capture current scroll position
		const scrollY = window.scrollY;
		const scrollX = window.scrollX;
		
		// Execute the function (this will change the content)
		const result = fn(...args);
		
		// Restore scroll position after a short delay to allow DOM updates
		requestAnimationFrame(() => {
			setTimeout(() => {
				window.scrollTo(scrollX, scrollY);
			}, delay);
		});
		
		return result;
	}) as T;
}

/**
 * Scroll preservation that works with smooth scroll behavior
 * @param callback - The function to execute that changes content
 * @param delay - Delay in ms before restoring scroll position
 */
export function withScrollPreservation(callback: () => void, delay: number = 150): void {
	// Check if we're in a browser environment
	if (typeof window === 'undefined') {
		callback();
		return;
	}
	
	const scrollY = window.scrollY;
	const scrollX = window.scrollX;
	
	// Store original scroll behavior
	const originalScrollBehavior = document.documentElement.style.scrollBehavior;
	
	// Execute the callback
	callback();
	
	// Function to restore scroll position
	const restorePosition = () => {
		// Temporarily disable smooth scrolling
		document.documentElement.style.scrollBehavior = 'auto';
		
		// Restore position
		window.scrollTo(scrollX, scrollY);
		
		// Restore original scroll behavior after a brief delay
		setTimeout(() => {
			document.documentElement.style.scrollBehavior = originalScrollBehavior;
		}, 100);
	};
	
	// Multiple restore attempts with different timing
	requestAnimationFrame(() => {
		restorePosition();
		
		// Additional attempt after delay
		setTimeout(restorePosition, delay);
	});
}

/**
 * Enhanced version that also preserves the scroll position of specific elements
 * @param callback - The function to execute
 * @param preserveElements - Array of element selectors to preserve scroll position for
 * @param delay - Delay in ms before restoring scroll position
 */
export function withAdvancedScrollPreservation(
	callback: () => void,
	preserveElements: string[] = [],
	delay: number = 50
): void {
	// Check if we're in a browser environment
	if (typeof window === 'undefined') {
		callback();
		return;
	}
	
	// Capture window scroll position
	const windowScrollY = window.scrollY;
	const windowScrollX = window.scrollX;
	
	// Capture scroll positions of specific elements
	const elementScrollPositions: Array<{ element: Element; scrollTop: number; scrollLeft: number }> = [];
	
	preserveElements.forEach(selector => {
		const elements = document.querySelectorAll(selector);
		elements.forEach(element => {
			elementScrollPositions.push({
				element,
				scrollTop: element.scrollTop,
				scrollLeft: element.scrollLeft
			});
		});
	});
	
	// Execute the callback
	callback();
	
	// Restore scroll positions
	requestAnimationFrame(() => {
		setTimeout(() => {
			// Restore window scroll position
			window.scrollTo(windowScrollX, windowScrollY);
			
			// Restore element scroll positions
			elementScrollPositions.forEach(({ element, scrollTop, scrollLeft }) => {
				element.scrollTop = scrollTop;
				element.scrollLeft = scrollLeft;
			});
		}, delay);
	});
}

/**
 * Preserves only the scroll position of specific elements without affecting window scroll
 * This is ideal for sidebar filters where we want to keep the sidebar position stable
 * but allow the main content area to update naturally
 * @param callback - The function to execute
 * @param preserveElements - Array of element selectors to preserve scroll position for
 * @param delay - Delay in ms before restoring scroll position
 */
export function withElementScrollPreservation(
	callback: () => void,
	preserveElements: string[] = [],
	delay: number = 50
): void {
	// Check if we're in a browser environment
	if (typeof window === 'undefined') {
		callback();
		return;
	}
	
	// Capture scroll positions of specific elements only
	const elementScrollPositions: Array<{ element: Element; scrollTop: number; scrollLeft: number }> = [];
	
	preserveElements.forEach(selector => {
		const elements = document.querySelectorAll(selector);
		elements.forEach(element => {
			elementScrollPositions.push({
				element,
				scrollTop: element.scrollTop,
				scrollLeft: element.scrollLeft
			});
		});
	});
	
	// Execute the callback
	callback();
	
	// Restore only element scroll positions (not window scroll)
	requestAnimationFrame(() => {
		setTimeout(() => {
			elementScrollPositions.forEach(({ element, scrollTop, scrollLeft }) => {
				element.scrollTop = scrollTop;
				element.scrollLeft = scrollLeft;
			});
		}, delay);
	});
}
