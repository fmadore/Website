import { describe, it, expect } from 'vitest';
import { allPublications, publicationsByDate } from '$lib/data/publications/index';
import { allCommunications, communicationsByDate } from '$lib/data/communications/index';
import { activitiesByDate } from '$lib/data/activities';
import { allDhProjects } from '$lib/data/digital-humanities';
import { allResearchProjects } from '$lib/data/research';
import teaching from '$lib/data/teaching';
import guestLectures from '$lib/data/teaching/guest-lectures';
import { generateBibtex } from '$lib/utils/bibtexGenerator';
import { formatReferenceText } from '$lib/utils/citationFormatter';
import { activityMarkdown, activitiesIndexMarkdown } from './activities';
import { communicationMarkdown, talksIndexMarkdown } from './communications';
import { dhIndexMarkdown, dhProjectMarkdown } from './digitalHumanities';
import { homeMarkdown } from './home';
import { escapeMarkdownText } from './htmlToMarkdown';
import { publicationMarkdown, publicationsIndexMarkdown } from './publications';
import { researchIndexMarkdown, researchProjectMarkdown } from './research';
import { guestLecturesMarkdown, teachingMarkdown } from './teaching';
import { markdownUrl, SITE, TWIN_PAGE_PATHS } from './site';

const byId = <T extends { id: string }>(items: readonly T[], id: string): T => {
	const item = items.find((candidate) => candidate.id === id);
	if (!item) throw new Error(`fixture ${id} is gone`);
	return item;
};

/** Every document the `*.md` routes serve, generated once. */
const documents: Array<[path: string, markdown: string]> = [
	['/index.md', homeMarkdown()],
	['/publications.md', publicationsIndexMarkdown(publicationsByDate)],
	['/conference-activity.md', talksIndexMarkdown(communicationsByDate)],
	['/activities.md', activitiesIndexMarkdown(activitiesByDate)],
	['/research.md', researchIndexMarkdown(allResearchProjects)],
	['/digital-humanities.md', dhIndexMarkdown(allDhProjects)],
	['/teaching.md', teachingMarkdown(teaching, guestLectures)],
	['/teaching/guest-lectures.md', guestLecturesMarkdown(guestLectures)],
	...allPublications.map((p): [string, string] => [
		`/publications/${p.id}.md`,
		publicationMarkdown(p)
	]),
	...allCommunications.map((c): [string, string] => [
		`/communications/${c.id}.md`,
		communicationMarkdown(c)
	]),
	...activitiesByDate.map((a): [string, string] => [`/activities/${a.id}.md`, activityMarkdown(a)]),
	...allResearchProjects.map((r): [string, string] => [
		`/research/${r.id}.md`,
		researchProjectMarkdown(r)
	]),
	...allDhProjects.map((d): [string, string] => [
		`/digital-humanities/${d.id}.md`,
		dhProjectMarkdown(d)
	])
];

const LINK = /\]\(([^)\s]+)\)/g;

