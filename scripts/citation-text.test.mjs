import { describe, it, expect } from 'vitest';
import { cleanTitle, flatten } from './citation-text.mjs';

/**
 * These two run over strings written by whoever filed the metadata, and their
 * output is posted verbatim as a GitHub issue body and printed to a terminal.
 * The cases below are the ways that has gone wrong or could.
 */

describe('cleanTitle', () => {
	it('strips the publisher markup OpenAlex files in titles', () => {
		expect(cleanTitle('The <i>ʿawra</i> in <sub>context</sub>')).toBe('The ʿawra in context');
	});

	it('decodes entities without walking its own output', () => {
		// `&amp;lt;` encodes the literal text "&lt;". Decoding twice would turn
		// it into `<`, inventing markup the source never contained.
		expect(cleanTitle('Tom &amp;lt; Jerry')).toBe('Tom &lt; Jerry');
		expect(cleanTitle('Rock &amp; Roll')).toBe('Rock & Roll');
	});

	it('never splices a tag back together out of its own output', () => {
		// Deleting the inner `<b>` in one pass would rejoin `<scr` and `ipt>`
		// into a live `<script>`. Looping to a fixed point cannot: what is left
		// is inert text, not a tidy result, and inert is the property that matters.
		const out = cleanTitle('<scr<b>ipt>alert(1)</scr</b>ipt>');
		expect(out).not.toContain('<');
		expect(out.toLowerCase()).not.toContain('script');
		expect(out).toBe('ipt>alert(1)ipt>');
	});

	it('strips before decoding, so escaped markup stays visible text', () => {
		expect(cleanTitle('&lt;i&gt;italic&lt;/i&gt;')).toBe('<i>italic</i>');
	});

	it('handles null and undefined', () => {
		expect(cleanTitle(null)).toBe('');
		expect(cleanTitle(undefined)).toBe('');
	});
});

describe('flatten', () => {
	it('collapses a newline that would otherwise end a bullet early', () => {
		expect(flatten('First line\nSecond line')).toBe('First line Second line');
	});

	it('neutralises backticks, which would close the surrounding code fence', () => {
		expect(flatten('a ` b')).toBe("a ' b");
	});

	it('strips the C0 controls that \\s leaves behind', () => {
		// NUL, ESC and DEL: an ANSI escape is live in the terminal the script
		// prints to, and none of the three is matched by \\s.
		const NUL = String.fromCharCode(0);
		const ESC = String.fromCharCode(27);
		const DEL = String.fromCharCode(127);
		expect(flatten(`a${NUL}b`)).toBe('a b');
		expect(flatten(`red${ESC}[31mtext`)).toBe('red [31mtext');
		expect(flatten(`a${DEL}b`)).toBe('a b');
	});

	it('strips C1 controls too', () => {
		expect(flatten(`a${String.fromCharCode(0x9b)}b`)).toBe('a b');
	});

	it('truncates beyond the limit rather than emitting an unbounded string', () => {
		const out = flatten('x'.repeat(600));
		expect(out).toHaveLength(500);
		expect(out.endsWith('…')).toBe(true);
	});

	it('leaves ordinary text alone', () => {
		expect(flatten('  Islam au Burkina Faso  ')).toBe('Islam au Burkina Faso');
	});

	it('handles null and undefined', () => {
		expect(flatten(null)).toBe('');
		expect(flatten(undefined)).toBe('');
	});
});
