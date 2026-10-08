import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cvCommunicationsByDate } from '$lib/data/communications/cv';
import { computerSkills } from '$lib/data/computerSkills';
import { consulting } from '$lib/data/consulting';
import { allDhProjectSummaries } from '$lib/data/digital-humanities/summaries';
import { grantsByDate } from '$lib/data/grants';
import { cvPublicationsByDate } from '$lib/data/publications/cv';
import { author, contact, socialLinks } from '$lib/data/siteConfig';
import type { CvCommunication } from '$lib/types/communication';
import { groupPublicationsByType } from '$lib/utils/cvFormatters';
import { getPublicationTypeDisplayName } from '$lib/utils/publicationTypeLabels';
import { cvMarkdown } from './cv';
import { link } from './markdown';
import { markdownUrl, pageUrl, SITE } from './site';

const markdown = cvMarkdown();

const readSource = (relative: string) => readFileSync(new URL(relative, import.meta.url), 'utf8');
const componentSource = (name: string) => readSource(`../../components/cv/${name}.svelte`);

/** The sections the HTML CV prints, in its order, in the twin's sentence case. */
const SECTIONS = [
	'Professional appointments',
	'Education',
	'Publications',
	'Grants and fellowships',
	'Awards and honours',
	'Digital humanities projects',
	'Invited talks',
	'Conference participation',
	'Organisation of academic events',
	'Teaching experience',
	'Research experience',
	'Service to profession',
	'Consulting and legal expertise',
	'Media appearances',
	'Languages',
	'Professional affiliations',
	'Computer skills'
];

/** The body of the `## title` section, up to the next one. */
function sectionBody(title: string): string {
	const start = markdown.indexOf(`\n## ${title}\n`);
	if (start === -1) throw new Error(`No section "${title}"`);
	const rest = markdown.slice(start + 1);
	const next = rest.indexOf('\n## ');
	return next === -1 ? rest : rest.slice(0, next);
}

/** The body of the `### title` subsection inside a section body. */
function subsectionBody(body: string, title: string): string {
	const start = body.indexOf(`\n### ${title}\n`);
	if (start === -1) throw new Error(`No subsection "${title}"`);
	const rest = body.slice(start + 1);
	const next = rest.indexOf('\n### ');
	return next === -1 ? rest : rest.slice(0, next);
}

/** Ledger rows: the top-level bullets, not the notes nested under them. */
const rows = (body: string) => body.split('\n').filter((line) => line.startsWith('- '));

const headings = (level: number, body = markdown) =>
	[...body.matchAll(new RegExp(`^${'#'.repeat(level)} (.+)$`, 'gm'))].map((match) => match[1]!);

const ofTypes = (...types: CvCommunication['type'][]) =>
	cvCommunicationsByDate.filter((comm) => types.includes(comm.type));

