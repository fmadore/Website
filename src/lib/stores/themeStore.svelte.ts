import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

const defaultTheme: Theme = 'light';

// Function to get the initial theme
function getInitialTheme(): Theme {
	if (!browser) return defaultTheme; // Default for SSR

	/* A stored choice is a convenience, not a requirement. This module is
	 * evaluated at boot on every page (layout -> Header -> ThemeToggle), so an
	 * unguarded read throws wherever storage is blocked or partitioned,
	 * hydration dies with it, and SvelteKit renders the error page at status
	 * 500 over a document that was served fine. Falling through to the OS
	 * preference is the honest degradation. Mirrored in `src/app.html` and
	 * `static/404.html` — edit the three together. */
	let storedTheme: Theme | null = null;
	try {
		storedTheme = localStorage.getItem('theme') as Theme | null;
	} catch {
		// Storage blocked; the OS preference below answers instead.
	}
	if (storedTheme && ['light', 'dark'].includes(storedTheme)) {
		return storedTheme;
	}

	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return prefersDark ? 'dark' : 'light';
}

/**
 * Point the browser chrome at the page's own ground.
 *
 * `src/app.html` ships two media-scoped `theme-color` metas, which is the right
 * answer for a reader whose theme is simply the OS preference. A stored choice
 * can contradict the OS, and then the matching meta is the wrong one — so both
 * are overwritten with the resolved theme's `--color-background`. The value is
 * read from the stylesheet rather than hand-copied: a custom property's computed
 * value is already substituted, so this is the token itself, not a copy of it.
 */
function applyThemeColorMeta() {
	const ground = getComputedStyle(document.documentElement)
		.getPropertyValue('--color-background')
		.trim();
	if (!ground) return;
	for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
		meta.setAttribute('content', ground);
	}
}

// Function to apply the theme class to the HTML element
function applyTheme(newTheme: Theme) {
	if (browser) {
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(newTheme);
		/* Also on the boot path, via the `applyTheme(initialTheme)` call below:
		 * the write has to be guarded for the same reason as the read. */
		try {
			localStorage.setItem('theme', newTheme);
		} catch {
			// Storage blocked; the choice holds for this page without persisting.
		}
		applyThemeColorMeta();
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
