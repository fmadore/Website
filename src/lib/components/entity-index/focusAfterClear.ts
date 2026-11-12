import { tick } from 'svelte';

/** The attribute the tally carries, so a clear control can hand focus to it. */
export const TALLY_ATTRIBUTE = 'data-index-tally';

/**
 * Runs a clear and keeps keyboard focus on the page. A clear control is often
 * the last thing narrowing the list, so clearing unmounts it and focus would
 * fall to <body>, the top of the page for a keyboard or screen-reader user.
 * It lands on the index's search box (the start of the filter apparatus), or
 * failing that on the tally, which reads out the restored total. On a touch
 * screen it is always the tally: focusing a text field would throw up the
 * on-screen keyboard. A clear that left focus somewhere else is left alone.
 *
 * `from` is the control itself; its `<main>` is taken before the clear, while
 * the control is still in the document.
 */
export async function clearKeepingFocus(from: Element | null, clear: () => void): Promise<void> {
	const scope: ParentNode = from?.closest('main') ?? document;
	clear();
	await tick();
	const active = document.activeElement;
	if (active && active !== document.body) return;
	const touch = window.matchMedia?.('(pointer: coarse)').matches;
	const search = touch ? null : scope.querySelector<HTMLInputElement>('input[type="search"]');
	(search ?? scope.querySelector<HTMLElement>(`[${TALLY_ATTRIBUTE}]`))?.focus();
}
