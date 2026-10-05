import { describe, expect, it } from 'vitest';
import { allPeople } from './index';
import { institutions } from '$lib/data/institutions';
import { allPublications } from '$lib/data/publications';
import { allCommunications } from '$lib/data/communications';
import { collaboratorNameKey } from '$lib/utils/collaboratorAggregation';
import { getContributorName } from '$lib/utils/contributor';
import { author } from '$lib/data/siteConfig';

describe('sourced collaborator registry', () => {
	it('resolves every explicit reference without changing the credited name', () => {
		const people = new Map(allPeople.map((person) => [person.id, person]));
		const credits = [
			...allPublications.flatMap((record) => record.authors),
			...allCommunications.flatMap((record) => [
				...record.authors,
				...(record.participants ?? []),
				...(record.papers ?? []).flatMap((paper) => paper.authors)
			])
		];
		for (const credit of credits) {
			if (typeof credit === 'string' || !credit.personId) continue;
			const person = people.get(credit.personId);
			expect(person, credit.personId).toBeDefined();
			expect([person!.name, ...(person!.aliases ?? [])].map(collaboratorNameKey)).toContain(
				collaboratorNameKey(getContributorName(credit))
			);
		}
	});

	it('does not conflate distinct people through an ambiguous alias', () => {
		const names = new Map<string, string>();
		for (const person of allPeople) {
			for (const name of [person.name, ...(person.aliases ?? [])]) {
				const key = collaboratorNameKey(name);
				expect(names.get(key) ?? person.id, name).toBe(person.id);
				names.set(key, person.id);
			}
		}
		expect(names.has(collaboratorNameKey(author.name))).toBe(false);
	});

	it('keeps coordinates institutional, valid and sourced', () => {
		const ids = new Set(institutions.map((institution) => institution.id));
		expect(ids.size).toBe(institutions.length);
		for (const institution of institutions) {
			expect(Number.isFinite(institution.coordinates.latitude)).toBe(true);
			expect(Number.isFinite(institution.coordinates.longitude)).toBe(true);
			expect(Math.abs(institution.coordinates.latitude)).toBeLessThanOrEqual(90);
			expect(Math.abs(institution.coordinates.longitude)).toBeLessThanOrEqual(180);
			expect(institution.sources.length).toBeGreaterThan(0);
		}
		for (const person of allPeople) {
			for (const affiliation of person.affiliations) {
				if (affiliation.institutionId) expect(ids.has(affiliation.institutionId)).toBe(true);
				expect(affiliation.sources.length).toBeGreaterThan(0);
				if (!affiliation.years?.length) {
					expect(affiliation.confidence).toBe('uncertain');
					expect(affiliation.reviewNote).toContain('Undated source');
				}
			}
		}
	});

	it('does not file one person under two records', () => {
		// "Fiacre Anato" and "Codjo Fiacre Anato" once held separate records. A
		// credited name whose every word appears in another person's name is the
		// same person until a source says otherwise; record it as an alias.
		const words = (name: string) => new Set(collaboratorNameKey(name).split(' '));
		for (const person of allPeople) {
			for (const name of [person.name, ...(person.aliases ?? [])]) {
				const own = words(name);
				if (own.size < 2) continue;
				for (const other of allPeople) {
					if (other === person) continue;
					const theirs = words(other.name);
					expect(
						[...own].every((word) => theirs.has(word)),
						`${name} / ${other.name}`
					).toBe(false);
				}
			}
		}
	});

	it('links evidence at a fixed revision and ships no biography beyond the affiliation', () => {
		// The registry is downloaded by the visualisation pages: quotes carry the
		// affiliation line, not a participant's life story, and a link to a moving
		// branch would drift off the quoted line as soon as the file changes.
		const movingBranch = /github\.com\/[^/]+\/[^/]+\/blob\/(?:main|master)\//;
		const sources = [
			...institutions.flatMap((institution) => institution.sources),
			...allPeople.flatMap((person) => person.affiliations.flatMap((entry) => entry.sources))
		];
		for (const source of sources) {
			expect(source.url, source.url).not.toMatch(movingBranch);
			expect((source.quote ?? '').length, source.url).toBeLessThanOrEqual(300);
		}
	});

	it('keeps reader-facing notes short; the research trail stays in reviewNote', () => {
		const readerNotes = [
			...institutions.map((institution) => institution.coordinateNote),
			...allPeople.flatMap((person) => [
				person.note,
				...person.affiliations.map((entry) => entry.note)
			])
		].filter((note): note is string => Boolean(note));
		for (const note of readerNotes) expect(note.length, note).toBeLessThanOrEqual(160);
	});
});
