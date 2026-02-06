/**
 * Global State Management using Svelte 5 State Runes
 *
 * This replaces traditional Svelte stores with Svelte 5's state runes
 * for better performance and consistency with the new reactive system.
 */

// Animation control state
let animationsEnabled = $state(true);

// Theme state (for future use)
let currentTheme = $state<'light' | 'dark'>('light');

// Loading state for global operations
let isGlobalLoading = $state(false);

// Network status state
let isOnline = $state(true);

/**
 * Get access to the global state with reactive getters and setters
 * This pattern provides controlled access to the state while maintaining reactivity
 */
export function getGlobalState() {
	return {
		// Animation controls
		get animationsEnabled() {
			return animationsEnabled;
		},
		set animationsEnabled(value: boolean) {
			animationsEnabled = value;
		},

		// Theme controls
		get currentTheme() {
			return currentTheme;
		},
		set currentTheme(value: 'light' | 'dark') {
			currentTheme = value;
		},

		// Loading state controls
		get isGlobalLoading() {
			return isGlobalLoading;
		},
		set isGlobalLoading(value: boolean) {
			isGlobalLoading = value;
		},

		// Helper methods
		toggleAnimations() {
			animationsEnabled = !animationsEnabled;
		},

		toggleTheme() {
			currentTheme = currentTheme === 'light' ? 'dark' : 'light';
		},

		// Network status controls
		get isOnline() {
			return isOnline;
		},
		set isOnline(value: boolean) {
			isOnline = value;
		},

		// Temporary disable animations (useful for navigation)
		temporarilyDisableAnimations(duration: number = 100) {
			animationsEnabled = false;
			setTimeout(() => {
				animationsEnabled = true;
			}, duration);
		}
	};
}

/**
 * Type-safe access to global state
 * Use this in components that need reactive access to global state
 */
export type GlobalState = ReturnType<typeof getGlobalState>;
