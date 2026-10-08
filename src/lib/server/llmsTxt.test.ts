import { describe, it, expect } from 'vitest';
import { buildLlmsTxt, MCP_SERVER } from './llmsTxt';
import { allResearchProjects } from '$lib/data/research';
import { allDhProjects } from '$lib/data/digital-humanities';
import { TWIN_PAGE_PATHS, SITE } from './markdown/site';

const text = buildLlmsTxt();
const lines = text.split('\n');

describe('llms.txt', () => {
	it('opens with the one H1 and a blockquote summary, as the convention requires', () => {
		expect(lines[0]).toMatch(/^# \S/);
		expect(text.match(/^# /gm)).toHaveLength(1);
		expect(lines[1]).toBe('');
		expect(lines[2]).toMatch(/^> \S.{50,}/);
	});

	it('meets the Lighthouse llms-txt audit: an H1, a link and 50 characters', () => {
		expect(text.length).toBeGreaterThan(50);
		expect(text).toMatch(/\[[^\]]+\]\(https?:\/\/[^)]+\)/);
	});

	it('puts every link in an H2 file list as "- [name](url): notes"', () => {
		const sections = text.split(/^## /m).slice(1);
		expect(sections.map((section) => section.split('\n')[0])).toEqual([
			'Sections',
			'Research projects',
			'Digital humanities projects',
			'Tools for agents',
			'Feeds and data',
			'Contact and profiles',
			'Optional'
		]);
		for (const section of sections) {
			for (const line of section.split('\n').slice(1).filter(Boolean)) {
				expect(line, line).toMatch(
					/^- (?:\[[^\]]+\]\(https?:\/\/[^)\s]+\)(?:: \S.*)?|[A-Z][a-z]+: .+)$/
				);
			}
		}
	});

	it('links the Markdown twins, every one of which ships', () => {
		const twins = [...text.matchAll(/\]\((https:\/\/[^)]+\.md)\)/g)].map(([, url]) => url!);
		expect(twins).toContain(`${SITE}/index.md`);
		expect(twins).toContain(`${SITE}/publications.md`);
		expect(twins).toContain(`${SITE}/activities.md`);
		for (const url of twins) {
			const page = url
				.slice(SITE.length)
				.replace(/\.md$/, '')
				.replace(/^\/index$/, '/');
			expect(TWIN_PAGE_PATHS.has(page), url).toBe(true);
		}
		for (const project of [...allResearchProjects, ...allDhProjects]) {
			expect(text).toContain(`/${project.id}.md)`);
		}
	});

	it('names the MCP server and its bundle, and the WebMCP tools', () => {
		expect(text).toContain(`[MCP server](${MCP_SERVER.readme})`);
		expect(text).toContain(MCP_SERVER.bundle);
		expect(text).toContain(MCP_SERVER.releases);
		expect(text).toMatch(/WebMCP/);
	});

	it('claims only the citation formats the site produces', () => {
		expect(text).toContain('BibTeX');
		expect(text).not.toMatch(/\b(?:APA|MLA|Chicago)\b/);
	});

	it('follows the copy rules in its own copy: no em dashes, and talks are talks', () => {
		// Project summaries are authored data, quoted as written; the rest is ours.
		const summaries = [...allResearchProjects, ...allDhProjects].map((project) =>
			project.shortDescription.slice(0, 40)
		);
		const ownCopy = lines.filter((line) => !summaries.some((summary) => line.includes(summary)));
		expect(ownCopy.join(' ')).not.toContain('—');
		expect(ownCopy.join(' ')).not.toMatch(/communications? /i);
	});
});
