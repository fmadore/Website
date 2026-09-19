import { expect, it } from 'vitest';
import { resolveReleaseVersion } from './lib/release-version.mjs';
it('resolves matching package, input, and tag identities', () => {
	expect(resolveReleaseVersion('0.2.0')).toBe('0.2.0');
	expect(
		resolveReleaseVersion('0.2.0', { input: '0.2.0', refType: 'tag', refName: 'mcp-v0.2.0' })
	).toBe('0.2.0');
});
it('rejects a mismatched artifact or tag before publishing', () => {
	expect(() => resolveReleaseVersion('0.2.0', { input: '0.3.0' })).toThrow('does not match');
	expect(() =>
		resolveReleaseVersion('0.2.0', { input: '0.2.0', refType: 'tag', refName: 'mcp-v0.3.0' })
	).toThrow('tag');
	expect(() => resolveReleaseVersion('0.2.0', { input: 'nonsense' })).toThrow('Invalid');
});
