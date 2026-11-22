import { describe, expect, it } from 'vitest';
import { allGrants } from '#lib/data/grants/index.ts';
import { allResearchProjects } from '#lib/data/research/index.ts';
import { allPublicationSummaries } from '#lib/data/publications/summaries.ts';
import { allCommunicationSummaries } from '#lib/data/communications/summaries.ts';
import { author, website } from '#lib/data/siteConfig.ts';
import { buildResearchProjectGraph } from './researchProjectJsonLd';

const awarded = (grant: (typeof allGrants)[number]) => !grant.status || grant.status === 'Awarded';

function graphFor(project: (typeof allResearchProjects)[number], directors: string[] = []) {
	return JSON.parse(
		buildResearchProjectGraph(project, {
			publications: allPublicationSummaries,
			communications: allCommunicationSummaries,
			directors
		})
	) as { '@context': string; '@graph': Record<string, unknown>[] };
}

describe('buildResearchProjectGraph', () => {
	// The project with the most outputs exercises every branch.
	const project = [...allResearchProjects].sort(
		(a, b) =>
			allPublicationSummaries.filter((p) => p.project === b.projectName).length -
			allPublicationSummaries.filter((p) => p.project === a.projectName).length
	)[0]!;
	const page = `${website.url}/research/${project.id}`;
	const graph = graphFor(project, ['A. Colleague', author.name]);
	const [node, ...grants] = graph['@graph'];

	it('opens on the ResearchProject node the page names as its main entity', () => {
		expect(graph['@context']).toBe('https://schema.org');
		expect(node).toMatchObject({
			'@type': 'ResearchProject',
			'@id': `${page}#record`,
			url: page,
			mainEntityOfPage: { '@id': `${page}#webpage` },
			name: project.title
		});
		expect(node).not.toHaveProperty('@context');
	});

	it('funds the project by the grants that share its graph', () => {
		const expected = allGrants
			.filter((grant) => grant.project === project.projectName && awarded(grant))
			.map((grant) => `${page}#grant-${grant.id}`);
		expect(grants.map((grant) => grant['@id'])).toEqual(expected);
		expect(grants.every((grant) => grant['@type'] === 'MonetaryGrant')).toBe(true);
		if (expected.length > 0) {
			expect(node!.funding).toEqual(expected.map((id) => ({ '@id': id })));
		} else {
			expect(node).not.toHaveProperty('funding');
		}
	});

	it('names every publication and talk the page lists, by their record ids', () => {
		const ids = (node!.subjectOf as { '@id': string }[]).map((ref) => ref['@id']);
		const publications = allPublicationSummaries.filter((p) => p.project === project.projectName);
		const talks = allCommunicationSummaries.filter((c) => c.project === project.projectName);
		expect(ids).toHaveLength(publications.length + talks.length);
		for (const publication of publications) {
			expect(ids).toContain(`${website.url}/publications/${publication.id}#record`);
		}
		for (const talk of talks) {
			expect(ids).toContain(`${website.url}/communications/${talk.id}#record`);
		}
	});

	it('lists the site author once among the members', () => {
		const members = node!.member as { name: string; '@id'?: string }[];
		expect(members.map((member) => member.name)).toEqual([author.name, 'A. Colleague']);
		expect(members[0]!['@id']).toBe(`${website.url}/#person`);
	});

	it('states an end year only for work that is over', () => {
		for (const record of allResearchProjects) {
			const [entry] = graphFor(record)['@graph'];
			expect(entry!.foundingDate, record.id).toBe(record.years.slice(0, 4));
			const over = !record.current && /\d{4}\s*[-–]\s*\d{4}/.test(record.years);
			if (over) expect(entry!.dissolutionDate, record.id).toBe(record.years.slice(-4));
			else expect(entry, record.id).not.toHaveProperty('dissolutionDate');
		}
	});

	it('gives every project a description of its own', () => {
		const descriptions = allResearchProjects.map(
			(record) => graphFor(record)['@graph'][0]!.description
		);
		expect(new Set(descriptions).size).toBe(allResearchProjects.length);
		for (const record of allResearchProjects) {
			expect(record.seoDescription, `${record.id} has no seoDescription`).toBeTruthy();
		}
	});
});
