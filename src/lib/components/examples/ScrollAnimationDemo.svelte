<script lang="ts">
	import { scrollAnimate, staggeredAnimation, smoothScrollTo } from '$lib/utils/scrollAnimations';
	import { onMount } from 'svelte';

	let demoContainer: HTMLElement;
	let staggeredItems: HTMLElement[] = [];

	onMount(() => {
		// Example of staggered animation for a list
		if (staggeredItems.length > 0) {
			staggeredAnimation(staggeredItems, {
				delay: 200,
				stagger: 150,
				animationClass: 'fade-in-up'
			});
		}
	});

	function scrollToSection(sectionId: string) {
		smoothScrollTo(`#${sectionId}`, {
			offset: 80,
			duration: 1000
		});
	}
</script>

<div class="scroll-demo-container" bind:this={demoContainer}>
	<!-- Navigation with smooth scroll -->
	<nav class="demo-nav glass-card">
		<h2>Scroll Animation Demo</h2>
		<div class="nav-buttons">
			<button onclick={() => scrollToSection('basic-animations')}>Basic Animations</button>
			<button onclick={() => scrollToSection('staggered-list')}>Staggered List</button>
			<button onclick={() => scrollToSection('advanced-effects')}>Advanced Effects</button>
		</div>
	</nav>

	<!-- Basic scroll animations -->
	<section id="basic-animations" class="demo-section">
		<h3 use:scrollAnimate={{ animationClass: 'fade-in-down', delay: 100 }}>
			Basic Scroll Animations
		</h3>
		
		<div class="animation-grid">
			<div 
				class="demo-card glass-light"
				use:scrollAnimate={{ animationClass: 'fade-in-up', delay: 200 }}
			>
				<h4>Fade In Up</h4>
				<p>This card fades in from below as you scroll.</p>
			</div>
			
			<div 
				class="demo-card glass-light"
				use:scrollAnimate={{ animationClass: 'fade-in-left', delay: 300 }}
			>
				<h4>Fade In Left</h4>
				<p>This card slides in from the left.</p>
			</div>
			
			<div 
				class="demo-card glass-light"
				use:scrollAnimate={{ animationClass: 'scale-in', delay: 400 }}
			>
				<h4>Scale In</h4>
				<p>This card scales up as it appears.</p>
			</div>
		</div>
	</section>

	<!-- Staggered list animations -->
	<section id="staggered-list" class="demo-section">
		<h3 use:scrollAnimate={{ animationClass: 'fade-in-down' }}>
			Staggered List Animation
		</h3>
		
		<div class="staggered-list">
			{#each Array(6) as _, i}
				<div 
					class="list-item glass-light"
					bind:this={staggeredItems[i]}
				>
					<div class="item-number">{i + 1}</div>
					<div class="item-content">
						<h4>List Item {i + 1}</h4>
						<p>This item appears with a staggered delay.</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Advanced effects -->
	<section id="advanced-effects" class="demo-section">
		<h3 use:scrollAnimate={{ animationClass: 'bounce-in' }}>
			Advanced Effects
		</h3>
		
		<div class="effects-grid">
			<div 
				class="effect-card glass-medium"
				use:scrollAnimate={{ 
					animationClass: 'slide-in-right', 
					delay: 100,
					once: false 
				}}
			>
				<h4>Repeating Animation</h4>
				<p>This animation triggers every time you scroll past it (once: false).</p>
			</div>
			
			<div 
				class="effect-card glass-medium"
				use:scrollAnimate={{ 
					animationClass: 'fade-in-up',
					threshold: 0.5,
					delay: 200
				}}
			>
				<h4>High Threshold</h4>
				<p>This only animates when 50% of the element is visible.</p>
			</div>
		</div>
	</section>
</div>

<style>
	.scroll-demo-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--spacing-8);
	}

	.demo-nav {
		position: sticky;
		top: var(--spacing-4);
		z-index: 10;
		padding: var(--spacing-6);
		margin-bottom: var(--spacing-12);
		text-align: center;
	}

	.demo-nav h2 {
		margin-bottom: var(--spacing-4);
		color: var(--color-text-emphasis);
	}

	.nav-buttons {
		display: flex;
		gap: var(--spacing-3);
		justify-content: center;
		flex-wrap: wrap;
	}

	.nav-buttons button {
		padding: var(--spacing-2) var(--spacing-4);
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--border-radius-md);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.nav-buttons button:hover {
		background: var(--color-primary-dark);
		transform: var(--transform-lift-sm);
	}

	.demo-section {
		margin-bottom: var(--spacing-16);
		padding: var(--spacing-8) 0;
	}

	.demo-section h3 {
		text-align: center;
		margin-bottom: var(--spacing-8);
		font-size: var(--font-size-2xl);
		color: var(--color-text-emphasis);
	}

	.animation-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-6);
		margin-bottom: var(--spacing-8);
	}

	.demo-card {
		padding: var(--spacing-6);
		border-radius: var(--border-radius-lg);
		text-align: center;
		transition: all 0.3s ease;
	}

	.demo-card:hover {
		transform: var(--transform-lift-md);
	}

	.demo-card h4 {
		margin-bottom: var(--spacing-3);
		color: var(--color-primary);
	}

	.staggered-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-4);
		max-width: 600px;
		margin: 0 auto;
	}

	.list-item {
		display: flex;
		align-items: center;
		padding: var(--spacing-4);
		border-radius: var(--border-radius-md);
		transition: all 0.3s ease;
	}

	.list-item:hover {
		transform: translateX(var(--spacing-2));
	}

	.item-number {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--color-primary);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: var(--font-weight-bold);
		margin-right: var(--spacing-4);
		flex-shrink: 0;
	}

	.item-content h4 {
		margin-bottom: var(--spacing-1);
		color: var(--color-text-emphasis);
	}

	.item-content p {
		color: var(--color-text-light);
		margin: 0;
	}

	.effects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: var(--spacing-8);
	}

	.effect-card {
		padding: var(--spacing-8);
		border-radius: var(--border-radius-xl);
		text-align: center;
		min-height: 200px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.effect-card h4 {
		margin-bottom: var(--spacing-4);
		color: var(--color-highlight);
		font-size: var(--font-size-lg);
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.scroll-demo-container {
			padding: var(--spacing-4);
		}

		.nav-buttons {
			flex-direction: column;
			align-items: center;
		}

		.nav-buttons button {
			width: 100%;
			max-width: 200px;
		}

		.animation-grid,
		.effects-grid {
			grid-template-columns: 1fr;
		}

		.list-item {
			flex-direction: column;
			text-align: center;
		}

		.item-number {
			margin-right: 0;
			margin-bottom: var(--spacing-2);
		}
	}
</style> 