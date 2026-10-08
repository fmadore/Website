import { describe, it, expect } from 'vitest';
import {
	decodeEntities,
	escapeMarkdownText,
	htmlToMarkdown,
	paragraphsToMarkdown,
	parseHtml
} from './htmlToMarkdown';
import { allActivities } from '$lib/data/activities';
import { allDhProjects } from '$lib/data/digital-humanities';

describe('decodeEntities', () => {
	it('decodes named and numeric references in one pass', () => {
		expect(decodeEntities('Q&amp;A &#8211; &#x2014; &hellip;')).toBe('Q&A – — …');
		// Decoded once: the escaped form of `&lt;` is the text `&lt;`, not `<`.
		expect(decodeEntities('&amp;lt;b&amp;gt;')).toBe('&lt;b&gt;');
	});

	it('leaves an unknown or malformed reference as written', () => {
		expect(decodeEntities('&bogus; &#0; AT&T')).toBe('&bogus; &#0; AT&T');
	});
});

describe('parseHtml', () => {
	it('reads quoted attribute values that contain a closing bracket', () => {
		const [node] = parseHtml("<a href=\"/x?a>b\" title='it's'>t</a>");
		expect(node).toMatchObject({ tag: 'a', attrs: { href: '/x?a>b' } });
	});

	it('closes an element left open at the end of its parent, and ignores a stray close', () => {
		expect(htmlToMarkdown('<p>one <em>two</p><p>three</span></p>')).toBe('one *two*\n\nthree');
	});

	it('treats a bare angle bracket as text', () => {
		expect(htmlToMarkdown('<p>a < b</p>')).toBe('a \\< b');
	});

	it('skips comments and declarations', () => {
		expect(htmlToMarkdown('<!DOCTYPE html><!-- note --><p>kept</p>')).toBe('kept');
	});
});

describe('escapeMarkdownText', () => {
	it('escapes emphasis, code, link and HTML syntax', () => {
		expect(escapeMarkdownText('a*b `c` [d] <e> \\')).toBe('a\\*b \\`c\\` \\[d\\] \\<e> \\\\');
	});

	it('leaves an underscore inside a word alone', () => {
		expect(escapeMarkdownText('find_related _lead trail_')).toBe('find_related \\_lead trail\\_');
	});

	it('escapes an ampersand only where it would start a reference', () => {
		expect(escapeMarkdownText('AT&T &amp;')).toBe('AT&T \\&amp;');
	});
});

