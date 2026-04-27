<script lang="ts">
	/**
	 * Smoothly counts up or down between integer values for filter result counts.
	 *
	 * Uses requestAnimationFrame directly because `svelte/motion`'s `Tween` and
	 * `tweened` proved finicky here when retargeted from a store-derived prop
	 * (the `current` value would not advance). A plain rAF loop is small,
	 * predictable, and respects `prefers-reduced-motion` via `motionDuration()`.
	 */
	import { cubicOut } from 'svelte/easing';
	import { motionDuration } from '$lib/utils/motion';
	import { onDestroy, untrack } from 'svelte';

	interface Props {
		value: number;
		duration?: number;
	}

	let { value, duration = 350 }: Props = $props();

	// Initial-value snapshots — the $effect below handles every subsequent
	// prop change, so the static reference here is intentional.
	// svelte-ignore state_referenced_locally
	let displayed = $state(value);
	let frame: number | null = null;
	let snapTimeout: ReturnType<typeof setTimeout> | null = null;
	let animStart = 0;
	// svelte-ignore state_referenced_locally
	let animFrom = value;
	// svelte-ignore state_referenced_locally
	let animTo = value;
	let animDur = 0;

	function step(now: number) {
		const t = animDur > 0 ? Math.min(1, (now - animStart) / animDur) : 1;
		const eased = cubicOut(t);
		displayed = animFrom + (animTo - animFrom) * eased;
		if (t < 1) {
			frame = requestAnimationFrame(step);
		} else {
			displayed = animTo;
			frame = null;
		}
	}

	function startAnimation(target: number) {
		const dur = motionDuration(duration);
		if (frame !== null) {
			cancelAnimationFrame(frame);
			frame = null;
		}
		if (snapTimeout !== null) {
			clearTimeout(snapTimeout);
			snapTimeout = null;
		}
		if (dur <= 0 || target === displayed) {
			displayed = target;
			return;
		}
		animFrom = displayed;
		animTo = target;
		animDur = dur;
		animStart = performance.now();
		frame = requestAnimationFrame(step);
		// Safety fallback: if rAF is throttled (background tabs, headless test
		// environments), the rAF loop never advances and `displayed` stays at
		// its starting value forever. Snap to target a beat after the animation
		// should have finished. In a normal browser the rAF has already settled
		// at the target, so reassigning to the same number is a no-op.
		snapTimeout = setTimeout(() => {
			snapTimeout = null;
			if (frame !== null) {
				cancelAnimationFrame(frame);
				frame = null;
			}
			displayed = target;
		}, dur + 100);
	}

	$effect(() => {
		// Track the value prop, then animate without re-tracking the displayed
		// $state inside startAnimation (which would self-trigger the effect).
		const target = value;
		untrack(() => startAnimation(target));
	});

	onDestroy(() => {
		if (frame !== null) cancelAnimationFrame(frame);
		if (snapTimeout !== null) clearTimeout(snapTimeout);
	});

	const rounded = $derived(Math.round(displayed));
</script>

<span class="tweened-count" aria-live="polite">{rounded}</span>

<style>
	.tweened-count {
		font-variant-numeric: tabular-nums;
		display: inline-block;
	}
</style>
