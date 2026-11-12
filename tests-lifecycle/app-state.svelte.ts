/** Stand-in for `$app/state`: a reactive `page` the tests drive by hand. */
export const page = $state({
	// Replaced wholesale, never mutated in place, as SvelteKit's own `page.url` is.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	url: new URL('https://www.frederickmadore.com/'),
	state: {} as App.PageState,
	/** The target of the last shallow history edit, as SvelteKit keeps it; null after a navigation. */
	shallow: null as { url: URL } | null
});
