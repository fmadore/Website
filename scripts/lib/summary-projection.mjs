/**
 * The projection both summaries generators apply: every field of a record
 * except the heavy ones, plus `abstractExcerpt` — the abstract's first
 * ABSTRACT_EXCERPT_LENGTH + 1 characters, one more than the longest truncation
 * a row applies, so `truncateAbstract(excerpt, n)` equals
 * `truncateAbstract(abstract, n)` for every permitted n, ellipsis included
 * (each dataset's summaries.test.ts enforces it).
 */
import { ABSTRACT_EXCERPT_LENGTH } from '../../src/lib/data/publications/summaryConfig.ts';

export function projectSummary(record, heavyFields) {
	const summary = {};
	for (const [key, value] of Object.entries(record)) {
		if (!heavyFields.includes(key)) summary[key] = value;
	}
	if (typeof record.abstract === 'string' && record.abstract.length > 0) {
		// One character past the contract length: an abstract that continues
		// beyond it stays longer than any permitted truncation, so the row's
		// truncation still appends its ellipsis.
		const keep = ABSTRACT_EXCERPT_LENGTH + 1;
		summary.abstractExcerpt =
			record.abstract.length <= keep ? record.abstract : record.abstract.slice(0, keep);
	}
	return summary;
}
