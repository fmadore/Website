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

// App installation state
let isInstallable = $state(false);
let deferredPrompt: any = null;

/**
 * Direct access to animationsEnabled for components that need simple access
 * This provides a store-like interface for backward compatibility
 */
export const animationsEnabledStore = {
	get: () => animationsEnabled,
	set: (value: boolean) => {
		animationsEnabled = value;
	}
};

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

		// Installation controls
		get isInstallable() {
			return isInstallable;
		},
		set isInstallable(value: boolean) {
			isInstallable = value;
		},

		get deferredPrompt() {
			return deferredPrompt;
		},
		set deferredPrompt(value: any) {
			deferredPrompt = value;
		},

		// Temporary disable animations (useful for navigation)
		temporarilyDisableAnimations(duration: number = 100) {
			animationsEnabled = false;
			setTimeout(() => {
				animationsEnabled = true;
			}, duration);
		},

		// PWA installation helper
		async installApp() {
			if (deferredPrompt) {
				deferredPrompt.prompt();
				const { outcome } = await deferredPrompt.userChoice;
				console.log(`User ${outcome} the install prompt`);
				deferredPrompt = null;
				isInstallable = false;
			}
		}
	};
}

/**
 * Type-safe access to global state
 * Use this in components that need reactive access to global state
 */
export type GlobalState = ReturnType<typeof getGlobalState>;
