import { describe, it, expect } from 'vitest';
import {
	elementSpan,
	evaluateBudget,
	gzipBytes,
	measureDocument,
	summarise,
	visibleText
} from './document-overhead.mjs';

describe('elementSpan', () => {
	it('spans the element with the id, nested same-name tags included', () => {
		const html = '<div>a</div><div id="x" class="c"><div>b<div>c</div></div>d</div><div>e</div>';
		const [start, end] = elementSpan(html, 'x');
		expect(html.slice(start, end)).toBe('<div id="x" class="c"><div>b<div>c</div></div>d</div>');
	});

	it('is not unbalanced by tags inside comments, scripts or SVG', () => {
		const html =
			'<main id="m"><!-- </main> --><script>"</main>"</script><svg><main></svg>x</main><p>y</p>';
		const [start, end] = elementSpan(html, 'm');
		expect(html.slice(end)).toBe('<p>y</p>');
		expect(start).toBe(0);
	});

	it('matches the id exactly and returns null for a missing or unclosed element', () => {
		expect(elementSpan('<div id="main-x">a</div>', 'main')).toBeNull();
		expect(elementSpan('<div id="main">a', 'main')).toBeNull();
		expect(elementSpan("<div id='main'>a</div>", 'main')).toEqual([0, 22]);
	});
});

describe('visibleText', () => {
	it('keeps what a reader gets and drops markup, comments and opaque elements', () => {
		const html =
			'<p class="a">Madore &amp; <em>co</em>&nbsp;2024</p><!--[--><svg><title>DOI</title></svg>' +
			'<script>var x = 1</script><style>p{}</style><span class="sr-only">(opens in new tab)</span>' +
			'&#233;&#xE9;';
		// A no-break space is whitespace too, and collapses with the rest.
		expect(visibleText(html)).toBe('Madore & co 2024 (opens in new tab) éé');
	});
});

/** A synthetic long document: shell, `n` ledger rows of varied text, JSON-LD. */
function documentWith(n, { rowExtra = '', shellExtra = '', ldExtra = '' } = {}) {
	const words = ['Islam', 'Togo', 'press', 'Bénin', 'mosque', 'youth', 'archive', 'Lomé', 'radio'];
	const rows = Array.from({ length: n }, (_, i) => {
		const title = Array.from({ length: 8 }, (_, k) => words[(i * 7 + k * 3) % words.length]);
		return (
			`<div class="ledger-row cv-entry"${rowExtra}><div class="ledger-key cv-entry-year">` +
			`${2000 + (i % 27)}</div> <div class="cv-entry-content"><!--[0--><a href="./p/${i}" ` +
			`class="cv-record-link">“${title.join(' ')} ${i}”</a>.<!--]--></div></div>`
		);
	});
	return (
		`<!doctype html><html><head><style>${'.a{color:red}'.repeat(40)}${shellExtra}</style>` +
		`<script type="application/ld+json">{"@type":"Person","name":"X"${ldExtra}}</script></head>` +
		`<body><header>Masthead</header><main id="main"><div id="cv-content">${rows.join('')}</div>` +
		`</main><footer>Colophon</footer></body></html>`
	);
}

describe('measureDocument', () => {
	it('cuts the document into shell, content and JSON-LD', () => {
		const m = measureDocument(documentWith(10), 'cv-content');
		expect(m.total).toBe(gzipBytes(documentWith(10)));
		expect(m.raw.content).toBeGreaterThan(m.raw.text);
		expect(m.css).toBeGreaterThan(0);
		expect(m.structuredData).toBeGreaterThan(0);
		expect(m.density).toBeCloseTo(m.content / m.text, 10);
	});

	it('throws when the container is gone, so a renamed id cannot pass silently', () => {
		expect(() => measureDocument(documentWith(3), 'cv-missing')).toThrow(/cv-missing/);
	});

	it('leaves shell and density where they were as entries are added', () => {
		const small = measureDocument(documentWith(200), 'cv-content');
		const large = measureDocument(documentWith(300), 'cv-content');
		expect(large.total).toBeGreaterThan(small.total);
		expect(large.shell).toBe(small.shell);
		expect(large.structuredData).toBe(small.structuredData);
		// Gzip amortises better over more rows, so density falls, never rises.
		expect(large.density).toBeLessThanOrEqual(small.density * 1.01);
	});

	it('raises the density when every entry carries more markup', () => {
		const base = measureDocument(documentWith(200), 'cv-content');
		const noisy = measureDocument(
			documentWith(200, { rowExtra: ' data-entry-kind="publication" aria-describedby="x"' }),
			'cv-content'
		);
		expect(noisy.text).toBe(base.text);
		expect(noisy.density).toBeGreaterThan(base.density);
		expect(noisy.shell).toBe(base.shell);
	});
});

describe('evaluateBudget', () => {
	const measured = measureDocument(documentWith(200), 'cv-content');
	const budget = {
		baseline: {
			shell: measured.shell,
			css: measured.css,
			density: measured.density,
			structuredData: measured.structuredData
		},
		ceiling: {
			shell: measured.shell + 50,
			density: measured.density * 1.03,
			structuredData: measured.structuredData + 20
		}
	};

	it('passes a document at its baseline, and one that only grew in entries', () => {
		expect(evaluateBudget(measured, budget)).toEqual([]);
		expect(evaluateBudget(measureDocument(documentWith(400), 'cv-content'), budget)).toEqual([]);
	});

	it('names the shell, and how much of its growth is the inline stylesheet', () => {
		const grown = measureDocument(
			documentWith(200, {
				shellExtra: Array.from({ length: 300 }, (_, i) => `.r${i}{margin:${i}px}`).join('')
			}),
			'cv-content'
		);
		const [message, ...rest] = evaluateBudget(grown, budget);
		expect(rest).toEqual([]);
		expect(message).toMatch(
			/^shell .* over its .* ceiling: \+.* since the .* baseline \(inline CSS \+/
		);
		expect(message).toMatch(/the rest \+0\.0 kB/);
	});

	it('names the density and what the growth is worth in bytes', () => {
		const noisy = measureDocument(
			documentWith(200, {
				rowExtra: ' data-a="publication-record-row" data-b="ledger" aria-describedby="cv-note"'
			}),
			'cv-content'
		);
		const messages = evaluateBudget(noisy, budget);
		expect(messages).toHaveLength(1);
		expect(messages[0]).toMatch(/^content density .* over its .* ceiling: \+0\.\d{3} since/);
		expect(messages[0]).toMatch(/\+\d+\.\d kB at today's/);
	});

	it('names the structured data', () => {
		const ld = measureDocument(
			documentWith(200, { ldExtra: `,"sameAs":[${'"https://example.org/a",'.repeat(30)}"x"]` }),
			'cv-content'
		);
		// The JSON-LD sits in <head>, outside the container, and out of the shell.
		expect(ld.shell).toBe(measured.shell);
		const messages = evaluateBudget(
			{ ...ld, structuredData: measured.structuredData + 100 },
			budget
		);
		expect(messages).toHaveLength(1);
		expect(messages[0]).toMatch(/^structured data \(JSON-LD\) is .* \+0\.1 kB since/);
	});

	it('summarises a passing page on one line', () => {
		expect(summarise('/cv', measured, budget)).toMatch(
			/^\/cv: .* total; shell .* \/ .* \(CSS .*\), density \d\.\d{3} \/ \d\.\d{3} \(text .*\), JSON-LD/
		);
	});
});
