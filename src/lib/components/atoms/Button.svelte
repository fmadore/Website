<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	interface Props {
		// Props
		variant?: 'primary' | 'secondary' | 'outline-primary' | 'outline-secondary';
		size?: 'sm' | 'base' | 'lg';
		href?: string | undefined; // If provided, render as <a>
		type?: 'button' | 'submit' | 'reset'; // Only used for <button>
		disabled?: boolean;
		block?: boolean; // For btn-block
		iconOnly?: boolean; // For icon-only buttons (adjusts padding potentially) - Not currently implemented in CSS, but adding prop
		glass?: boolean; // Enable glassmorphism effect
		ariaLabel?: string | undefined; // For accessibility, esp. for iconOnly
		additionalClasses?: string; // ADDED PROP
		icon?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		[key: string]: any;
	}

	let {
		variant = 'primary',
		size = 'base',
		href = undefined,
		type = 'button',
		disabled = false,
		block = false,
		iconOnly = false,
		glass = false,
		ariaLabel = undefined,
		additionalClasses = '',
		icon,
		children,
		...rest
	}: Props = $props();

	const dispatch = createEventDispatcher();

	// Compute classes based on props
	let buttonClasses = $derived(
		[
			'btn',
			`btn-${variant}`,
			size !== 'base' ? `btn-${size}` : '',
			block ? 'btn-block' : '',
			icon ? 'btn-icon' : '', // Add btn-icon if icon slot is used
			iconOnly ? 'btn-icon-only' : '', // Placeholder for potential future styling
			glass ? 'glass-button' : '', // Add glassmorphism effect if requested
			additionalClasses // INCLUDE additionalClasses
		]
			.filter(Boolean)
			.join(' ')
	);

	function handleClick(event: MouseEvent) {
		if (!disabled) {
			dispatch('click', event);
		}
	}
</script>

{#if href}
	<a
		{href}
		class={buttonClasses}
		role="button"
		aria-disabled={disabled}
		aria-label={ariaLabel || children ? undefined : 'Link button'}
		{...rest}
	>
		{#if icon}
			<span class="btn-icon-slot">{@render icon?.()}</span>
		{/if}
		{#if !iconOnly && children}
			<span class="btn-text-slot">{@render children?.()}</span>
		{/if}
	</a>
{:else}
	<button
		{type}
		class={buttonClasses}
		{disabled}
		onclick={handleClick}
		aria-label={ariaLabel || children ? undefined : 'Button'}
		{...rest}
	>
		{#if icon}
			<span class="btn-icon-slot">{@render icon?.()}</span>
		{/if}
		{#if !iconOnly && children}
			<span class="btn-text-slot">{@render children?.()}</span>
		{/if}
	</button>
{/if}

<style>
	/* Minimal styles to ensure icon and text slots align nicely if btn-icon class is present */
	.btn-icon-slot {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		/* Optional: Add margin if needed when both icon and text are present */
		/* .btn-icon .btn-icon-slot + .btn-text-slot { margin-left: var(--spacing-1); } */
	}
	.btn-text-slot {
		display: inline-block; /* Or inline-flex if needed */
	}

	/* Example for potential icon-only padding adjustment */
	/* .btn-icon-only { padding: var(--spacing-1); } */

	/* Ensure disabled links look disabled (already handled by .btn:disabled styles for buttons) */
	a[aria-disabled='true'] {
		opacity: 0.65;
		pointer-events: none;
		cursor: not-allowed;
	}
</style>