describe('cvMarkdown', () => {
	it('opens with the title and the person, and ends in one newline', () => {
		expect(markdown.startsWith('# Curriculum vitae\n\n')).toBe(true);
		expect(markdown).toContain(`**${author.fullName}**: ${author.position}`);
		expect(markdown.endsWith('\n')).toBe(true);
		expect(markdown.endsWith('\n\n')).toBe(false);
	});

	it('names the contact routes and points at the web page and the JSON', () => {
		expect(markdown).toContain(link(contact.email, `mailto:${contact.email}`));
		for (const profile of [socialLinks.linkedIn, socialLinks.github, socialLinks.orcid]) {
			expect(markdown).toContain(link(profile.name, profile.url));
		}
		expect(markdown).toContain(`(${pageUrl('/cv')})`);
		expect(markdown).toContain(`(${SITE}/api/cv.json)`);
		expect(markdown).toMatch(/^As of \d{1,2} [A-Z][a-z]+ \d{4}\./m);
	});

	it('prints every section of the HTML CV, in its order', () => {
		expect(headings(2)).toEqual(SECTIONS);
	});

	it('keeps step with the HTML CV contents list', () => {
		// The contents list repeats each section heading verbatim; the twin sets
		// the same headings in sentence case, with "and" for the ampersand.
		const labels = [
			...componentSource('CVTableOfContents').matchAll(/\{ id: 'cv-[a-z-]+', label: '([^']+)' \}/g)
		].map((match) => match[1]!.replace(' & ', ' and ').toLowerCase());
		expect(labels).toHaveLength(SECTIONS.length);
		expect(SECTIONS.map((title) => title.toLowerCase())).toEqual(labels);
	});

	it('leads every row with its key in bold', () => {
		for (const title of SECTIONS) {
			for (const row of rows(sectionBody(title))) {
				expect(row).toMatch(/^- \*\*[^*]+\*\* \S/);
			}
		}
	});

	it('prints every publication the CV prints, under its type, linked to its record', () => {
		const printed = cvPublicationsByDate.filter(
			(pub) => pub.type !== 'phd-dissertation' && pub.type !== 'masters-thesis'
		);
		const body = sectionBody('Publications');
		expect(rows(body)).toHaveLength(printed.length);
		for (const pub of printed) {
			expect(body).toContain(`(${markdownUrl(`/publications/${pub.id}`)})`);
			if (pub.doi) expect(body).toContain(link(`doi:${pub.doi}`, `https://doi.org/${pub.doi}`));
		}

		const { presentPublicationTypes, otherPublicationTypes } =
			groupPublicationsByType(cvPublicationsByDate);
		const expected = presentPublicationTypes.map((type) =>
			getPublicationTypeDisplayName(type).toLowerCase()
		);
		if (otherPublicationTypes.length > 0) expected.push('other');
		expect(headings(3, body).map((heading) => heading.toLowerCase())).toEqual(expected);
		for (const heading of headings(3, body)) expect(heading).toMatch(/^[A-Z][^A-Z]*$/);
	});

	it('sets a known book and a known grant', () => {
		expect(markdown).toContain('Religious Activism on Campuses in Togo and Benin');
		expect(markdown).toContain('Banting Postdoctoral Fellowship');
		expect(rows(sectionBody('Grants and fellowships'))).toHaveLength(grantsByDate.length);
	});

	it('splits the talks by type as the HTML CV does, each linked to its record', () => {
		const invited = ofTypes('lecture', 'seminar', 'workshop');
		const conference = ofTypes('panel', 'conference', 'poster');
		const events = ofTypes('event');
		const podcasts = ofTypes('podcast');

		expect(rows(sectionBody('Invited talks'))).toHaveLength(invited.length);
		expect(rows(sectionBody('Conference participation'))).toHaveLength(conference.length);
		expect(rows(sectionBody('Organisation of academic events'))).toHaveLength(events.length);
		expect(rows(subsectionBody(sectionBody('Media appearances'), 'Podcasts'))).toHaveLength(
			podcasts.length
		);
		expect(headings(3, sectionBody('Conference participation'))).toEqual(
			[
				['Panels organised', 'panel'],
				['Papers presented', 'conference'],
				['Posters presented', 'poster']
			]
				.filter(([, type]) => ofTypes(type as CvCommunication['type']).length > 0)
				.map(([title]) => title)
		);
		for (const comm of [...invited, ...conference, ...events, ...podcasts]) {
			expect(markdown).toContain(`(${markdownUrl(`/communications/${comm.id}`)})`);
		}
	});

	it('prints every digital humanities project, linked to its record', () => {
		const body = sectionBody('Digital humanities projects');
		expect(rows(body)).toHaveLength(allDhProjectSummaries.length);
		for (const project of allDhProjectSummaries) {
			expect(body).toContain(`(${markdownUrl(`/digital-humanities/${project.id}`)})`);
		}
	});

	it('keeps the education subsections the HTML CV prints', () => {
		const titles = headings(3, sectionBody('Education'));
		expect(titles[0]).toBe('Degrees');
		for (const title of titles) {
			expect([
				'Degrees',
				'Digital humanities trainings',
				'Certificates',
				'Other education'
			]).toContain(title);
		}
	});

	it('prints the consulting and computer-skills records the page prints', () => {
		const skills = rows(sectionBody('Computer skills'));
		expect(skills).toEqual(
			computerSkills.map((group) => `- **${group.category}** ${group.skills}`)
		);

		const consultingBody = sectionBody('Consulting and legal expertise');
		expect(rows(consultingBody)).toHaveLength(consulting.length);
		const notes = consultingBody.split(/\n/).filter((line) => line.startsWith('  - '));
		expect(notes.map((note) => note.slice(4))).toEqual(
			consulting.flatMap((engagement) => engagement.descriptions)
		);
	});

	it('emits no raw HTML', () => {
		expect(markdown).not.toMatch(/<\/?[a-z][a-z0-9]*[\s>]/i);
	});

	it('makes every link absolute', () => {
		const targets = [...markdown.matchAll(/\]\(([^)\s]*)\)/g)].map((match) => match[1]!);
		expect(targets.length).toBeGreaterThan(100);
		for (const target of targets) {
			if (target === `mailto:${contact.email}`) continue;
			expect(target).toMatch(/^https:\/\//);
		}
	});

	it('writes no em dash of its own', () => {
		// Authored data may carry one; the twin's own copy and comments may not.
		const emDash = String.fromCodePoint(0x2014);
		expect(readSource('./cv.ts')).not.toContain(emDash);
	});
});
