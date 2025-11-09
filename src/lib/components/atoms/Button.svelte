<script lang="ts">
	interface Props {
		// Props
		variant?:
			| 'primary'
			| 'secondary'
			| 'outline-primary'
			| 'outline-secondary'
			| 'ghost'
			| 'danger';
		size?: 'sm' | 'base' | 'lg';
		href?: string | undefined; // If provided, render as <a>
		type?: 'button' | 'submit' | 'reset'; // Only used for <button>
		disabled?: boolean;
		block?: boolean; // For btn-block
		iconOnly?: boolean; // For icon-only buttons
		glass?: boolean; // Enable glassmorphism effect
		loading?: boolean; // Loading state
		ariaLabel?: string | undefined; // For accessibility, esp. for iconOnly
		additionalClasses?: string;
		onclick?: (event: MouseEvent) => void; // Callback for click events
		icon?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		label?: string; // Alternative to children for plain text
		[key: string]: unknown;
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
		loading = false,
		ariaLabel = undefined,
		additionalClasses = '',
		onclick,
		icon,
		children,
		label = undefined,
		...rest
	}: Props = $props();

	// Compute classes based on props
	let buttonClasses = $derived(
		[
			'btn',
			`btn-${variant}`,
			size !== 'base' ? `btn-${size}` : '',
			block ? 'btn-block' : '',
			icon || loading ? 'btn-with-icon' : '',
			iconOnly ? 'btn-icon-only' : '',
			glass ? 'btn-glass glass-button' : '',
			loading ? 'btn-loading' : '',
			additionalClasses
		]
			.filter(Boolean)
			.join(' ')
	);

	// Determine if we have content for aria-label fallback
	const hasContent = $derived(!!label || !!ariaLabel);

	function handleClick(event: MouseEvent) {
		if (!disabled && !loading && onclick) {
			onclick(event);
		}
	}
</script>

{#if href}
	<a
		{href}
		class={buttonClasses}
		role="button"
		aria-disabled={disabled || loading}
		aria-label={ariaLabel || (hasContent ? undefined : 'Link button')}
		{...rest}
	>
		<span class="btn-content">
			{#if loading}
				<span class="btn-loader">
					<svg class="btn-spinner" viewBox="0 0 24 24" fill="none">
						<circle
							class="btn-spinner-track"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="2"
						/>
						<circle
							class="btn-spinner-fill"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="2"
						/>
					</svg>
				</span>
			{:else if icon}
				<span class="btn-icon">{@render icon?.()}</span>
			{/if}
			{#if !iconOnly}
				{#if children}
					<span class="btn-text">{@render children?.()}</span>
				{:else if label}
					<span class="btn-text">{label}</span>
				{/if}
			{/if}
		</span>
	</a>
{:else}
	<button
		{type}
		class={buttonClasses}
		disabled={disabled || loading}
		onclick={handleClick}
		aria-label={ariaLabel || (hasContent ? undefined : 'Button')}
		aria-busy={loading}
		{...rest}
	>
		<span class="btn-content">
			{#if loading}
				<span class="btn-loader">
					<svg class="btn-spinner" viewBox="0 0 24 24" fill="none">
						<circle
							class="btn-spinner-track"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="2"
						/>
						<circle
							class="btn-spinner-fill"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="2"
						/>
					</svg>
				</span>
			{:else if icon}
				<span class="btn-icon">{@render icon?.()}</span>
			{/if}
			{#if !iconOnly}
				{#if children}
					<span class="btn-text">{@render children?.()}</span>
				{:else if label}
					<span class="btn-text">{label}</span>
				{/if}
			{/if}
		</span>
	</button>
{/if}

<style>
	/* Button content wrapper for better layout control */
	.btn-content {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2);
		width: 100%;
		height: 100%;
		position: relative;
		z-index: 2;
	}

	/* Icon and text containers */
	.btn-icon,
	.btn-loader {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.btn-text {
		display: inline-block;
		line-height: 1;
	}

	/* Loading spinner */
	.btn-spinner {
		width: 1.25em;
		height: 1.25em;
		animation: btn-spin 1s linear infinite;
	}

	.btn-spinner-track {
		opacity: 0.25;
	}

	.btn-spinner-fill {
		stroke-dasharray: 45 62.83;
		stroke-dashoffset: 0;
		transform-origin: center;
		animation: btn-spinner-fill 1.4s ease-in-out infinite;
	}

	@keyframes btn-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes btn-spinner-fill {
		0% {
			stroke-dashoffset: 62.83;
			transform: rotate(0deg);
		}
		50% {
			stroke-dashoffset: 15.71;
			transform: rotate(135deg);
		}
		100% {
			stroke-dashoffset: 62.83;
			transform: rotate(720deg);
		}
	}

	/* Ensure disabled links behave properly */
	a[aria-disabled='true'] {
		opacity: 0.5;
		pointer-events: none;
		cursor: not-allowed;
	}
</style>
