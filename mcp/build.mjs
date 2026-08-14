import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

/**
 * Bundles the server into a single executable file.
 *
 * A bundler rather than plain `tsc` because the server shares the site's own
 * `citationFormatter` (see src/citations.ts), which imports through the `$lib`
 * alias. Resolving that alias here is what lets the four citation styles live
 * in one place instead of being reimplemented and left to drift.
 */
const entries = ['index', 'http', 'server'];

await Promise.all(
	entries.map((name) =>
		build({
			entryPoints: [fileURLToPath(new URL(`./src/${name}.ts`, import.meta.url))],
			outfile: fileURLToPath(new URL(`./dist/${name}.js`, import.meta.url)),
			bundle: true,
			platform: 'node',
			target: 'node20',
			format: 'esm',
			// Dependencies stay external — they are installed alongside the package.
			packages: 'external',
			banner: { js: '#!/usr/bin/env node' },
			alias: {
				$lib: fileURLToPath(new URL('../src/lib', import.meta.url))
			},
			logLevel: 'info'
		})
	)
);
