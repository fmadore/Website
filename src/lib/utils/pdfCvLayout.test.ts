import { describe, it, expect } from 'vitest';
import { CvPdfLayout, classifyContactLink } from './pdfCvLayout';
import { COLORS, RULE, FONT_SIZE } from './pdfDesignTokens';

/**
 * The exported CV is a shipped artifact of the design system, and it is the
 * one surface no browser check ever sees. Everything it draws goes through
 * jsPDF calls, so recording those calls is enough to assert the design:
 * which voice each string is cast in, which ink it takes, and at which weight
 * each rule is drawn.
 *
 * This is the guard that was missing. The generator's own docstring claimed
 * "section heads … opened by a heavy 3px-equivalent ink rule" and "ledger rows
 * separated by ink hairlines" while `RULE.SECTION`, `RULE.HAIRLINE` and
 * `COLORS.ACCENT` were, by grep, never used at all — the export drew four
 * rules of one weight in one colour and no row separators, and set the ledger
 * key in the display voice. Prose is not a guard; this is.
 *
 * `CvPdfLayout` takes its jsPDF instance by constructor injection, so no
 * jsPDF, no DOM and no font fetch is involved here.
 */

type Call = { fn: string; args: unknown[] };

/** A jsPDF stand-in that records the drawing calls the layout makes. */
function recorder(pageWidth = 210, pageHeight = 297) {
	const calls: Call[] = [];
	const record =
		(fn: string) =>
		(...args: unknown[]) => {
			calls.push({ fn, args });
		};

	const pdf = {
		calls,
		internal: {
			pageSize: { getWidth: () => pageWidth, getHeight: () => pageHeight },
			pages: [null, {}],
			scaleFactor: 2.834
		},
		setFont: record('setFont'),
		setFontSize: record('setFontSize'),
		setTextColor: record('setTextColor'),
		setDrawColor: record('setDrawColor'),
		setLineWidth: record('setLineWidth'),
		setCharSpace: record('setCharSpace'),
		text: record('text'),
		line: record('line'),
		addPage: record('addPage'),
		getTextWidth: () => 10,
		splitTextToSize: (t: string) => [t]
	};

	// The class only ever calls the surface above; the cast keeps the test
	// honest about that rather than pulling jsPDF into a plain-Node run.
	return pdf as unknown as import('jspdf').jsPDF & { calls: Call[] };
}

const VOICES = { DISPLAY: 'Archivo', SERIF: 'Newsreader', MONO: 'SplineSansMono' };

/** The font family in force when call `index` was made. */
function fontAt(calls: Call[], index: number): string | undefined {
	for (let i = index; i >= 0; i--) {
		if (calls[i]?.fn === 'setFont') return calls[i]!.args[0] as string;
	}
	return undefined;
}

/** The text colour in force when call `index` was made. */
function colourAt(calls: Call[], index: number): number[] | undefined {
	for (let i = index; i >= 0; i--) {
		if (calls[i]?.fn === 'setTextColor') return calls[i]!.args as number[];
	}
	return undefined;
}

const indexOfText = (calls: Call[], text: string) =>
	calls.findIndex((c) => c.fn === 'text' && c.args[0] === text);

describe('the exported CV is cast in the three voices', () => {
	it('sets the section head in the DISPLAY voice, in ink', () => {
		const pdf = recorder();
		new CvPdfLayout(pdf, VOICES, 18).addSection('Professional Appointments');

		const at = indexOfText(pdf.calls, 'Professional Appointments');
		expect(at).toBeGreaterThan(-1);
		expect(fontAt(pdf.calls, at)).toBe(VOICES.DISPLAY);
		expect(colourAt(pdf.calls, at)).toEqual([...COLORS.TEXT_EMPHASIS]);
	});

	it('sets the subsection label in the DATA voice, uppercased and letterspaced', () => {
		const pdf = recorder();
		new CvPdfLayout(pdf, VOICES, 18).addSubsectionLabel('Books');

		const at = indexOfText(pdf.calls, 'BOOKS');
		expect(at).toBeGreaterThan(-1);
		expect(fontAt(pdf.calls, at)).toBe(VOICES.MONO);
		expect(pdf.calls.some((c) => c.fn === 'setCharSpace' && c.args[0] !== 0)).toBe(true);
	});

	it('sets the hanging key in the DATA voice, in faint ink — never the display voice', () => {
		const pdf = recorder();
		new CvPdfLayout(pdf, VOICES, 18).drawYearLabel('2019-24', 20, 40, 18);

		const at = indexOfText(pdf.calls, '2019-24');
		expect(at).toBeGreaterThan(-1);
		expect(fontAt(pdf.calls, at)).toBe(VOICES.MONO);
		expect(colourAt(pdf.calls, at)).toEqual([...COLORS.TEXT_MUTED]);
	});

	it('sets the running foot in the DATA voice', () => {
		const pdf = recorder();
		new CvPdfLayout(pdf, VOICES, 18).addPageNumber();

		const at = indexOfText(pdf.calls, 'Frédérick Madore, PhD — Curriculum Vitae');
		expect(at).toBeGreaterThan(-1);
		expect(fontAt(pdf.calls, at)).toBe(VOICES.MONO);
	});

	it('leaves the serif voice in force for the body that follows a key', () => {
		const pdf = recorder();
		const layout = new CvPdfLayout(pdf, VOICES, 18);
		layout.drawYearLabel('2019-24', 20, 40, 18);

		expect(fontAt(pdf.calls, pdf.calls.length - 1)).toBe(VOICES.SERIF);
		const lastSize = [...pdf.calls].reverse().find((c) => c.fn === 'setFontSize');
		expect(lastSize?.args[0]).toBe(FONT_SIZE.BODY);
	});
});

