<!-- Custom Range Slider Component for Svelte 5 - Panel Style -->
<script lang="ts">
	let {
		min = 0,
		max = 100,
		step = 1,
		values = $bindable([min, max]),
		single = false,
		pips = false,
		pipstep = 10,
		first = undefined,
		last = undefined,
		float = false,
		ariaLabel = undefined,
		onchange
	}: {
		min?: number;
		max?: number;
		step?: number;
		values?: [number, number];
		/**
		 * Single-handle mode: only the max handle is shown and interactive; the
		 * lower bound stays pinned to `min`, so the active bar reads as "0 → value".
		 * Used for top-N style controls (`values[1]` is the value).
		 */
		single?: boolean;
		pips?: boolean;
		pipstep?: number;
		first?: string;
		last?: string;
		float?: boolean;
		/** Accessible label for the (max) handle. */
		ariaLabel?: string;
		onchange?: (event: CustomEvent<{ values: [number, number] }>) => void;
	} = $props();

	// In single mode the lower bound is pinned to `min` so only the upper value
	// is meaningful.
	$effect(() => {
		if (single && values[0] !== min) {
			values = [min, values[1]];
		}
	});

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

	// Which handle a track interaction at `newValue` should drive. Single mode
	// always drives the max handle; otherwise pick the closest.
	function targetHandle(newValue: number): 'min' | 'max' {
		if (single) return 'max';
		const distanceToMin = Math.abs(newValue - values[0]);
		const distanceToMax = Math.abs(newValue - values[1]);
		return distanceToMin <= distanceToMax ? 'min' : 'max';
	}

	function handleTrackClick(event: MouseEvent) {
		if (isDragging) return;
		const newValue = getValueFromPosition(event.clientX);
		updateValue(targetHandle(newValue), newValue);
	}

	function handleTrackTouch(event: TouchEvent) {
		if (isDragging) return;
		const touch = event.touches[0];
		if (touch) {
			const newValue = getValueFromPosition(touch.clientX);
			updateValue(targetHandle(newValue), newValue);
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

	<!-- Min handle (hidden in single mode) -->
	{#if !single}
		<div
			class="range-handle"
			class:active={isDragging === 'min'}
			style="--handle-position: {minPosition / 100}"
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
	{/if}

	<!-- Max handle -->
	<div
		class="range-handle"
		class:active={isDragging === 'max'}
		style="--handle-position: {maxPosition / 100}"
		role="slider"
		tabindex="0"
		aria-valuemin={single ? min : values[0]}
		aria-valuemax={max}
		aria-valuenow={values[1]}
		aria-label={ariaLabel ?? (single ? 'Value' : 'Maximum value')}
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

		/* Track offset variable for handle positioning */
		--track-offset: var(--space-sm);

		/* No boxed container — the control is a bare track laid into the filter
		 * panel: a hairline rule, a solid ink selection, square ink markers. */
		background: transparent;
	}

	.range-track {
		position: absolute;
		top: 50%;
		left: var(--track-offset);
		right: var(--track-offset);
		height: var(--border-width-thick);
		background-color: var(--color-border);
		border-radius: 0;
		transform: translateY(-50%);
		cursor: pointer;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.range-track:hover {
		background-color: var(--color-text-muted);
	}

	/* Active range — a solid ink bar. Square. */
	.range-highlight {
		position: absolute;
		top: 0;
		height: 100%;
		background: var(--color-primary);
		border-radius: 0;
		pointer-events: none;
	}

	/* A square ink marker, not a round knob — the system's corners are square. A
	 * tall thin bar reads as an editorial gate on the track and stays distinct
	 * from the ink selection it rides on. Hover/active shift it to pine. */
	.range-handle {
		position: absolute;
		top: 50%;
		/* Calculate position relative to track area, not slider container */
		left: calc(var(--track-offset) + var(--handle-position) * (100% - 2 * var(--track-offset)));
		width: var(--space-2-5);
		height: var(--space-5);
		background: var(--color-primary);
		border: none;
		border-radius: 0;
		transform: translate(-50%, -50%);
		cursor: grab;
		transition: background-color var(--duration-fast) var(--ease-out);
		z-index: var(--z-above);
		touch-action: none;
	}

	/* Larger touch target for mobile devices */
	@media (pointer: coarse) {
		.range-handle {
			width: var(--space-3);
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
	.range-handle:focus-visible {
		outline: none;
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.range-handle.active {
		cursor: grabbing;
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	/* Value read-out above the handle — a solid ink stamp, square, in the mono
	 * data voice. No shadow, no entrance animation. */
	.range-float {
		position: absolute;
		bottom: 140%;
		left: 50%;
		transform: translateX(-50%);
		background: var(--color-primary);
		color: var(--color-text-inverted);
		padding: var(--space-2xs) var(--space-xs);
		border-radius: 0;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		pointer-events: none;
	}

	.range-float::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: var(--border-width-thick) solid transparent;
		border-top-color: var(--color-primary);
	}

	.range-pips {
		position: absolute;
		top: 100%;
		left: var(--track-offset);
		right: var(--track-offset);
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

	/* Pip labels — mono figures, the data voice. */
	.range-label {
		position: absolute;
		top: var(--space-xs);
		transform: translateX(-50%);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		font-variant-numeric: tabular-nums;
		color: var(--color-text-light);
		white-space: nowrap;
	}

	/* Dark mode — the bare track carries the microfilm-negative colours below;
	 * no container to restyle. */
	:global(html.dark) .range-track {
		background-color: color-mix(
			in srgb,
			var(--color-text) calc(var(--opacity-10) * 100%),
			transparent
		);
	}

	:global(html.dark) .pip {
		background-color: color-mix(
			in srgb,
			var(--color-text) calc(var(--opacity-15) * 100%),
			transparent
		);
	}

	:global(html.dark) .pip.pip-large {
		background-color: color-mix(
			in srgb,
			var(--color-text) calc(var(--opacity-30) * 100%),
			transparent
		);
	}

	:global(html.dark) .range-label {
		color: var(--color-text-muted);
	}

	/* Responsive design - Mobile first */
	@media (--sm-down) {
		.range-slider {
			--track-offset: var(--space-xs);
			height: var(--space-9);
			margin: var(--space-xs) 0;
			padding: var(--space-xs) var(--space-sm);
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
			--track-offset: var(--space-md);
			height: var(--space-12);
			padding: var(--space-sm) var(--space-md);
		}

		.range-handle {
			width: var(--space-3);
			height: var(--space-6);
		}
	}

	/* Respect user motion preferences — controls already shift colour instantly;
	 * disabling the remaining hairline transitions is enough. */
	@media (prefers-reduced-motion: reduce) {
		.range-slider,
		.range-track,
		.range-handle,
		.pip {
			transition: none;
		}
	}
</style>