describe('htmlToMarkdown', () => {
	it('separates paragraphs and collapses source whitespace', () => {
		expect(htmlToMarkdown('\n\t<p>One\n   two.</p>\n\n<p>Three.</p>\n')).toBe('One two.\n\nThree.');
	});

	it('sets emphasis with its edge whitespace outside the delimiters', () => {
		expect(htmlToMarkdown('<p>A <em>book </em>and <strong> bold</strong> <i>hadj</i>s</p>')).toBe(
			'A *book* and **bold** *hadj*s'
		);
	});

	it('keeps headings at their level', () => {
		expect(htmlToMarkdown('<h2>The <em>DRE</em></h2><h4>Detail</h4>')).toBe(
			'## The *DRE*\n\n#### Detail'
		);
	});

	it('writes links, resolving the address through the caller', () => {
		const markdown = htmlToMarkdown(
			'<p>See <a href="/publications/x">the book</a> and <a href="https://e.org/a (b)">this</a>.</p>',
			{ resolveHref: (href) => (href.startsWith('/') ? `https://site${href}.md` : href) }
		);
		expect(markdown).toBe(
			'See [the book](https://site/publications/x.md) and [this](https://e.org/a%20%28b%29).'
		);
	});

	it('drops interface text: hidden link suffixes, decorative glyphs, embeds', () => {
		const markdown = htmlToMarkdown(
			'<p><a href="https://omeka.org/s/" target="_blank">Omeka S<span class="sr-only"> (opens in new tab)</span></a> <span aria-hidden="true">→</span></p><iframe src="x"></iframe><script>alert(1)</script>'
		);
		expect(markdown).toBe('[Omeka S](https://omeka.org/s/)');
	});

	it('unwraps a link with no address or no text', () => {
		expect(htmlToMarkdown('<p><a name="x">anchor</a> <a href="/y"></a>end</p>')).toBe('anchor end');
	});

	it('writes bullet and numbered lists, nesting the inner one under its item', () => {
		const markdown = htmlToMarkdown(
			'<ul><li><strong>Search</strong>: full text</li><li>Who<ul><li>people</li><li>places</li></ul></li></ul><ol start="3"><li>three</li><li>four</li></ol>'
		);
		expect(markdown).toBe(
			'- **Search**: full text\n- Who\n  - people\n  - places\n\n3. three\n4. four'
		);
	});

	it('indents every paragraph of a multi-paragraph list item', () => {
		expect(htmlToMarkdown('<ol><li><p>first</p><p>second</p></li></ol>')).toBe(
			'1. first\n\n   second'
		);
	});

	it('quotes a blockquote line by line', () => {
		expect(htmlToMarkdown('<blockquote><p>one</p><p>two</p></blockquote>')).toBe('> one\n>\n> two');
	});

	it('writes inline code verbatim and preformatted text as a fenced block', () => {
		expect(htmlToMarkdown('<p>Its tool is <code>find_related</code>.</p>')).toBe(
			'Its tool is `find_related`.'
		);
		expect(
			htmlToMarkdown('<pre><code class="language-bash">npm run build\nnpm test</code></pre>')
		).toBe('```bash\nnpm run build\nnpm test\n```');
		expect(htmlToMarkdown('<p><code>a`b</code></p>')).toBe('``a`b``');
	});

	it('turns a line break into a hard break', () => {
		expect(htmlToMarkdown('<p>Line one<br>line two<br/></p>')).toBe('Line one\\\nline two');
	});

	it('escapes a paragraph that would open as a heading, list or quotation', () => {
		expect(htmlToMarkdown('<p># not a heading</p><p>- not a list</p><p>1. not a list</p>')).toBe(
			'\\# not a heading\n\n\\- not a list\n\n1\\. not a list'
		);
	});

	it('walks unknown containers and keeps text outside any element', () => {
		expect(htmlToMarkdown('loose text<section><div><p>inner</p></div></section>')).toBe(
			'loose text\n\ninner'
		);
	});

	it('writes images and horizontal rules', () => {
		expect(htmlToMarkdown('<p><img src="/a.webp" alt="A plate"></p><hr>')).toBe(
			'![A plate](/a.webp)\n\n---'
		);
	});
});

describe('paragraphsToMarkdown', () => {
	it('reads blank-line paragraphs with inline HTML, as abstracts are authored', () => {
		expect(paragraphsToMarkdown('The <i>hadj</i> matters.\n\n  Second  paragraph. ')).toBe(
			'The *hadj* matters.\n\nSecond paragraph.'
		);
	});
});

describe('the authored corpus', () => {
	const bodies = [
		...allActivities.map((activity) => ({ id: activity.id, html: activity.content ?? '' })),
		...allDhProjects.map((project) => ({ id: project.id, html: project.description }))
	];

	it.each(bodies)('$id converts without leaking markup', ({ html }) => {
		const markdown = htmlToMarkdown(html);
		// No tag survives, and nothing hidden from readers is transcribed.
		expect(markdown).not.toMatch(/<\/?[a-z][a-z0-9]*[\s>]/i);
		expect(markdown).not.toContain('opens in new tab');
		// Every word of visible text is still there.
		const visible = html
			.replace(/<span class="sr-only">[^<]*<\/span>/g, '')
			.replace(/<[^>]+>/g, ' ')
			.replace(/&amp;/g, '&')
			.split(/\s+/)
			.filter((word) => /^[\p{L}]{4,}$/u.test(word));
		for (const word of visible) expect(markdown).toContain(word);
	});
});