describe('the exported CV draws the rule hierarchy', () => {
	it('opens a section with the heavy ink rule, above the head', () => {
		const pdf = recorder();
		const layout = new CvPdfLayout(pdf, VOICES, 18);
		layout.addSection('Publications');

		const ruleAt = pdf.calls.findIndex((c) => c.fn === 'line');
		const headAt = indexOfText(pdf.calls, 'Publications');
		expect(ruleAt).toBeGreaterThan(-1);
		// The rule opens the section; it does not underline it.
		expect(ruleAt).toBeLessThan(headAt);

		const width = [...pdf.calls.slice(0, ruleAt)].reverse().find((c) => c.fn === 'setLineWidth');
		const colour = [...pdf.calls.slice(0, ruleAt)].reverse().find((c) => c.fn === 'setDrawColor');
		expect(width?.args[0]).toBe(RULE.SECTION);
		expect(colour?.args).toEqual([...COLORS.PRIMARY]);
	});

	it('draws the footer rule at the faintest weight', () => {
		const pdf = recorder();
		new CvPdfLayout(pdf, VOICES, 18).addPageNumber();

		const width = pdf.calls.find((c) => c.fn === 'setLineWidth');
		const colour = pdf.calls.find((c) => c.fn === 'setDrawColor');
		expect(width?.args[0]).toBe(RULE.FOOTER);
		expect(colour?.args).toEqual([...COLORS.HAIRLINE]);
	});

	it('uses three distinct weights for the three rule tiers', () => {
		// Rule weight is the system's hierarchy. If these ever collapse to one
		// number the export has lost it, which is exactly what had happened.
		expect(new Set([RULE.MASTHEAD, RULE.SECTION, RULE.HAIRLINE]).size).toBe(3);
		expect(RULE.MASTHEAD).toBeGreaterThan(RULE.SECTION);
		expect(RULE.SECTION).toBeGreaterThan(RULE.HAIRLINE);
	});
});

describe('the accent marks only the current record', () => {
	it('takes pine for an ongoing key and faint ink otherwise', () => {
		const pdf = recorder();
		const layout = new CvPdfLayout(pdf, VOICES, 18);

		layout.drawYearLabel('2024-', 20, 40, 18, true);
		expect(colourAt(pdf.calls, indexOfText(pdf.calls, '2024-'))).toEqual([...COLORS.ACCENT]);

		layout.drawYearLabel('2019-24', 20, 60, 18, false);
		expect(colourAt(pdf.calls, indexOfText(pdf.calls, '2019-24'))).toEqual([...COLORS.TEXT_MUTED]);
	});
});

describe('classifyContactLink', () => {
	it('reads the real host, not a substring of the URL', () => {
		expect(classifyContactLink('https://evil.com/github.com', 'x')).toBeNull();
		expect(classifyContactLink('https://github.com/fmadore', 'x')).toEqual({
			displayLabel: 'GitHub:',
			displayValue: 'fmadore'
		});
	});

	it('classifies the addresses the letterhead carries', () => {
		expect(classifyContactLink('mailto:a@b.c', 'a@b.c')?.displayLabel).toBe('Email:');
		expect(classifyContactLink('https://www.frederickmadore.com', 'x')?.displayLabel).toBe('Web:');
		expect(classifyContactLink('https://orcid.org/0000-0003-0959-2092', 'x')).toEqual({
			displayLabel: 'ORCID:',
			displayValue: '0000-0003-0959-2092'
		});
	});

	it('returns null for an unrecognised host rather than guessing', () => {
		expect(classifyContactLink('https://example.org/x', 'x')).toBeNull();
		expect(classifyContactLink('not a url', 'x')).toBeNull();
	});
});
