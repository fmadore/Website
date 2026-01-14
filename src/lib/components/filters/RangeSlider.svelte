<!-- Custom Range Slider Component for Svelte 5 - Panel Style -->
<script lang="ts">
	let {
		min = 0,
		max = 100,
		step = 1,
		values = $bindable([min, max]),
		pips = false,
		pipstep = 10,
		first = undefined,
		last = undefined,
		float = false,
		onchange
	}: {
		min?: number;
		max?: number;
		step?: number;
		values?: [number, number];
		pips?: boolean;
		pipstep?: number;
		first?: string;
		last?: string;
		float?: boolean;
		onchange?: (event: CustomEvent<{ values: [number, number] }>) => void;
	} = $props();

	let sliderRef: HTMLDivElement;
	let isDragging = $state<'min' | 'max' | null>(null);
	let showFloats = $state({ min: false, max: false });

	// Cleanup effect to ensure no hanging event listeners
	$effect(() => {
		return () => {
			// Reset dragging state on component cleanup
			isDragging = null;
			showFloats.min = false;
			showFloats.max = false;
		};
	});

	// Calculate positions as percentages
	const minPosition = $derived(((values[0] - min) / (max - min)) * 100);
	const maxPosition = $derived(((values[1] - min) / (max - min)) * 100);

	// Generate pip values for display
	const pipValues = $derived.by(() => {
		if (!pips) return [];
		const pipsArray: number[] = [];
		for (let i = min; i <= max; i += pipstep) {
			pipsArray.push(i);
		}
		if (!pipsArray.includes(max)) {
			pipsArray.push(max);
		}
		return pipsArray;
	});

	function getValueFromPosition(clientX: number): number {
		if (!sliderRef) {
			console.warn('Slider ref is null, returning current min value');
			return min;
		}
		const rect = sliderRef.getBoundingClientRect();
		const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		const rawValue = min + percentage * (max - min);
		return Math.round(rawValue / step) * step;
	}

	function updateValue(type: 'min' | 'max', newValue: number) {
		let newValues: [number, number];

		if (type === 'min') {
			newValues = [Math.min(newValue, values[1]), values[1]];
		} else {
			newValues = [values[0], Math.max(newValue, values[0])];
		}

		values = newValues;

		// Dispatch change event
		if (onchange) {
			onchange(new CustomEvent('change', { detail: { values: newValues } }));
		}
	}

	function handleMouseDown(event: MouseEvent, type: 'min' | 'max') {
		event.preventDefault();
		isDragging = type;
		showFloats[type] = float;

		function handleMouseMove(event: MouseEvent) {
			if (!isDragging || !sliderRef) return;
			const newValue = getValueFromPosition(event.clientX);
			updateValue(isDragging, newValue);
		}

		function handleMouseUp() {
			isDragging = null;
			showFloats.min = false;
			showFloats.max = false;
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		}

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	}

	function handleTouchStart(event: TouchEvent, type: 'min' | 'max') {
		event.preventDefault();
		isDragging = type;
		showFloats[type] = float;

		function handleTouchMove(event: TouchEvent) {
			if (!isDragging || !sliderRef) return;
			const touch = event.touches[0];
			if (touch) {
				const newValue = getValueFromPosition(touch.clientX);
				updateValue(isDragging, newValue);
			}
		}

		function handleTouchEnd() {
			isDragging = null;
			showFloats.min = false;
			showFloats.max = false;
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('touchend', handleTouchEnd);
		}

		document.addEventListener('touchmove', handleTouchMove, { passive: false });
		document.addEventListener('touchend', handleTouchEnd);
	}

	function handleTrackClick(event: MouseEvent) {
		if (isDragging) return;

		const newValue = getValueFromPosition(event.clientX);
		const distanceToMin = Math.abs(newValue - values[0]);
		const distanceToMax = Math.abs(newValue - values[1]);

		// Update the closest handle
		if (distanceToMin <= distanceToMax) {
			updateValue('min', newValue);
		} else {
			updateValue('max', newValue);
		}
	}

	function handleTrackTouch(event: TouchEvent) {
		if (isDragging) return;

		const touch = event.touches[0];
		if (touch) {
			const newValue = getValueFromPosition(touch.clientX);
			const distanceToMin = Math.abs(newValue - values[0]);
			const distanceToMax = Math.abs(newValue - values[1]);

			// Update the closest handle
			if (distanceToMin <= distanceToMax) {
				updateValue('min', newValue);
			} else {
				updateValue('max', newValue);
			}
		}
	}

	function handleKeyDown(event: KeyboardEvent, type: 'min' | 'max') {
		let newValue = values[type === 'min' ? 0 : 1];

		switch (event.key) {
			case 'ArrowLeft':
			case 'ArrowDown':
				event.preventDefault();
				newValue = Math.max(min, newValue - step);
				break;
			case 'ArrowRight':
			case 'ArrowUp':
				event.preventDefault();
				newValue = Math.min(max, newValue + step);
				break;
			case 'Home':
				event.preventDefault();
				newValue = min;
				break;
			case 'End':
				event.preventDefault();
				newValue = max;
				break;
			default:
				return;
		}

		updateValue(type, newValue);
	}
