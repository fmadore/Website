import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Standalone Vitest config for pure-function unit tests.
 *
 * Deliberately does NOT load the SvelteKit Vite plugin: the tested modules are
 * plain TS (data aggregation, JSON-LD builders) with no component or `$app/*`
 * runtime dependency, so we only need the `$lib` path alias resolved.
 */
export default defineConfig({
	resolve: {
		alias: {
			// Stub SvelteKit's `$app/environment` virtual module (no SvelteKit
			// plugin here) so pure utils with a transitive dependency on it
			// (e.g. chartColorUtils → themeStore) stay importable in plain Node.
			// More specific aliases must come before the generic `$lib` entry.
			'$app/environment': fileURLToPath(
				new URL('./src/lib/test-support/app-environment-stub.ts', import.meta.url)
			),
			// themeStore uses Svelte 5 runes ($state), which need the Svelte
			// compiler; stub it with a rune-free getTheme() for plain-Node tests.
			'$lib/stores/themeStore.svelte': fileURLToPath(
				new URL('./src/lib/test-support/theme-store-stub.ts', import.meta.url)
			),
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url))
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.ts'],
		environment: 'node'
	}
});
