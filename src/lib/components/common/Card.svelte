<script>
	import { scrollAnimate } from '$lib/utils/scrollAnimations';

	let {
		imageUrl = undefined,
		imageAlt: _imageAltProp = '', // Renamed to avoid conflict with the derived value
		linkUrl = undefined,
		target = '_blank', // Default to opening external links in new tab
		title = '',
		animationDelay = 0, // Animation delay in milliseconds
		variant = 'default', // Card variant: 'default' | 'primary' | 'secondary' | 'accent' | 'highlight' | 'entity' | 'glass'
		size = 'md', // Card size: 'sm' | 'md' | 'lg'
		layout = 'vertical', // Card layout: 'vertical' | 'horizontal'
		interactive = true, // Whether card has hover effects
		// Snippet props
		subtitle = undefined,
		details = undefined,
		action = undefined,
		children = undefined // For the default slot content
	} = $props();

	// Set default imageAlt if not provided, using $derived for Svelte 5
	let imageAlt = $derived(_imageAltProp || title);

	// Legacy class support for backward compatibility
	let legacyClasses = $derived(() => {
		const classes = ['card'];
		
		if (variant !== 'default') classes.push(`card-${variant}`);
		if (size !== 'md') {
			if (size === 'sm') classes.push('card-compact');
		}
		if (layout === 'horizontal') classes.push('card-horizontal');
		
		return classes.join(' ');
	});
</script>

<div
	class={legacyClasses}
	data-card
	data-variant={variant}
	data-size={size}
	data-layout={layout}
	data-interactive={interactive ? 'true' : undefined}
	use:scrollAnimate={{
		delay: animationDelay,
		animationClass: 'fade-in-up',
		threshold: 0.2,
		rootMargin: '100px'
	}}
>
	{#if imageUrl}
		<div class="card-image" data-card-image>
			{#if linkUrl}
				<a href={linkUrl} {target} rel="noopener noreferrer">
					<img
						src={imageUrl}
						alt={imageAlt}
						width="300"
						height="200"
						loading="lazy"
						decoding="async"
					/>
				</a>
			{:else}
				<img
					src={imageUrl}
					alt={imageAlt}
					width="300"
					height="200"
					loading="lazy"
					decoding="async"
				/>
			{/if}
		</div>
	{/if}

	<div class="card-body" data-card-body>
		<h2 class="card-title" data-card-title>
			{#if linkUrl}
				<a href={linkUrl} {target} rel="noopener noreferrer">
					{title}
				</a>
			{:else}
				{title}
			{/if}
		</h2>

		{#if subtitle}
			<div class="card-subtitle" data-card-subtitle>
				{@render subtitle()}
			</div>
		{/if}

		<div class="card-description" data-card-text>
			{@render children?.()}
			<!-- Default slot for main description -->
		</div>

		{#if details}
			<div class="card-details">
				{@render details()}
			</div>
		{/if}

		{#if action}
			<div class="card-action" data-card-action>
				{@render action()}
			</div>
		{/if}
	</div>
</div>
