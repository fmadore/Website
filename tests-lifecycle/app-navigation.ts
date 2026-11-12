import { page } from './app-state.svelte';

/** Every URL handed to `replaceState`, oldest first. */
export const replaced: string[] = [];

/**
 * Stand-in for `$app/navigation`. Like SvelteKit's shallow routing, it updates
 * `page.state` and `page.shallow` and leaves `page.url` where it was.
 */
export function replaceState(url: string, state: App.PageState): void {
	replaced.push(url);
	page.state = state;
	page.shallow = { url: new URL(url, page.url) };
}
