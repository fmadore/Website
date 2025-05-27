import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

const defaultTheme: Theme = 'light';

// Function to get the initial theme
function getInitialTheme(): Theme {
	if (!browser) return defaultTheme; // Default for SSR

	const storedTheme = localStorage.getItem('theme') as Theme | null;
	if (storedTheme && ['light', 'dark'].includes(storedTheme)) {
		return storedTheme;
	}

	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return prefersDark ? 'dark' : 'light';
}

// Function to apply the theme class to the HTML element
function applyTheme(newTheme: Theme) {
	if (browser) {
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(newTheme);
		localStorage.setItem('theme', newTheme);
	}
}

// Svelte 5: Create reactive theme state using runes
const initialTheme = getInitialTheme();
let currentTheme = $state(initialTheme);

// Export getter function for the theme
export function getTheme() {
	return currentTheme;
}

// Function to toggle the theme
export function toggleTheme() {
	const newTheme = currentTheme === 'light' ? 'dark' : 'light';
	currentTheme = newTheme;
	applyTheme(newTheme);
}

// Initialize the theme class on first load (client-side)
if (browser) {
	applyTheme(initialTheme);
}
