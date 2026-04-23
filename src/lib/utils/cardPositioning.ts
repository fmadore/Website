/**
 * Card positioning utilities for preview cards and popover elements.
 *
 * Extracted from ReferencePreviewCard.svelte to allow reuse across components
 * that need viewport-aware positioning logic.
 *
 * The card uses `position: fixed` and these utilities return viewport-relative
 * pixel coordinates, so positioning is independent of the reference element's
 * display/box model. That matters because references are now rendered as pure
 * inline text (no inline-block box), which would otherwise make them unreliable
 * as containing blocks for an absolutely-positioned card.
 */

export interface CardPosition {
	cardLeft: string;
	cardTop: string | null;
	cardBottom: string | null;
	arrowLeft: string;
	shouldPositionBelow: boolean;
	cardMaxHeight: string | null;
	hasOverflow: boolean;
}

/**
 * Calculate the viewport-fixed position of a preview card for a given reference
 * element, ensuring the card stays within viewport bounds and its arrow
 * continues to point at the reference.
 *
 * @param referenceElement - The DOM element the card is anchored to
 * @param cardElement - The card DOM element being positioned
 * @param margin - Minimum margin from viewport edges in pixels (default: 16)
 * @param gap - Gap between the reference and the card (default: 12)
 * @returns A CardPosition object with CSS values for positioning
 */
export function calculateCardPosition(
	referenceElement: HTMLElement,
	cardElement: HTMLElement,
	margin: number = 16,
	gap: number = 12
): CardPosition {
	const refRect = referenceElement.getBoundingClientRect();
	const cardWidth = cardElement.offsetWidth;
	const cardHeight = cardElement.offsetHeight;
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	// ===== HORIZONTAL POSITIONING =====
	// Centre the card on the reference, then clamp so the card stays within the
	// viewport with at least `margin` breathing room on each edge.
	const refCenter = refRect.left + refRect.width / 2;
	const minLeft = margin;
	const maxLeft = Math.max(margin, viewportWidth - cardWidth - margin);
	const desiredLeft = refCenter - cardWidth / 2;
	const clampedLeft = Math.min(Math.max(desiredLeft, minLeft), maxLeft);

	// Arrow tracks the reference centre, even when the card was clamped to an
	// edge. Clamp the arrow's horizontal position so it stays inside the card.
	const arrowMin = 16;
	const arrowMax = cardWidth - 16;
	const arrowRaw = refCenter - clampedLeft;
	const clampedArrow = Math.min(Math.max(arrowRaw, arrowMin), arrowMax);

	const cardLeft = `${Math.round(clampedLeft)}px`;
	const arrowLeft = `${Math.round(clampedArrow)}px`;

	// ===== VERTICAL POSITIONING =====
	const spaceAbove = refRect.top;
	const spaceBelow = viewportHeight - refRect.bottom;

	// Prefer positioning above, but flip below when there's more room there and
	// the card wouldn't fit above.
	const shouldPositionBelow = spaceAbove < cardHeight + margin && spaceBelow > spaceAbove;

	let cardTop: string | null = null;
	let cardBottom: string | null = null;
	let cardMaxHeight: string | null = null;
	let hasOverflow = false;

	if (shouldPositionBelow) {
		const top = Math.round(refRect.bottom + gap);
		cardTop = `${top}px`;
		// Always cap max-height to the space actually available: images inside
		// the card can finish loading after the initial measurement and push
		// the card beyond the viewport bottom otherwise.
		const availableSpace = Math.max(0, spaceBelow - gap - margin);
		cardMaxHeight = `${availableSpace}px`;
		hasOverflow = cardHeight > availableSpace;
	} else {
		const bottom = Math.round(viewportHeight - refRect.top + gap);
		cardBottom = `${bottom}px`;
		const availableSpace = Math.max(0, spaceAbove - gap - margin);
		cardMaxHeight = `${availableSpace}px`;
		hasOverflow = cardHeight > availableSpace;
	}

	return {
		cardLeft,
		cardTop,
		cardBottom,
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
