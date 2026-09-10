import type { Action } from 'svelte/action';

/**
 * The class the enclosing `<figure>` takes when its plate fails to load.
 * Declared beside `.plate` in `src/styles/components/ink-signal.css`.
 */
const MISSING_CLASS = 'plate--missing';

/** What the empty plate says. Apparatus, so it is set as a `.dateline`. */
const MISSING_NOTE = 'Image unavailable.';

/**
 * plateFallback — turn a plate whose image never arrived into an empty plate
 * that says so.
 *
 * Every image on this site is a *plate*: a bordered rectangle with a numbered
 * serif caption under it. When the bytes fail — a cold offline load, a scan
 * moved in the archive, a poster the deck repo has not mirrored yet — the
 * browser leaves the broken-image glyph and its alt text sitting under a
 * caption that still says `Fig. 1 — …`, numbering a figure that is not there.
 *
 * So the figure is redrawn as what it now is: a 1px box on the surface ground
 * with a centred `Image unavailable.` in the data voice, the image dropped and
 * the caption suppressed — the caption describes a plate, and there is no
 * plate. The record's own metadata is untouched and still says what the image
 * would have shown.
 *
 * Applied to the `<img class="plate">` itself rather than the figure, because
 * `error` fires on the image and does not bubble.
 *
 * Cleanup runs through the action's `destroy` lifecycle method — runes such as
 * `$effect` are unavailable in a plain `.ts` file and throw at runtime.
 */
export const plateFallback: Action<HTMLImageElement> = (node) => {
	let note: HTMLParagraphElement | undefined;

	const figure = () => node.closest('figure');

	function markMissing() {
		const enclosing = figure();
		if (!enclosing || enclosing.classList.contains(MISSING_CLASS)) return;
		enclosing.classList.add(MISSING_CLASS);

		// The note is inserted rather than drawn with `content:` so that it is
		// real text: selectable, translatable, and announced like any other
		// string on the page.
		note = document.createElement('p');
		note.className = `dateline ${MISSING_CLASS}-note`;
		note.textContent = MISSING_NOTE;
		enclosing.append(note);
	}

	node.addEventListener('error', markMissing);

	// A failure already cached by the browser resolves before the action
	// attaches, and fires no event for it: an image that has finished with no
	// intrinsic width never arrived.
	if (node.complete && node.naturalWidth === 0) markMissing();

	return {
		destroy() {
			node.removeEventListener('error', markMissing);
			note?.remove();
			note = undefined;
			figure()?.classList.remove(MISSING_CLASS);
		}
	};
};
