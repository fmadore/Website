/**
 * Axis maths shared by the ECharts plates.
 *
 * Kept pure and out of the components for the reason the rest of the
 * visualisation logic is (`chartDescriptions.ts`, `networkLayout.ts`): a tick
 * ladder is arithmetic, and arithmetic is cheaper to prove than to eyeball at
 * five viewport widths.
 */

/**
 * The largest 1–2–5 interval that keeps an axis inside a tick budget.
 *
 * The ladder is 1, 2, 5, 10, 20, 50, 100 … — the only steps a reader adds up
 * without thinking, and the same steps the horizontal bar chart used as a
 * hardcoded staircase before it had to answer to width. The budget is what
 * makes it width-aware: a plate 900px wide can print ten labels along its
 * baseline, and the same plate at 375px cannot print more than four without
 * the numbers colliding into a gray smear.
 *
 * @param maxValue the axis maximum (the largest bar, or an explicit cap)
 * @param maxTicks how many intervals the axis may be divided into
 * @returns an interval from the 1–2–5 ladder, never below 1
 */
export function niceTickInterval(maxValue: number, maxTicks = 10): number {
	const max = Math.max(1, Math.ceil(Number.isFinite(maxValue) ? maxValue : 1));
	const budget = Math.max(1, Math.floor(Number.isFinite(maxTicks) ? maxTicks : 1));

	for (let magnitude = 1; magnitude <= 1e12; magnitude *= 10) {
		for (const step of [1, 2, 5]) {
			const interval = step * magnitude;
			if (max / interval <= budget) return interval;
		}
	}
	return max;
}

/**
 * How many ticks a plot of this width can carry.
 *
 * One mono label per ~70px, which is what the 12px figures plus their breathing
 * room actually measure, floored at 4 so a phone plate keeps enough of a scale
 * to read a bar against, and capped at 10 so a wide plate does not turn its
 * baseline into a ruler.
 *
 * @param plotWidth the grid's own width in px, labels and padding already taken
 */
export function tickBudgetForWidth(plotWidth: number): number {
	if (!Number.isFinite(plotWidth) || plotWidth <= 0) return 10;
	return Math.max(4, Math.min(10, Math.floor(plotWidth / 70)));
}
