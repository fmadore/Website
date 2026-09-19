import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';

/** Compile runes and use Svelte's client scheduler without mounting DOM components. */
export default defineConfig({
	plugins: [
		svelte({
			configFile: false,
			compilerOptions: { runes: true },
			dynamicCompileOptions: () => ({ generate: 'client' })
		})
	],
	resolve: {
		conditions: ['browser'],
		alias: [
			{
				find: '$app/environment',
				replacement: fileURLToPath(new URL('./tests-lifecycle/environment.ts', import.meta.url))
			},
			{
				find: /^svelte$/,
				replacement: fileURLToPath(
					new URL('./node_modules/svelte/src/index-client.js', import.meta.url)
				)
			},
			{ find: '$lib', replacement: fileURLToPath(new URL('./src/lib', import.meta.url)) }
		]
	},
	test: {
		include: ['tests-lifecycle/**/*.test.svelte.ts'],
		environment: 'node',
		server: { deps: { inline: ['svelte'] } }
	}
});
