import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NAMESPACE, releaseUrl, serverJsonProblems, stampServerJson } from './lib/mcp-registry.mjs';

const committed = JSON.parse(readFileSync('mcp/server.json', 'utf8'));
const manifestName = 'frederickmadore-website';

describe('mcp/server.json', () => {
	it('is a valid registry entry for its own release', () => {
		expect(serverJsonProblems(committed)).toEqual([]);
	});

	it('names the server the bundle and the MCP server already use', () => {
		expect(committed.name).toBe(`${NAMESPACE}${manifestName}`);
		expect(readFileSync('mcp/src/server.ts', 'utf8')).toContain(`name: '${manifestName}'`);
		expect(readFileSync('mcp/pack.mjs', 'utf8')).toContain(`name: '${manifestName}'`);
	});
});

describe('stampServerJson', () => {
	const sha256 = 'a'.repeat(64);

	it('points the bundle at the release asset and records its hash', () => {
		const stamped = stampServerJson(committed, { version: '9.8.7', sha256 });
		expect(stamped.version).toBe('9.8.7');
		expect(stamped.packages[0]).toMatchObject({
			registryType: 'mcpb',
			identifier: releaseUrl('9.8.7'),
			fileSha256: sha256
		});
		expect(stamped.packages[0].identifier).toBe(
			'https://github.com/fmadore/Website/releases/download/mcp-v9.8.7/frederickmadore-website.mcpb'
		);
		expect(serverJsonProblems(stamped)).toEqual([]);
		// The committed entry is left as it was.
		expect(committed.version).not.toBe('9.8.7');
	});

	it('refuses an entry whose first package is not the bundle', () => {
		expect(() =>
			stampServerJson(
				{ ...committed, packages: [{ registryType: 'npm' }] },
				{ version: '1.0.0', sha256 }
			)
		).toThrow('mcpb');
	});
});

describe('serverJsonProblems', () => {
	it('catches an entry that describes another release than its version', () => {
		expect(serverJsonProblems({ ...committed, version: '0.0.1' })).toEqual([
			expect.stringContaining('release asset for 0.0.1')
		]);
	});

	it('catches registry limits and a malformed hash', () => {
		const bad = stampServerJson(
			{ ...committed, name: 'io.github.someone/else', description: 'x'.repeat(101) },
			{ version: '1.0.0', sha256: 'not-a-hash' }
		);
		expect(serverJsonProblems(bad)).toEqual([
			expect.stringContaining('name'),
			expect.stringContaining('description'),
			expect.stringContaining('fileSha256')
		]);
	});
});
