import type { Action } from 'svelte/action';

/**
 * Options for the {@link portalModal} action.
 */
export interface PortalModalOptions {
	/** Called when the user clicks the backdrop or presses Escape. */
	onDismiss: () => void;
	/** Selector or element to portal to. Defaults to `'body'`. */
	target?: string | HTMLElement;
	/** Whether to focus the node after portaling so keyboard events reach it. Default `true`. */
	autoFocus?: boolean;
}

/**
 * Svelte action that portals a modal element to {@link PortalModalOptions.target}
 * and wires up the backdrop-click + Escape-key dismissal handlers.
 *
 * The basic-portal counterpart (no event handling) lives in `./portal.ts`;
 * use this when the portaled node *is* the modal backdrop (a click anywhere
 * on the node should dismiss).
 *
 * @example
 * ```svelte
 * {#if open}
 *   <div use:portalModal={{ onDismiss: close }} class="modal" role="dialog" tabindex="0">
 *     ...
 *   </div>
 * {/if}
 * ```
 */
export const portalModal: Action<HTMLElement, PortalModalOptions> = (node, options) => {
	let current = options;

	const target = current.target ?? 'body';
	const targetEl =
		typeof target === 'string' ? (document.querySelector(target) as HTMLElement | null) : target;
	if (!targetEl) {
		throw new Error(
			typeof target === 'string'
				? `portalModal: no element found matching "${target}"`
				: 'portalModal: target element is null'
		);
	}

	targetEl.appendChild(node);
	node.hidden = false;

	function handleClick() {
		current.onDismiss();
	}
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			current.onDismiss();
		}
	}
	node.addEventListener('click', handleClick);
	node.addEventListener('keydown', handleKeydown);

	if (current.autoFocus !== false) {
		node.focus();
	}

	return {
		update(newOptions: PortalModalOptions) {
			current = newOptions;
		},
		destroy() {
			node.removeEventListener('click', handleClick);
			node.removeEventListener('keydown', handleKeydown);
			requestAnimationFrame(() => {
				if (node.parentNode) {
					node.parentNode.removeChild(node);
				}
			});
		}
	};
};
