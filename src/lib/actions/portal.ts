import type { Action } from 'svelte/action';

/**
 * A Svelte action to portal an element to a different part of the DOM.
 * Modernized for Svelte 5 using $effect() for cleanup.
 * @param {HTMLElement} node The element to portal.
 * @param {string | HTMLElement} target The target to portal to. Defaults to 'body'.
 */
export const portal: Action<HTMLElement, string | HTMLElement | undefined> = (
	node,
	target = 'body'
) => {
	let currentTarget = target;

	function moveElement(destination: string | HTMLElement) {
		let targetEl: HTMLElement | null;

		if (typeof destination === 'string') {
			targetEl = document.querySelector(destination);
			if (!targetEl) {
				throw new Error(`No element found matching CSS selector: "${destination}"`);
			}
		} else if (destination instanceof HTMLElement) {
			targetEl = destination;
		} else {
			throw new TypeError(
				`Unknown portal target type: ${
					destination === null ? 'null' : typeof destination
				}. Allowed types: string (CSS selector) or HTMLElement.`
			);
		}

		targetEl.appendChild(node);
		node.hidden = false;
	}

	// Initial mount
	moveElement(currentTarget);

	// Use $effect for cleanup (Svelte 5 pattern)
	$effect(() => {
		// Setup: element is already moved by the initial call above or update below

		return () => {
			// Cleanup: remove element from DOM when action is destroyed
			// Use requestAnimationFrame to prevent focus issues
			requestAnimationFrame(() => {
				if (node.parentNode) {
					node.parentNode.removeChild(node);
				}
			});
		};
	});

	return {
		update(newTarget: string | HTMLElement = 'body') {
			currentTarget = newTarget;
			moveElement(currentTarget);
		}
	};
};
