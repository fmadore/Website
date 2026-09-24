/** Walk static imports only, failing closed when build metadata is incomplete. */
export function staticGraph(manifest, ...roots) {
	const seen = new Set();
	const visit = (key) => {
		if (seen.has(key)) return;
		if (!manifest[key]?.file) throw new Error(`Missing bundle manifest entry: ${key}`);
		seen.add(key);
		for (const next of manifest[key].imports ?? []) visit(next);
	};
	roots.forEach(visit);
	return seen;
}

/** SvelteKit's server manifest records the actual layout chain, including layout resets. */
export function pageRoots(page, nodeDirectory) {
	if (!Number.isInteger(page?.leaf) || !Array.isArray(page.layouts))
		throw new Error('Invalid page manifest');
	return [...new Set([...page.layouts.filter((n) => n != null), page.leaf])].map(
		(n) => `${nodeDirectory}/${n}.js`
	);
}

export function graphBytes(manifest, keys, sizeOf) {
	const files = new Set([...keys].map((k) => manifest[k].file).filter((f) => f.endsWith('.js')));
	return [...files].reduce((sum, file) => sum + sizeOf(file), 0);
}

/**
 * The dataset modules among a chunk's sourcemap sources: anything inside a
 * `src/lib/data/<category>/` directory. The files directly in `src/lib/data/`
 * (siteConfig, navigation) are configuration every page genuinely needs.
 */
export function datasetSources(sources) {
	return sources
		.map((source) => source.replace(/\\/g, '/'))
		.map((source) => /(?:^|\/)(src\/lib\/data\/[^/]+\/.+)$/.exec(source)?.[1])
		.filter(Boolean);
}
