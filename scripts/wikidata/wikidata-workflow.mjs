import { readFileSync } from 'node:fs';
import { hash, qid, insertQid, isForthcoming } from './wikidata.mjs';

export function readJson(file) {
	return JSON.parse(readFileSync(file, 'utf8'));
}
export function validateReport(report, entries) {
	if (
		report.version !== 1 ||
		report.complete !== true ||
		report.errors?.length ||
		!Array.isArray(report.publications)
	)
		throw new Error('A complete version 1 audit is required');
	const age = Date.now() - Date.parse(report.generatedAt);
	if (!Number.isFinite(age) || age < -60000 || age > 7 * 86400000)
		throw new Error('Audit is stale; rerun wikidata:audit (maximum age: 7 days)');
	const rows = new Map();
	for (const row of report.publications) {
		if (rows.has(row.id)) throw new Error(`Duplicate audit ID: ${row.id}`);
		const entry = entries.find(({ record }) => record.id === row.id);
		if (entry && isForthcoming(entry.record)) continue;
		if (!entry || row.sourceHash !== hash(readFileSync(entry.file, 'utf8')))
			throw new Error(`Source changed since audit: ${row.id}; rerun audit`);
		rows.set(row.id, row);
	}
	return rows;
}
export function validateDecisions(decisions, rows) {
	if (!decisions || Array.isArray(decisions) || typeof decisions !== 'object')
		throw new Error('Decisions must be an object keyed by publication ID');
	for (const [id, decision] of Object.entries(decisions)) {
		// A work the skill created that the site does not list (a container: an
		// edited volume, a yearbook volume) is marked as such; any other unknown ID
		// is a typo and stops the run.
		if (decision?.notOnSite === true && !rows.has(id)) continue;
		if (!rows.has(id))
			throw new Error(
				`Decision missing from eligible audit records (forthcoming works are excluded): ${id}`
			);
		if (!decision || typeof decision !== 'object' || Array.isArray(decision))
			throw new Error(`Invalid decision: ${id}`);
		if (decision.qid) qid(decision.qid);
		if (decision.qid && (decision.create || decision.action === 'create'))
			throw new Error(`Choose match or create: ${id}`);
	}
}
export function planEdits(entries, rows, decisions, acceptExact) {
	const assigned = new Map();
	const edits = [];
	for (const { file, record } of entries) {
		if (isForthcoming(record)) continue;
		const row = rows.get(record.id);
		const decision = decisions[record.id];
		const selected =
			decision?.qid ??
			(!decision && acceptExact && row?.status === 'exact' ? row.suggestedQid : null);
		const value = selected ?? record.wikidataId;
		if (value) {
			qid(value);
			if (assigned.has(value))
				throw new Error(`QID ${value} assigned to both ${assigned.get(value)} and ${record.id}`);
			assigned.set(value, record.id);
		}
		if (!selected) continue;
		const source = readFileSync(file, 'utf8');
		const updated = insertQid(source, record.id, selected);
		if (source !== updated) edits.push({ file, record, qid: selected, source, updated });
	}
	return edits;
}
