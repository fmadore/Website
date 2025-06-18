/**
 * A Svelte action to portal an element to a different part of the DOM.
 * @param {HTMLElement} node The element to portal.
 * @param {string | HTMLElement} target The target to portal to. Defaults to 'body'.
 */
export function portal(node: HTMLElement, target: string | HTMLElement = 'body') {
	let targetEl: HTMLElement | null;

	function update(newTarget: string | HTMLElement) {
		target = newTarget;
		if (typeof target === 'string') {
			targetEl = document.querySelector(target);
			if (!targetEl) {
				throw new Error(`No element found matching CSS selector: "${target}"`);
			}
		} else if (target instanceof HTMLElement) {
			targetEl = target;
		} else {
			throw new TypeError(
				`Unknown portal target type: ${
					target === null ? 'null' : typeof target
				}. Allowed types: string (CSS selector) or HTMLElement.`
			);
		}
		targetEl.appendChild(node);
		node.hidden = false;
	}

	function destroy() {
		// Use requestAnimationFrame to ensure the element is not removed before a potential
		// new element is added in the same tick, which can cause focus issues.
		requestAnimationFrame(() => {
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
		});
	}

	update(target);

	return {
		update,
		destroy
	};
} 