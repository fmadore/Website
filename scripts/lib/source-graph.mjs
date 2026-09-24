/**
 * The modules a route actually imports, read from source.
 *
 * The chunk graph says what a route downloads; this says what its code asks
 * for. The difference is a *passenger*: a module that rides in a chunk the
 * route loads without the route ever importing it — which is what the
 * `shared` codeSplitting group's entries-aware merge produces when it folds a
 * small subgroup into a neighbour. Nothing else can see one: the page works,
 * the budgets absorb a few KiB, and only a byte-for-byte comparison of the
 * build output ever caught it.
 *
 * Static edges only, as in the chunk graph: `import()` is the split working as
 * designed. Type-only imports are erased by the compiler, so they are skipped.
 * An eager `import.meta.glob` is a static edge to every file it matches.
 * Specifiers that are not `$lib`, `$styles` or relative (packages, `$app/*`)
 * are the framework's, and are left to the chunk budgets.
 *
 * The parse is regular-expression based, anchored at line starts: it
 * over-approximates at worst (an import statement inside a template literal
 * would count), which can hide a passenger but never invent one.
 */
import { existsSync, globSync, readFileSync, statSync } from 'node:fs';
import { dirname, matchesGlob, relative, resolve } from 'node:path';

const ALIASES = [
	['$lib/', 'src/lib/'],
	['$styles/', 'src/styles/']
];
const EXTENSIONS = ['', '.ts', '.js', '.svelte', '/index.ts', '/index.js'];

/** The script blocks of a Svelte component, or the whole file otherwise. */
function codeOf(file, source) {
	if (!file.endsWith('.svelte')) return source;
	return [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');
}

/** Whether an import clause names only types (`type X`, `{ type A, type B }`). */
function typeOnly(clause) {
	const trimmed = clause.trim();
	if (/^type\s/.test(trimmed)) return true;
	const braces = /^\{([\s\S]*)\}$/.exec(trimmed);
	if (!braces) return false;
	const names = braces[1]
		.split(',')
		.map((name) => name.trim())
		.filter(Boolean);
	return names.length > 0 && names.every((name) => /^type\s/.test(name));
}

/**
 * The static import specifiers of one module, plus the files its eager
 * `import.meta.glob` calls match (as absolute paths).
 */
export function staticImports(file, source) {
	const code = codeOf(file, source);
	const specifiers = [];
	// Anchored at a line start, so an import quoted in a comment or JSDoc
	// example (a line that starts with `//` or `*`) is not an edge.
	for (const m of code.matchAll(/^\s*import\s+(?!['"(])([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/gm)) {
		if (!typeOnly(m[1])) specifiers.push(m[2]);
	}
	for (const m of code.matchAll(/^\s*import\s+['"]([^'"]+)['"]/gm)) specifiers.push(m[1]);
	for (const m of code.matchAll(
		/^\s*export\s+(\*|\*\s+as\s+\w+|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/gm
	)) {
		if (!typeOnly(m[1])) specifiers.push(m[2]);
	}
	const globbed = [];
	for (const m of code.matchAll(
		/import\.meta\.glob\s*(?:<[\s\S]*?>\s*)?\(\s*(\[[\s\S]*?\]|'[^']*'|"[^"]*")\s*(,\s*\{[^}]*\})?/g
	)) {
		if (!/eager\s*:\s*true/.test(m[2] ?? '')) continue;
		const patterns = [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((p) => p[1]);
		const include = patterns.filter((p) => !p.startsWith('!'));
		const exclude = patterns.filter((p) => p.startsWith('!')).map((p) => p.slice(1));
		const cwd = dirname(file);
		for (const match of globSync(include, { cwd })) {
			const rel = `./${match.split('\\').join('/')}`;
			if (!exclude.some((pattern) => matchesGlob(rel, pattern))) globbed.push(resolve(cwd, match));
		}
	}
	return { specifiers, globbed };
}

/** Resolve a specifier to a file under the repo, or null for the framework's. */
export function resolveSpecifier(specifier, fromFile, root = process.cwd()) {
	const bare = specifier.split('?')[0];
	let base = null;
	for (const [alias, path] of ALIASES) {
		if (bare.startsWith(alias)) base = resolve(root, path, bare.slice(alias.length));
	}
	if (!base && bare.startsWith('.')) base = resolve(dirname(fromFile), bare);
	if (!base) return null;
	for (const extension of EXTENSIONS) {
		const candidate = base + extension;
		if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
	}
	return null;
}

/**
 * Every repo module statically reachable from `roots` (absolute paths),
 * returned relative to `root` with forward slashes.
 */
export function sourceClosure(roots, root = process.cwd(), read = (f) => readFileSync(f, 'utf8')) {
	const seen = new Set();
	const visit = (file) => {
		if (seen.has(file)) return;
		seen.add(file);
		if (!/\.(ts|js|mjs|svelte)$/.test(file)) return;
		const { specifiers, globbed } = staticImports(file, read(file));
		for (const specifier of specifiers) {
			const target = resolveSpecifier(specifier, file, root);
			if (target) visit(target);
		}
		globbed.forEach(visit);
	};
	roots.forEach(visit);
	return new Set([...seen].map((file) => relative(root, file).split('\\').join('/')));
}
