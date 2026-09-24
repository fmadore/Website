import { expect, it } from 'vitest';
import { resolve } from 'node:path';
import { sourceClosure, staticImports } from './lib/source-graph.mjs';

const file = resolve('src/lib/x.ts');

it('keeps value imports and drops type-only ones', () => {
	const { specifiers } = staticImports(
		file,
		[
			"import { a, type B } from './a';",
			"import type { C } from './c';",
			"import { type D, type E } from './d';",
			"import F, { type G } from './f';",
			"import './side-effect.css';",
			"export { h } from './h';",
			"export type { I } from './i';",
			"export * from './j';"
		].join('\n')
	);
	expect(specifiers.sort()).toEqual(['./a', './f', './h', './j', './side-effect.css']);
});

it('ignores dynamic imports and imports quoted in comments', () => {
	const { specifiers } = staticImports(
		file,
		[
			"const lazy = await import('./lazy');",
			"// import { old } from './old';",
			' * import { example } from "./example";',
			"import {\n\tmulti,\n\tline\n} from './multi';"
		].join('\n')
	);
	expect(specifiers).toEqual(['./multi']);
});

it('reads only the script blocks of a Svelte component', () => {
	const { specifiers } = staticImports(
		resolve('src/lib/X.svelte'),
		"<script module lang=\"ts\">\n\timport { m } from './m';\n</script>\n<script lang=\"ts\">\n\timport Y from './Y.svelte';\n</script>\n<p>import nothing from './markup';</p>"
	);
	expect(specifiers).toEqual(['./m', './Y.svelte']);
});

it('follows an eager glob, honouring its exclusions, and skips a lazy one', () => {
	const index = resolve('src/lib/data/languages/index.ts');
	const eager = staticImports(
		index,
		"import.meta.glob(['./*.ts', '!./index.ts'], { eager: true });"
	);
	expect(eager.globbed.length).toBeGreaterThan(0);
	expect(eager.globbed).not.toContain(index);
	expect(staticImports(index, "import.meta.glob('./*.ts');").globbed).toEqual([]);
});

it('closes over $lib aliases, extensionless paths and globbed data', () => {
	const closure = sourceClosure([resolve('src/lib/data/languages/index.ts')]);
	expect(closure.has('src/lib/utils/dataLoader.ts')).toBe(true);
	expect(closure.has('src/lib/data/languages/english.ts')).toBe(true);
	// A framework import is the chunk budget's business, not a repo module.
	expect([...closure].every((path) => path.startsWith('src/'))).toBe(true);
});
