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
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url))
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.ts'],
		environment: 'node'
	}
});