describe('every Markdown twin', () => {
	it.each(documents)('%s is well-formed Markdown with resolvable links', (_path, markdown) => {
		// One H1, first, and a single trailing newline.
		expect(markdown).toMatch(/^# \S/);
		expect(markdown.match(/^# /gm)).toHaveLength(1);
		expect(markdown.endsWith('\n') && !markdown.endsWith('\n\n')).toBe(true);
		// No markup left over from the HTML it was converted from.
		expect(markdown.replace(/```[\s\S]*?```/g, '')).not.toMatch(/<\/?[a-z][a-z0-9]*[\s/>]/i);
		expect(markdown).not.toContain('opens in new tab');

		for (const [, url] of markdown.matchAll(LINK)) {
			// Absolute, so a twin quoted out of context still resolves…
			expect(url, url).toMatch(/^(?:https?:|mailto:)/);
			// …and an internal Markdown link names a twin that ships.
			if (url!.startsWith(SITE) && url!.endsWith('.md')) {
				const page = url!
					.slice(SITE.length)
					.replace(/\.md$/, '')
					.replace(/^\/index$/, '/');
				expect(TWIN_PAGE_PATHS.has(page), url).toBe(true);
			}
		}
	});
});

describe('publication twins', () => {
	const book = byId(allPublications, 'religious-activism-campuses');
	const markdown = publicationMarkdown(book);

	it('carry the reference and BibTeX the record page hands out', () => {
		expect(markdown).toContain(escapeMarkdownText(formatReferenceText(book, { doi: true })));
		expect(markdown).toContain(`\`\`\`bibtex\n${generateBibtex(book).trimEnd()}\n\`\`\``);
	});

	it('print the identifiers, abstract and apparatus', () => {
		expect(markdown).toContain(`- **ISBN:** ${book.isbn}`);
		expect(markdown).toContain(`- **DOI:** [${book.doi}](https://doi.org/${book.doi})`);
		expect(markdown).toContain('## Abstract');
		expect(markdown).toContain('## Reviews');
		expect(markdown).toContain('## Cited by');
		expect(markdown).toContain(`- **Web page:** ${SITE}/publications/${book.id}`);
		expect(markdown).toContain(markdownUrl('/research/religious-activism-campuses-togo-benin'));
	});

	it('set an abstract’s inline italics as Markdown', () => {
		const hadj = byId(allPublications, 'hadj-cote-divoire-2018');
		expect(publicationMarkdown(hadj)).toContain('*hadj*');
	});
});

describe('the list twins', () => {
	it('list every publication, which the HTML index pages through', () => {
		const markdown = publicationsIndexMarkdown(publicationsByDate);
		for (const pub of allPublications) {
			expect(markdown).toContain(`](${markdownUrl(`/publications/${pub.id}`)})`);
		}
		expect(markdown).toContain(`${allPublications.length} entries`);
	});

	it('list every talk, activity and project', () => {
		const talks = talksIndexMarkdown(communicationsByDate);
		for (const talk of allCommunications) {
			expect(talks).toContain(markdownUrl(`/communications/${talk.id}`));
		}
		const log = activitiesIndexMarkdown(activitiesByDate);
		for (const activity of activitiesByDate) {
			expect(log).toContain(markdownUrl(`/activities/${activity.id}`));
		}
		const dh = dhIndexMarkdown(allDhProjects);
		for (const project of allDhProjects) {
			expect(dh).toContain(markdownUrl(`/digital-humanities/${project.id}`));
		}
		const research = researchIndexMarkdown(allResearchProjects);
		for (const project of allResearchProjects) {
			expect(research).toContain(markdownUrl(`/research/${project.id}`));
		}
	});

	it('group by year, newest first', () => {
		const years = [...talksIndexMarkdown(communicationsByDate).matchAll(/^## (\d{4})$/gm)].map(
			([, year]) => Number(year)
		);
		expect(years.length).toBeGreaterThan(3);
		expect([...years].sort((a, b) => b - a)).toEqual(years);
	});
});

describe('talk, activity and project twins', () => {
	it('print a panel’s programme and participants', () => {
		const panel = allCommunications.find((talk) => talk.type === 'panel' && talk.papers?.length);
		expect(panel).toBeDefined();
		const markdown = communicationMarkdown(panel!);
		expect(markdown).toContain('## Papers in this panel');
		expect(markdown).toContain(escapeMarkdownText(panel!.papers![0]!.title));
	});

	it('convert an activity body and keep its links', () => {
		const activity = byId(activitiesByDate, 'religious-activism-campuses-review-swagler-2026');
		const markdown = activityMarkdown(activity);
		expect(markdown).toContain('Very glad that my book');
		// An internal link in the body points at the publication's twin.
		expect(markdown).toContain(`](${markdownUrl('/publications/religious-activism-campuses')})`);
	});

	it('read a research project’s prose from its page and resolve its citations', () => {
		const project = byId(allResearchProjects, 'dh-ai-african-studies');
		const markdown = researchProjectMarkdown(project);
		expect(markdown).toContain('changing how knowledge is produced in African studies');
		expect(markdown).toMatch(
			/\[\([^)]+, 20\d\d\)\]\(https:\/\/www\.frederickmadore\.com\/communications\//
		);
		expect(markdown).toContain('## Grants');
		expect(markdown).toContain('## Talks');
	});

	it('print a digital humanities project’s description and addresses', () => {
		const amira = byId(allDhProjects, 'amira');
		const markdown = dhProjectMarkdown(amira);
		expect(markdown).toContain('## The DRE behind AMIRA');
		expect(markdown).toContain('`find_related`');
		expect(markdown).toContain('## Addresses');
	});

	it('give the home page its prose, latest activities and a way into every section', () => {
		const markdown = homeMarkdown();
		expect(markdown).toContain('I am a Data Curator');
		expect(markdown).not.toContain('View all publications');
		expect(markdown).toContain(markdownUrl(`/activities/${activitiesByDate[0]!.id}`));
		for (const section of ['/publications', '/conference-activity', '/research', '/cv']) {
			expect(markdown).toContain(markdownUrl(section));
		}
	});
});

describe('teaching twins', () => {
	const markdown = teachingMarkdown(teaching, guestLectures);
	const lectures = guestLecturesMarkdown(guestLectures);

	it('list every course, newest first, with its syllabus', () => {
		const titles = [...markdown.matchAll(/^- \*\*[^*]+\*\* (.+?), /gm)].map(([, title]) => title);
		expect(titles.slice(0, teaching.length)).toEqual(
			[...teaching]
				.sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10))
				.map((course) => escapeMarkdownText(course.title))
		);
		for (const course of teaching.filter((item) => item.syllabusUrl)) {
			expect(markdown).toContain(`(${SITE}${course.syllabusUrl})`);
		}
	});

	it('index the guest lectures by host, and link the full list', () => {
		expect(markdown).toContain('## Guest lectures');
		expect(markdown).toContain(`](${markdownUrl('/teaching/guest-lectures')})`);
		const hosts = new Set(guestLectures.map((lecture) => lecture.institution));
		for (const host of hosts) expect(markdown).toContain(escapeMarkdownText(host));
	});

	it('give every guest lecture its own row, under its host', () => {
		const rows = lectures.split(/\n/).filter((line) => line.startsWith('- **'));
		expect(rows).toHaveLength(guestLectures.length);
		for (const lecture of guestLectures) {
			expect(lectures).toContain(
				`**${escapeMarkdownText(lecture.date)}** ${escapeMarkdownText(lecture.title)}`
			);
		}
		expect(lectures.match(/^## /gm)).toHaveLength(
			new Set(guestLectures.map((lecture) => lecture.institution)).size
		);
	});
});
