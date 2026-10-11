import { expect, it } from 'vitest';
import path from 'node:path';
import { walkData, loadModule } from './vault-sync-lib.mjs';

it('loads communication records without importing CV or summary views', async () => {
	const files = walkData(path.resolve('src/lib/data/communications'));
	expect(files.length).toBeGreaterThan(0);
	expect(files.some((file) => path.basename(file) === 'cv.ts')).toBe(false);
	const records = await Promise.all(files.map(loadModule));
	expect(records.every((record) => typeof record.id === 'string')).toBe(true);
	expect(records.some((record) => record.id === 'serveurs-mcp-glam-africains-stias-2026')).toBe(
		true
	);
});
