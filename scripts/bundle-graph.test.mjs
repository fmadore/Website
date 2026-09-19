import { expect, it } from 'vitest';
import { graphBytes, pageRoots, staticGraph } from './lib/bundle-graph.mjs';
it('includes nested layouts and counts shared chunks once, excluding dynamic imports', () => {
	const manifest = {
		'nodes/0.js': { file: 'layout.js', imports: ['shared'] },
		'nodes/2.js': { file: 'nested.js', imports: ['shared'] },
		'nodes/3.js': { file: 'page.js', imports: ['shared'], dynamicImports: ['heavy'] },
		shared: { file: 'shared.js' },
		heavy: { file: 'heavy.js' }
	};
	const roots = pageRoots({ layouts: [0, undefined, 2], leaf: 3 }, 'nodes');
	expect(graphBytes(manifest, staticGraph(manifest, ...roots), () => 10)).toBe(40);
	expect(pageRoots({ layouts: [0], leaf: 3 }, 'nodes')).toEqual(['nodes/0.js', 'nodes/3.js']);
});
it('rejects missing roots, dependencies, and emitted files', () => {
	expect(() => staticGraph({}, 'missing')).toThrow('Missing bundle manifest entry');
	const manifest = { entry: { file: 'entry.js', imports: ['missing'] } };
	expect(() => staticGraph(manifest, 'entry')).toThrow('missing');
	expect(() =>
		graphBytes(manifest, new Set(['entry']), () => {
			throw new Error('file missing');
		})
	).toThrow('file missing');
});
