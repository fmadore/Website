import { animationsEnabled } from '$lib/stores/animationControl';
import { get } from 'svelte/store';

/**
 * Scroll Animation Utilities
 * Provides reusable functions for implementing smooth scroll animations
 */

export interface ScrollAnimationOptions {
	threshold?: number;
	rootMargin?: string;
	once?: boolean;
	delay?: number;
	duration?: number;
	easing?: string;
}

export interface ScrollAnimationConfig {
	element: HTMLElement;
	animationClass?: string;
	options?: ScrollAnimationOptions;
	onEnter?: (element: HTMLElement) => void;
	onExit?: (element: HTMLElement) => void;
}

/**
 * Creates an intersection observer for scroll-triggered animations
 */
export function createScrollObserver(configs: ScrollAnimationConfig[]): IntersectionObserver {
	if (!get(animationsEnabled)) {
		configs.forEach(({ element, animationClass, onEnter }) => {
			if (animationClass) {
				element.classList.add(animationClass);
			}
			onEnter?.(element);
		});
		// Return a dummy observer that does nothing
		return new IntersectionObserver(() => {});
	}

	const defaultOptions: ScrollAnimationOptions = {
		threshold: 0.1,
		rootMargin: '50px',
		once: true,
		delay: 0,
		duration: 600,
		easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
	};

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const config = configs.find(c => c.element === entry.target);
				if (!config) return;

				const options = { ...defaultOptions, ...config.options };

				if (entry.isIntersecting) {
					// Add animation class with delay
					setTimeout(() => {
						if (config.animationClass) {
							entry.target.classList.add(config.animationClass);
						}
						config.onEnter?.(entry.target as HTMLElement);
					}, options.delay);

					// If once is true, stop observing this element
					if (options.once) {
						observer.unobserve(entry.target);
					}
				} else if (!options.once) {
					// Remove animation class when element exits viewport
					if (config.animationClass) {
						entry.target.classList.remove(config.animationClass);
					}
					config.onExit?.(entry.target as HTMLElement);
				}
			});
		},
		{
			threshold: configs[0]?.options?.threshold || defaultOptions.threshold,
			rootMargin: configs[0]?.options?.rootMargin || defaultOptions.rootMargin
		}
	);

	// Start observing all elements
	configs.forEach(config => {
		observer.observe(config.element);
	});

	return observer;
}

/**
 * Svelte action for scroll animations
 */
export function scrollAnimate(
	element: HTMLElement,
	options: ScrollAnimationOptions & { animationClass?: string } = {}
) {
	if (!get(animationsEnabled)) {
		element.style.opacity = '1';
		element.style.transform = 'none';
		element.style.transition = 'none';

		// Clean up the inline style after the current frame to avoid interfering
		// with other potential style changes.
		requestAnimationFrame(() => {
			element.style.transition = '';
		});

		return {
			destroy() {
				/* No-op */
			}
		};
	}

	const defaultOptions: ScrollAnimationOptions = {
		threshold: 0.1,
		rootMargin: '50px',
		once: true,
		delay: 0
	};

	const finalOptions = { ...defaultOptions, ...options };
	
	// Set initial state
	element.style.opacity = '0';
	element.style.transform = 'translateY(30px)';
	element.style.transition = `all ${finalOptions.duration || 600}ms ${finalOptions.easing || 'cubic-bezier(0.4, 0, 0.2, 1)'}`;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					setTimeout(() => {
						element.style.opacity = '1';
						element.style.transform = 'translateY(0)';
						
						if (options.animationClass) {
							element.classList.add(options.animationClass);
						}
					}, finalOptions.delay);

					if (finalOptions.once) {
						observer.unobserve(element);
					}
				} else if (!finalOptions.once) {
					element.style.opacity = '0';
					element.style.transform = 'translateY(30px)';
					
					if (options.animationClass) {
						element.classList.remove(options.animationClass);
					}
				}
			});
		},
		{
			threshold: finalOptions.threshold,
			rootMargin: finalOptions.rootMargin
		}
	);

	observer.observe(element);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}

/**
 * Smooth scroll to element with offset
 */
