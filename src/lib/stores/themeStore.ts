import { writable } from 'svelte/store';
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

// Create the writable store
const initialTheme = getInitialTheme();
export const theme = writable<Theme>(initialTheme);

// Function to apply the theme class to the HTML element
function applyTheme(newTheme: Theme) {
	if (browser) {
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(newTheme);
		localStorage.setItem('theme', newTheme);
	}
}

// Subscribe to theme changes to apply them
theme.subscribe((newTheme) => {
	applyTheme(newTheme);
});

// Function to toggle the theme
export function toggleTheme() {
	theme.update((currentTheme) => {
		const newTheme = currentTheme === 'light' ? 'dark' : 'light';
		return newTheme;
	});
}

// Initialize the theme class on first load (client-side)
if (browser) {
	applyTheme(initialTheme);
}
