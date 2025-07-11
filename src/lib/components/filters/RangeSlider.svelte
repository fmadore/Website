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
			if (!isDragging) return;
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
			if (!isDragging) return;
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
			{#each pipValues as pipValue}
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
		height: 40px;
		width: 100%;
		margin: var(--spacing-3) 0;
		padding: var(--spacing-3);
		border-radius: var(--border-radius-md);
		transition: all var(--anim-duration-base) var(--anim-ease-base);
		
		/* Glassmorphism styling matching filter sidebar - using global values */
		background: rgba(var(--color-surface-rgb), var(--opacity-medium));
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: var(--border-width-thin) solid rgba(var(--color-surface-rgb), var(--opacity-medium-high));
		box-shadow: var(--shadow-md);
	}

	.range-slider:hover {
		background: rgba(var(--color-surface-rgb), var(--opacity-medium-high));
		border-color: rgba(var(--color-surface-rgb), 0.3);
		box-shadow: var(--shadow-lg);
	}

	.range-track {
		position: absolute;
		top: 50%;
		left: var(--spacing-3);
		right: var(--spacing-3);
		height: var(--border-width-thick);
		background-color: var(--color-border);
		border-radius: var(--border-radius-sm);
		transform: translateY(-50%);
		cursor: pointer;
		transition: background-color var(--anim-duration-fast) var(--anim-ease-out);
	}

	.range-track:hover {
		background-color: var(--color-text-muted);
	}

	.range-highlight {
		position: absolute;
		top: 0;
		height: 100%;
		background: linear-gradient(90deg, 
			var(--color-accent) 0%, 
			var(--color-highlight) 100%
		);
		border-radius: var(--border-radius-sm);
		pointer-events: none;
		opacity: var(--opacity-high);
		transition: opacity var(--anim-duration-fast) var(--anim-ease-out);
	}

	.range-handle {
		position: absolute;
		top: 50%;
		width: 18px;
		height: 18px;
		background: linear-gradient(135deg, 
			var(--color-accent) 0%, 
			var(--color-highlight) 100%
		);
		border: var(--border-width-medium) solid var(--color-white);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		cursor: grab;
		transition: all var(--anim-duration-fast) var(--anim-ease-base);
		z-index: 2;
		touch-action: none;
		box-shadow: var(--shadow-md);
	}

	/* Larger touch target for mobile devices */
	@media (pointer: coarse) {
		.range-handle {
			width: 22px;
			height: 22px;
		}

		.range-handle::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: 44px; /* Minimum recommended touch target size */
			height: 44px;
			transform: translate(-50%, -50%);
		}
	}

	.range-handle:hover,
	.range-handle:focus {
		box-shadow: 
			0 0 0 var(--border-width-thick) rgba(var(--color-accent-rgb), var(--opacity-medium)),
			var(--shadow-lg);
		outline: none;
		transform: translate(-50%, -50%) scale(var(--scale-110));
	}

	.range-handle.active {
		cursor: grabbing;
		box-shadow: 
			0 0 0 var(--border-width-thick) rgba(var(--color-accent-rgb), var(--opacity-medium-high)),
			var(--shadow-xl);
		transform: translate(-50%, -50%) scale(var(--scale-125));
	}

	.range-float {
		position: absolute;
		bottom: 140%;
		left: 50%;
		transform: translateX(-50%);
		background: linear-gradient(135deg, 
			var(--color-accent) 0%, 
			var(--color-highlight) 100%
		);
		color: var(--color-white);
		padding: var(--spacing-1) var(--spacing-2);
		border-radius: var(--border-radius-sm);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		white-space: nowrap;
		pointer-events: none;
		box-shadow: var(--shadow-md);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
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
		left: var(--spacing-3);
		right: var(--spacing-3);
		height: 20px;
		margin-top: var(--spacing-2);
	}

	.pip {
		position: absolute;
		width: 1px;
		height: var(--spacing-2);
		background-color: var(--color-text-muted);
		transform: translateX(-50%);
		transition: background-color var(--anim-duration-fast) var(--anim-ease-out);
	}

	.pip.pip-large {
		height: var(--spacing-3);
		background-color: var(--color-text-light);
		width: 2px;
	}

	.range-label {
		position: absolute;
		top: var(--spacing-3);
		transform: translateX(-50%);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-light);
		white-space: nowrap;
	}

	/* Dark mode overrides - using global CSS variables for consistency */
	:global(html.dark) .range-slider {
		/* Use dark surface colors from global variables */
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-medium));
		border: var(--border-width-thin) solid rgba(var(--color-dark-surface-rgb), var(--opacity-medium-high));
		box-shadow: var(--shadow-md);
	}

	:global(html.dark) .range-slider:hover {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-medium-high));
		border-color: rgba(var(--color-dark-surface-rgb), 0.3);
		box-shadow: var(--shadow-lg);
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.range-slider {
			margin: var(--spacing-2) 0;
			padding: var(--spacing-2);
		}

		.range-track {
			left: var(--spacing-2);
			right: var(--spacing-2);
		}

		.range-pips {
			left: var(--spacing-2);
			right: var(--spacing-2);
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
	}
</style> 