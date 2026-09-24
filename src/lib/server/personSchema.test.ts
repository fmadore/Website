import { describe, it, expect } from 'vitest';
import { createFullPersonSchema } from './personSchema';
import { createPersonSchema } from '$lib/utils/jsonLdSchemas';
import { website, contact, author, researchTopics, linkedData } from '$lib/data/siteConfig';
import { allAffiliations } from '$lib/data/affiliations';

describe('createFullPersonSchema', () => {
	const full = createFullPersonSchema();
	const base = createPersonSchema();

	it('shares the layout Person @id and core identity (one merged Person node)', () => {
		expect(full['@id']).toBe(base['@id']);
		expect(full['@id']).toBe(`${website.url}/#person`);
		expect(full.name).toBe(base.name);
		expect(full.jobTitle).toBe(base.jobTitle);
		expect(full.worksFor).toEqual(base.worksFor);
		expect(full.sameAs).toEqual(base.sameAs);
	});

	it('describes the current role and durable linked-data identities', () => {
		expect(full.description).toBe(author.tagline);
		expect(full.jobTitle).toBe('Data Curator');
		expect(full.hasOccupation).toEqual([
			{
				'@type': 'Occupation',
				'@id': `https://www.wikidata.org/entity/${linkedData.occupations[0].wikidataId}`,
				name: 'Historian'
			},
			{
				'@type': 'Occupation',
				'@id': `https://www.wikidata.org/entity/${linkedData.occupations[1].wikidataId}`,
				name: 'Digital Humanist'
			}
		]);
		expect(full.worksFor).toMatchObject({
			'@type': 'EducationalOrganization',
			'@id': `https://www.wikidata.org/entity/${linkedData.employer.wikidataId}`,
			name: linkedData.employer.name
		});
	});

	it('uses an absolute image URL identical to the base schema (no conflicting values)', () => {
		expect(full.image).toBe(base.image);
		expect(full.image).toMatch(/^https:\/\//);
	});

	it('derives alumniOf from degree-granting institutions in the education data', () => {
		expect(full.alumniOf).toEqual([
			{
				'@type': 'EducationalOrganization',
				name: 'Université Laval',
				url: 'https://www.ulaval.ca/en'
			}
		]);
	});

	it('derives hasCredential from education degrees with mapped levels', () => {
		expect(full.hasCredential).toContainEqual({
			'@type': 'EducationalOccupationalCredential',
			credentialCategory: 'degree',
			educationalLevel: 'Doctorate',
			name: 'PhD in History'
		});
		// Degrees only — training and certificates are not credentials here
		expect(full.hasCredential?.every((c) => c.credentialCategory === 'degree')).toBe(true);
		expect(full.hasCredential?.length).toBe(3);
	});

	it('derives memberOf from ongoing affiliations only', () => {
		const names = full.memberOf?.map((org) => org.name) ?? [];
		expect(names).toContain('Islam in Africa Studies Group (IASG)');
		const ongoing = allAffiliations.filter((a) => a.period.end === null);
		expect(full.memberOf?.length).toBe(ongoing.length);
		// Ended memberships (period.end set) must not appear
		expect(names.some((n) => n.includes('Mande Studies Association'))).toBe(false);
		const iasg = full.memberOf?.find((org) => org.name.includes('IASG'));
		expect(iasg?.url).toBe('https://iasg.hcommons.org/');
	});

	it('derives knowsLanguage from the languages data in proficiency order', () => {
		expect(full.knowsLanguage).toEqual(['French', 'English', 'German']);
	});

	it('sources editorial fields from siteConfig', () => {
		expect(full.email).toBe(contact.email);
		expect(full.nationality).toEqual({
			'@type': 'Country',
			'@id': `https://www.wikidata.org/entity/${linkedData.nationality.wikidataId}`,
			name: author.nationality
		});
		expect(full.knowsAbout).toEqual(researchTopics);
		expect(full.knowsAbout).toContain('Islam');
		expect(full.knowsAbout).toContain('Digital Humanities');
	});
});
