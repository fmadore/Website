/**
 * Copy plain text to the clipboard, from a static page.
 *
 * There is no backend and no dependency to reach for here, so this is the
 * platform in two layers:
 *
 *  - `navigator.clipboard.writeText`, which needs a secure context. The site is
 *    served over HTTPS, so it is the path every real visitor takes.
 *  - a hidden textarea plus `document.execCommand('copy')` for the rest —
 *    an insecure origin (a plain-HTTP preview), a browser that withholds the
 *    async API, or a permission the user has denied. Deprecated, but it is the
 *    only fallback that exists and it costs a dozen lines.
 *
 * Returns whether the text actually reached the clipboard, so the caller can
 * report the failure rather than claim a copy that never happened.
 */
export async function copyText(text: string): Promise<boolean> {
	if (!text || typeof document === 'undefined') return false;

	try {
		if (navigator?.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
			return true;
		}
	} catch {
		// Denied, or no secure context — fall through to the selection copy.
	}

	return selectionCopy(text);
}

/**
 * The pre-async-clipboard copy: put the text in an off-screen, read-only
 * textarea, select it, and let the document copy command take it.
 *
 * `readOnly` rather than `disabled` because a disabled control cannot hold a
 * selection, and `position: fixed` at the top of the viewport because a
 * textarea scrolled into view is what makes iOS Safari jump the page.
 */
function selectionCopy(text: string): boolean {
	const active = document.activeElement as HTMLElement | null;
	const field = document.createElement('textarea');
	field.value = text;
	field.setAttribute('readonly', '');
	field.setAttribute('aria-hidden', 'true');
	field.style.position = 'fixed';
	field.style.top = '0';
	field.style.left = '-9999px';
	document.body.appendChild(field);

	let copied = false;
	try {
		field.select();
		field.setSelectionRange(0, text.length);
		copied = document.execCommand('copy');
	} catch {
		// Some engines throw rather than return false; either way, copied stays false.
	} finally {
		document.body.removeChild(field);
		// The textarea stole focus; hand it back to whatever the user was on.
		active?.focus?.();
	}

	return copied;
}

/** The three states a copy control reports. */
export type CopyState = 'idle' | 'copied' | 'failed';

/** How long a copy control shows its outcome before it returns to idle. */
export const COPY_FEEDBACK_MS = 2400;

/**
 * A copy control's state: idle until a copy, then `copied` or `failed` —
 * never a claimed copy that did not happen — for {@link COPY_FEEDBACK_MS},
 * then idle again. A second copy restarts the window.
 *
 * Call it while a component initialises: the reset timer is cleared when the
 * component is destroyed, since a row can paginate away mid-confirmation.
 */
export function createCopyFeedback() {
	let state = $state<CopyState>('idle');
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => () => clearTimeout(resetTimer));

	return {
		get state(): CopyState {
			return state;
		},
		/** Copies `text` and reports the outcome. */
		async copy(text: string): Promise<Exclude<CopyState, 'idle'>> {
			const outcome = (await copyText(text)) ? 'copied' : 'failed';
			state = outcome;
			clearTimeout(resetTimer);
			resetTimer = setTimeout(() => (state = 'idle'), COPY_FEEDBACK_MS);
			return outcome;
		}
	};
}
