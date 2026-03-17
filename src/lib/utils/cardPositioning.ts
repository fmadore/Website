/**
 * Card positioning utilities for preview cards and popover elements.
 *
 * Extracted from ReferencePreviewCard.svelte to allow reuse across components
 * that need viewport-aware positioning logic.
 */

export interface CardPosition {
	cardLeft: string;
	arrowLeft: string;
	shouldPositionBelow: boolean;
	cardMaxHeight: string | null;
	hasOverflow: boolean;
}

/**
 * Calculate the position of a preview card relative to a reference element,
 * ensuring it stays within the viewport bounds.
 *
 * Handles both horizontal centering (with overflow correction) and vertical
 * placement (above or below the reference, with max-height constraints when
 * viewport space is limited).
 *
 * @param referenceElement - The DOM element the card is anchored to
 * @param cardElement - The card DOM element being positioned
 * @param margin - Minimum margin from viewport edges in pixels (default: 16)
 * @returns A CardPosition object with CSS values for positioning
 */
export function calculateCardPosition(
	referenceElement: HTMLElement,
	cardElement: HTMLElement,
	margin: number = 16
): CardPosition {
	const refRect = referenceElement.getBoundingClientRect();
	const cardWidth = cardElement.offsetWidth;
	const cardHeight = cardElement.offsetHeight;
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	// ===== HORIZONTAL POSITIONING =====
	// Calculate how much the card would overflow on each side if centered on refCenter
	const refCenter = refRect.left + refRect.width / 2;
	const halfCardWidth = cardWidth / 2;
	const leftOverflow = halfCardWidth - refCenter;
	const rightOverflow = refCenter + halfCardWidth - viewportWidth;

	// Calculate the horizontal offset to keep card fully in viewport
	let horizontalOffset = 0;

	if (leftOverflow > 0) {
		// Would overflow left edge, shift right
		horizontalOffset = leftOverflow + margin;
	} else if (rightOverflow > 0) {
		// Would overflow right edge, shift left
		horizontalOffset = -rightOverflow - margin;
	}

	const cardLeft = `calc(50% + ${horizontalOffset}px)`;
	const arrowLeft = `calc(50% - ${horizontalOffset}px)`;

	// ===== VERTICAL POSITIONING =====
	// Check if card would overflow viewport vertically
	const spaceAbove = refRect.top;
	const spaceBelow = viewportHeight - refRect.bottom;

	// Determine if we should position above or below
	const shouldPositionBelow = spaceAbove < cardHeight + margin && spaceBelow > spaceAbove;

	let cardMaxHeight: string | null = null;
	let hasOverflow = false;

	if (shouldPositionBelow) {
		// Check if it fits below, otherwise constrain height
		if (spaceBelow < cardHeight + margin) {
			cardMaxHeight = `${spaceBelow - margin}px`;
			hasOverflow = true;
		}
	} else {
		// Position above the reference (default)
		// Check if it fits above, otherwise constrain height
		if (spaceAbove < cardHeight + margin) {
			cardMaxHeight = `${spaceAbove - margin}px`;
			hasOverflow = true;
		}
	}

	return {
		cardLeft,
		arrowLeft,
		shouldPositionBelow,
		cardMaxHeight,
		hasOverflow
	};
}

/**
 * Get display year from a publication or communication item.
 *
 * Tries dateISO first, then date, then year. Returns 'N/D' if none are available.
 *
 * @param item - An object with optional dateISO, date, or year fields
 * @returns A 4-digit year string or 'N/D'
 */
export function getItemYear(item: { dateISO?: string; date?: string; year?: number }): string {
	if (item.dateISO) return item.dateISO.substring(0, 4);
	if (item.date) return item.date.substring(0, 4);
	if (item.year) return item.year.toString();
	return 'N/D';
}
