import { expect, it } from 'vitest';
import { pickRecord, isDataItem, TEMPLATE_IDS } from './lib/data-records.mjs';
it('shares strict source validation with runtime loaders', () => {
	expect(() => pickRecord({ default: { title: 'lost' } }, 'missing.ts')).toThrow('missing.ts');
	expect(() => pickRecord({ first: { id: 'one' }, second: { id: 'two' } }, 'two.ts')).toThrow(
		'exactly one'
	);
	expect(pickRecord({ default: { id: 'valid' } }, 'valid.ts').id).toBe('valid');
});
it('excludes only known helper file shapes and includes poster template metadata', () => {
	expect(isDataItem('papers/real.ts')).toBe(true);
	for (const name of [
		'index.ts',
		'summaries.generated.ts',
		'summaryConfig.ts',
		'paper-template.ts'
	])
		expect(isDataItem(name)).toBe(false);
	expect(TEMPLATE_IDS.has('poster-template-id')).toBe(true);
});
