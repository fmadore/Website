import { describe, it, expect } from 'vitest';
import { loadData } from './dataLoader';
import type { Publication } from '$lib/types/publication';

/** Minimal item factory — only the fields loadData itself touches. */
function item(id: string, extra: Record<string, unknown> = {}) {
	return { id, title: `Title ${id}`, ...extra } as unknown as Publication;
}

describe('loadData', () => {
	it('extracts the default export when it has an id', () => {
		const modules = { './a.ts': { default: item('a') } };
		const result = loadData<Publication>(modules, []);
		expect(result.map((r) => r.id)).toEqual(['a']);
	});

	it('falls back to the first named export with an id when there is no default', () => {
		const modules = { './b.ts': { somethingElse: 42, theItem: item('b') } };
		const result = loadData<Publication>(modules, []);
		expect(result.map((r) => r.id)).toEqual(['b']);
	});

	it('prefers the default export over named exports', () => {
		const modules = { './c.ts': { named: item('named'), default: item('default') } };
		const result = loadData<Publication>(modules, []);
		expect(result.map((r) => r.id)).toEqual(['default']);
	});

	it('skips modules that are not objects', () => {
		const modules = {
			'./bad-null.ts': null,
			'./bad-number.ts': 7,
			'./good.ts': { default: item('good') }
		};
		const result = loadData<Publication>(modules, []);
		expect(result.map((r) => r.id)).toEqual(['good']);
	});

	it('skips modules with no export carrying an id', () => {
		const modules = {
			'./empty.ts': {},
			'./no-id.ts': { default: { title: 'anonymous' } },
			'./good.ts': { default: item('good') }
		};
		const result = loadData<Publication>(modules, []);
		expect(result.map((r) => r.id)).toEqual(['good']);
	});

	it('filters out a single template id', () => {
		const modules = {
			'./template.ts': { default: item('the-template') },
			'./real.ts': { default: item('real') }
		};
		const result = loadData<Publication>(modules, 'the-template');
		expect(result.map((r) => r.id)).toEqual(['real']);
	});

	it('filters out every id in a template-id array', () => {
		const modules = {
			'./t1.ts': { default: item('t1') },
			'./t2.ts': { default: item('t2') },
			'./real.ts': { default: item('real') }
		};
		const result = loadData<Publication>(modules, ['t1', 't2']);
		expect(result.map((r) => r.id)).toEqual(['real']);
	});

	it('applies the transform with the module path', () => {
		const modules = { './books/x.ts': { default: item('x') } };
		const result = loadData<Publication>(modules, [], 'publication', (loaded, path) => ({
			...loaded,
			sourceDirType: path.startsWith('./books/') ? 'books' : 'unknown'
		}));
		expect((result[0] as Publication & { sourceDirType: string }).sourceDirType).toBe('books');
	});

	it('returns an empty array for an empty module map', () => {
		expect(loadData<Publication>({}, [])).toEqual([]);
	});
});