export function smoothScrollTo(
	target: string | HTMLElement,
	options: {
		offset?: number;
		duration?: number;
		easing?: (t: number) => number;
		callback?: () => void;
	} = {}
) {
	const element = typeof target === 'string' ? document.querySelector(target) : target;
	if (!element) return;

	const startPosition = window.pageYOffset;
	const targetPosition = element.getBoundingClientRect().top + startPosition - (options.offset || 0);
	const distance = targetPosition - startPosition;
	const duration = options.duration || 800;
	const easing = options.easing || ((t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

	let startTime: number | null = null;

	function animation(currentTime: number) {
		if (startTime === null) startTime = currentTime;
		const timeElapsed = currentTime - startTime;
		const progress = Math.min(timeElapsed / duration, 1);
		const easedProgress = easing(progress);

		window.scrollTo(0, startPosition + distance * easedProgress);

		if (progress < 1) {
			requestAnimationFrame(animation);
		} else {
			options.callback?.();
		}
	}

	requestAnimationFrame(animation);
}

/**
 * Parallax scroll effect
 */
export function parallaxScroll(
	element: HTMLElement,
	speed: number = 0.5,
	direction: 'vertical' | 'horizontal' = 'vertical'
) {
	function updateParallax() {
		const scrolled = window.pageYOffset;
		const rate = scrolled * -speed;
		
		if (direction === 'vertical') {
			element.style.transform = `translateY(${rate}px)`;
		} else {
			element.style.transform = `translateX(${rate}px)`;
		}
	}

	// Throttle scroll events for performance
	let ticking = false;
	function requestTick() {
		if (!ticking) {
			requestAnimationFrame(updateParallax);
			ticking = true;
		}
	}

	function handleScroll() {
		ticking = false;
		requestTick();
	}

	window.addEventListener('scroll', handleScroll, { passive: true });

	return {
		destroy() {
			window.removeEventListener('scroll', handleScroll);
		}
	};
}

/**
 * Staggered animations for lists
 */
export function staggeredAnimation(
	elements: HTMLElement[],
	options: {
		delay?: number;
		stagger?: number;
		animationClass?: string;
		threshold?: number;
	} = {}
) {
	if (!get(animationsEnabled)) {
		elements.forEach((element) => {
			element.style.opacity = '1';
			element.style.transform = 'translateY(0)';
			element.style.transition = 'none';

			requestAnimationFrame(() => {
				element.style.transition = '';
			});
		});
		return {
			destroy() {
				/* No-op */
			}
		};
	}

	const { delay = 0, stagger = 100, animationClass = 'animate-in', threshold = 0.1 } = options;

	// Set initial state for all elements
	elements.forEach((element, index) => {
		element.style.opacity = '0';
		element.style.transform = 'translateY(20px)';
		element.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1)`;
		element.style.transitionDelay = `${delay + index * stagger}ms`;
	});

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const element = entry.target as HTMLElement;
					element.style.opacity = '1';
					element.style.transform = 'translateY(0)';
					element.classList.add(animationClass);
					observer.unobserve(element);
				}
			});
		},
		{ threshold }
	);

	elements.forEach(element => observer.observe(element));

	return {
		destroy() {
			observer.disconnect();
		}
	};
}

/**
 * Reading progress indicator
 */
export function createReadingProgress(
	container: HTMLElement,
	progressBar: HTMLElement,
	options: {
		offset?: number;
		smoothing?: number;
	} = {}
) {
	const { offset = 0, smoothing = 0.1 } = options;
	let currentProgress = 0;
	let targetProgress = 0;

	function updateProgress() {
		const containerRect = container.getBoundingClientRect();
		const containerHeight = container.offsetHeight;
		const viewportHeight = window.innerHeight;
		
		// Calculate how much of the container has been scrolled through
		const scrolled = Math.max(0, -containerRect.top + offset);
		const maxScroll = containerHeight - viewportHeight + offset;
		
		targetProgress = Math.min(100, Math.max(0, (scrolled / maxScroll) * 100));
		
		// Smooth the progress with easing
		currentProgress += (targetProgress - currentProgress) * smoothing;
		
		progressBar.style.width = `${currentProgress}%`;
		
		if (Math.abs(targetProgress - currentProgress) > 0.1) {
			requestAnimationFrame(updateProgress);
		}
	}

	let ticking = false;
	function handleScroll() {
		if (!ticking) {
			requestAnimationFrame(updateProgress);
			ticking = true;
		}
	}

	window.addEventListener('scroll', handleScroll, { passive: true });

	return {
		destroy() {
			window.removeEventListener('scroll', handleScroll);
		}
	};
} 