import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

/**
 * Bundles the server into a single executable file.
 *
 * A bundler rather than plain `tsc` because the server is built from the site's
 * own modules, imported through the `$lib` alias: the document loader, search
 * and citation code in `src/lib/utils/api*.ts`, which the site's WebMCP tools
 * run too. Resolving that alias is what keeps the two agent surfaces, and the
 * site's own citation buttons, giving the same answers.
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
