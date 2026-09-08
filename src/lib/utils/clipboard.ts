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
