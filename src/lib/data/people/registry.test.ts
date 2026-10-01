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
				expect(affiliation.years?.length ?? 0).toBeGreaterThan(0);
			}
		}
	});
});
