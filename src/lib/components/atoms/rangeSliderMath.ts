/**
 * Pure geometry for `RangeSlider.svelte`.
 *
 * Extracted so the one decision the two-handle track has to get right — which
 * handle a click on the track drives — can be unit-tested without a DOM. The
 * component keeps the pointer plumbing; this file keeps the rule.
 */

export type RangeHandle = 'min' | 'max';

/**
 * Which handle a track interaction at `value` should drive.
 *
 * Single-handle mode always drives `max` (the lower bound is pinned).
 * Otherwise the nearer handle wins, and a tie breaks **outward**: a click below
 * the shared value moves `min`, one above it moves `max`. With the previous
 * `<=` tie-break, a collapsed range (both handles on the same year, which is
 * what selecting one year leaves) sent every click to `min`, so clicking to the
 * right of the handles dragged the lower bound past the upper one and the range
 * inverted instead of widening. Breaking outward means a collapsed range always
 * widens in the direction the reader clicked, which is the only reading a click
 * outside the current window can have.
 */
export function targetHandle(
	value: number,
	values: readonly [number, number],
	single = false
): RangeHandle {
	if (single) return 'max';

	const [low, high] = values;
	const distanceToMin = Math.abs(value - low);
	const distanceToMax = Math.abs(value - high);

	if (distanceToMin < distanceToMax) return 'min';
	if (distanceToMax < distanceToMin) return 'max';

	// Equidistant. Outside the window, the side the reader clicked decides;
	// exactly on a handle (or dead centre of an open range) there is nothing to
	// widen, so keep the historical `min`.
	if (value > high) return 'max';
	if (value < low) return 'min';
	return 'min';
}