</script>

<div class="range-slider" bind:this={sliderRef}>
	<!-- Track -->
	<div
		class="range-track"
		onclick={handleTrackClick}
		ontouchstart={handleTrackTouch}
		role="presentation"
	>
		<!-- Active range highlight -->
		<div
			class="range-highlight"
			style="left: {minPosition}%; width: {maxPosition - minPosition}%"
		></div>
	</div>

	<!-- Min handle -->
	<div
		class="range-handle"
		class:active={isDragging === 'min'}
		style="left: {minPosition}%"
		role="slider"
		tabindex="0"
		aria-valuemin={min}
		aria-valuemax={values[1]}
		aria-valuenow={values[0]}
		aria-label="Minimum value"
		onmousedown={(e) => handleMouseDown(e, 'min')}
		ontouchstart={(e) => handleTouchStart(e, 'min')}
		onkeydown={(e) => handleKeyDown(e, 'min')}
		onfocus={() => (showFloats.min = float)}
		onblur={() => (showFloats.min = false)}
	>
		{#if showFloats.min}
			<div class="range-float">{values[0]}</div>
		{/if}
	</div>

	<!-- Max handle -->
	<div
		class="range-handle"
		class:active={isDragging === 'max'}
		style="left: {maxPosition}%"
		role="slider"
		tabindex="0"
		aria-valuemin={values[0]}
		aria-valuemax={max}
		aria-valuenow={values[1]}
		aria-label="Maximum value"
		onmousedown={(e) => handleMouseDown(e, 'max')}
		ontouchstart={(e) => handleTouchStart(e, 'max')}
		onkeydown={(e) => handleKeyDown(e, 'max')}
		onfocus={() => (showFloats.max = float)}
		onblur={() => (showFloats.max = false)}
	>
		{#if showFloats.max}
			<div class="range-float">{values[1]}</div>
		{/if}
	</div>

	<!-- Pips -->
	{#if pips}
		<div class="range-pips">
			{#each pipValues as pipValue (pipValue)}
				{@const pipPosition = ((pipValue - min) / (max - min)) * 100}
				<div
					class="pip"
					class:pip-large={pipValue === min || pipValue === max || pipValue % (pipstep * 2) === 0}
					style="left: {pipPosition}%"
				></div>
				{#if (first === 'label' && pipValue === min) || (last === 'label' && pipValue === max) || pipValue % (pipstep * 2) === 0}
					<div class="range-label" style="left: {pipPosition}%">
						{pipValue}
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.range-slider {
		position: relative;
		height: var(--space-10);
		width: 100%;
		margin: var(--space-2xs) 0;
		padding: var(--space-xs) var(--space-md);
		border-radius: var(--border-radius-md);
		transition: all var(--duration-normal) var(--ease-out);

		/* Glassmorphism styling matching filter sidebar - using global values */
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-medium) * 100%),
			transparent
		);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-surface) calc(var(--opacity-medium-high) * 100%), transparent);
		box-shadow: var(--shadow-md);
	}

	.range-slider:hover {
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-medium-high) * 100%),
			transparent
		);
		border-color: color-mix(in srgb, var(--color-surface) 30%, transparent);
		box-shadow: var(--shadow-lg);
	}

	.range-track {
		position: absolute;
		top: 50%;
		left: var(--space-sm);
		right: var(--space-sm);
		height: var(--border-width-thick);
		background-color: var(--color-border);
		border-radius: var(--border-radius-sm);
		transform: translateY(-50%);
		cursor: pointer;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.range-track:hover {
		background-color: var(--color-text-muted);
	}

	.range-highlight {
		position: absolute;
		top: 0;
		height: 100%;
		background: var(--gradient-accent-highlight);
		border-radius: var(--border-radius-sm);
		pointer-events: none;
		opacity: var(--opacity-high);
		transition: opacity var(--duration-fast) var(--ease-out);
	}

	.range-handle {
		position: absolute;
		top: 50%;
		width: var(--space-lg);
		height: var(--space-lg);
		background: var(--gradient-accent-highlight);
		border: var(--border-width-medium) solid var(--color-white);
		border-radius: var(--border-radius-full);
		transform: translate(-50%, -50%);
		cursor: grab;
		transition: all var(--duration-fast) var(--ease-out);
		z-index: var(--z-above);
		touch-action: none;
		box-shadow: var(--shadow-md);
		will-change: transform, box-shadow;
	}

	/* Larger touch target for mobile devices */
	@media (pointer: coarse) {
		.range-handle {
			width: var(--space-6);
			height: var(--space-6);
		}

		.range-handle::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: var(--space-11); /* Minimum recommended touch target size */
			height: var(--space-11);
			transform: translate(-50%, -50%);
		}
	}

	.range-handle:hover,
	.range-handle:focus {
		box-shadow:
			0 0 0 var(--border-width-thick)
				color-mix(in srgb, var(--color-accent) calc(var(--opacity-medium) * 100%), transparent),
			var(--shadow-lg);
		outline: none;
		transform: translate(-50%, -50%) scale(var(--scale-110));
	}

	.range-handle.active {
		cursor: grabbing;
		box-shadow:
			0 0 0 var(--border-width-thick)
				color-mix(in srgb, var(--color-accent) calc(var(--opacity-medium-high) * 100%), transparent),
			var(--shadow-xl);
		transform: translate(-50%, -50%) scale(var(--scale-125));
	}

	.range-float {
		position: absolute;
		bottom: 140%;
		left: 50%;
		transform: translateX(-50%);
		background: var(--gradient-accent-highlight);
		color: var(--color-white);
		padding: var(--space-2xs) var(--space-xs);
		border-radius: var(--border-radius-sm);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		white-space: nowrap;
		pointer-events: none;
		box-shadow: var(--shadow-md);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		/* Entry animation for float labels */
		animation: floatFadeIn var(--duration-fast) var(--ease-out);
	}

	@keyframes floatFadeIn {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	.range-float::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: var(--border-width-thick) solid transparent;
		border-top-color: var(--color-accent);
	}

	.range-pips {
		position: absolute;
		top: 100%;
		left: var(--space-sm);
		right: var(--space-sm);
		height: var(--space-5);
		margin-top: var(--space-2xs);
	}

	.pip {
		position: absolute;
		width: var(--border-width-thin);
		height: var(--space-xs);
		background-color: var(--color-text-muted);
		transform: translateX(-50%);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.pip.pip-large {
		height: var(--space-sm);
		background-color: var(--color-text-light);
		width: var(--border-width-medium);
	}

	.range-label {
		position: absolute;
		top: var(--space-xs);
		transform: translateX(-50%);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-light);
		white-space: nowrap;
	}

	/* Dark mode overrides - using global CSS variables for consistency */
	:global(html.dark) .range-slider {
		/* Use dark surface colors from global variables */
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-medium) * 100%),
			transparent
		);
		border: var(--border-width-thin) solid
			color-mix(
				in srgb,
				var(--color-dark-surface) calc(var(--opacity-medium-high) * 100%),
				transparent
			);
		box-shadow: var(--shadow-md);
	}

	:global(html.dark) .range-slider:hover {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-medium-high) * 100%),
			transparent
		);
		border-color: color-mix(in srgb, var(--color-dark-surface) 30%, transparent);
		box-shadow: var(--shadow-lg);
	}

	:global(html.dark) .range-track {
		background-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-low) * 100%),
			transparent
		);
	}

	:global(html.dark) .pip {
		background-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-medium) * 100%),
			transparent
		);
	}

	:global(html.dark) .pip.pip-large {
		background-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-medium-high) * 100%),
			transparent
		);
	}

	:global(html.dark) .range-label {
		color: var(--color-text-muted);
	}

	/* Responsive design - Mobile first */
	@media (--sm-down) {
		.range-slider {
			height: var(--space-9);
			margin: var(--space-xs) 0;
			padding: var(--space-xs) var(--space-sm);
		}

		.range-track {
			left: var(--space-xs);
			right: var(--space-xs);
		}

		.range-pips {
			left: var(--space-xs);
			right: var(--space-xs);
		}

		.range-float {
			font-size: var(--font-size-xs);
			padding: var(--space-3xs) var(--space-2xs);
		}

		.range-label {
			font-size: var(--font-size-xs);
		}
	}

	/* Medium screens */
	@media (--sm) and (--lg-down) {
		.range-slider {
			height: var(--space-11);
		}
	}

	/* Large screens */
	@media (--lg) {
		.range-slider {
			height: var(--space-12);
			padding: var(--space-sm) var(--space-md);
		}

		.range-track {
			left: var(--space-md);
			right: var(--space-md);
		}

		.range-pips {
			left: var(--space-md);
			right: var(--space-md);
		}

		.range-handle {
			width: var(--space-5);
			height: var(--space-5);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.range-slider,
		.range-track,
		.range-highlight,
		.range-handle,
		.range-float,
		.pip {
			transition: none;
		}

		.range-handle:hover,
		.range-handle:focus,
		.range-handle.active {
			transform: translate(-50%, -50%);
		}

		/* Disable entry animations */
		.range-float {
			animation: none;
		}

		.range-handle {
			will-change: auto;
		}
	}
</style>
