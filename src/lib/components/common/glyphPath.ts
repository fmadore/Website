/**
 * Path data for the same-document glyph sprites (`GlyphSprite.svelte`).
 *
 * The icon sets publish coordinates at whatever precision their source drawing
 * had: Academicons' marks carry three decimals in a 512-unit box, which at the
 * 15–16px the site draws them is a thousandth of a pixel. The digits are pure
 * transfer: the footer's twelve marks were 4.5 kB of every page's gzip, most of
 * it in three Academicons paths. `compactPath` rounds each coordinate to a step
 * of at most 1/200 of the glyph's box, so no point moves by more than 0.25% of
 * the glyph (0.04px at 16px), and diffuses the error through relative
 * commands: each relative offset is taken from the *rounded* position of the
 * point before it, so the error never accumulates along the path.
 *
 * Pure string functions, unit-tested beside this file.
 */

/** Arguments per segment of each SVG path command. */
const ARITY: Record<string, number> = {
	m: 2,
	l: 2,
	h: 1,
	v: 1,
	c: 6,
	s: 4,
	q: 4,
	t: 2,
	a: 7,
	z: 0
};

/** The `id` of a glyph's `<symbol>`: `academicons:doi` → `glyph-academicons-doi`. */
export function glyphId(name: string): string {
	return `glyph-${name.replace(/[^a-z0-9-]/gi, '-')}`;
}

/**
 * The rounding step for a glyph drawn in a `width` × `height` box: the largest
 * power of ten no greater than 1/200 of its longer side (0.1 for a 24-unit
 * box, 1 for a 512-unit one).
 */
export function glyphStep(width: number, height: number): number {
	return 10 ** Math.floor(Math.log10(Math.max(width, height) / 200));
}

interface Segment {
	command: string;
	args: number[];
}

/** Split path data into segments, one per command repetition, implicit repeats made explicit. */
export function parsePath(d: string): Segment[] {
	const segments: Segment[] = [];
	let i = 0;
	let command = '';
	const skip = () => {
		while (i < d.length && /[\s,]/.test(d[i] ?? '')) i += 1;
	};
	const number = (): number => {
		skip();
		const match = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/.exec(d.slice(i));
		if (!match) throw new Error(`path: expected a number at ${i} in "${d}"`);
		i += match[0].length;
		return Number(match[0]);
	};
	const flag = (): number => {
		skip();
		const c = d[i];
		if (c !== '0' && c !== '1') throw new Error(`path: expected an arc flag at ${i} in "${d}"`);
		i += 1;
		return Number(c);
	};
	for (skip(); i < d.length; skip()) {
		const c = d[i] ?? '';
		if (/[a-z]/i.test(c)) {
			if (!(c.toLowerCase() in ARITY)) throw new Error(`path: unknown command "${c}"`);
			command = c;
			i += 1;
			if (command.toLowerCase() === 'z') {
				segments.push({ command, args: [] });
				continue;
			}
		} else if (!command || command.toLowerCase() === 'z') {
			throw new Error(`path: number without a command at ${i} in "${d}"`);
		}
		const lower = command.toLowerCase();
		const args: number[] = [];
		for (let k = 0; k < (ARITY[lower] ?? 0); k += 1) {
			args.push(lower === 'a' && (k === 3 || k === 4) ? flag() : number());
		}
		segments.push({ command, args });
		// A moveto's further pairs are linetos of the same case.
		if (lower === 'm') command = command === 'm' ? 'l' : 'L';
	}
	return segments;
}

/** Which arguments of a segment are x (0), y (1) or neither (-1). */
function roles(lower: string): number[] {
	switch (lower) {
		case 'h':
			return [0];
		case 'v':
			return [1];
		case 'a':
			return [-1, -1, -1, -1, -1, 0, 1];
		default:
			return Array.from({ length: ARITY[lower] ?? 0 }, (_, k) => k % 2);
	}
}

/**
 * Every point a path visits or pulls toward (endpoints and control points), in
 * absolute coordinates. What `compactPath` must preserve, and what the tests
 * compare.
 */
export function pathPoints(d: string): [number, number][] {
	const points: [number, number][] = [];
	let x = 0;
	let y = 0;
	let startX = 0;
	let startY = 0;
	for (const { command, args } of parsePath(d)) {
		const lower = command.toLowerCase();
		const relative = command === lower;
		if (lower === 'z') {
			x = startX;
			y = startY;
			continue;
		}
		const role = roles(lower);
		let px = x;
		let py = y;
		const segmentPoints: [number, number][] = [];
		role.forEach((r, k) => {
			const value = args[k] ?? 0;
			if (r === 0) px = relative ? x + value : value;
			if (r === 1) py = relative ? y + value : value;
			const pairEnd = lower === 'h' || lower === 'v' || (r === 1 && k > 0);
			if (pairEnd) segmentPoints.push([px, py]);
		});
		points.push(...segmentPoints);
		[x, y] = segmentPoints.at(-1) ?? [x, y];
		if (lower === 'm') [startX, startY] = [x, y];
	}
	return points;
}

/** A number at `decimals` places, without trailing zeros, leading zero or negative zero. */
function format(value: number, decimals: number): string {
	let text = value.toFixed(decimals);
	if (text.includes('.')) text = text.replace(/0+$/, '').replace(/\.$/, '');
	if (text === '-0') text = '0';
	return text.replace(/^(-?)0\./, '$1.');
}

/**
 * Round path data to `step` (a power of ten), keeping every absolute point
 * within half a step of where it was. Relative offsets are recomputed from the
 * rounded position of the point they hang from, so the rounding error of one
 * segment is corrected by the next instead of carried along the path.
 */
export function compactPath(d: string, step: number): string {
	const decimals = Math.max(0, -Math.round(Math.log10(step)));
	const round = (value: number) => Math.round(value / step) * step;
	let out = '';
	let lastNumber = '';
	const emit = (token: string) => {
		const needsSeparator =
			lastNumber !== '' &&
			!token.startsWith('-') &&
			!(token.startsWith('.') && lastNumber.includes('.'));
		out += (needsSeparator ? ' ' : '') + token;
		lastNumber = token;
	};
	let previous = '';
	let x = 0; // exact current point
	let y = 0;
	let rx = 0; // rounded current point
	let ry = 0;
	let startX = 0;
	let startY = 0;
	let startRx = 0;
	let startRy = 0;

	for (const { command, args } of parsePath(d)) {
		const lower = command.toLowerCase();
		const relative = command === lower;
		if (lower === 'z') {
			out += command;
			lastNumber = '';
			previous = command;
			[x, y, rx, ry] = [startX, startY, startRx, startRy];
			continue;
		}
		// A repeated command, or a lineto straight after a moveto of the same
		// case, is implicit.
		const implicit =
			command === previous ||
			(previous === 'm' && command === 'l') ||
			(previous === 'M' && command === 'L');
		if (!implicit) {
			out += command;
			lastNumber = '';
		}
		let ex = x;
		let ey = y;
		let erx = rx;
		let ery = ry;
		roles(lower).forEach((r, k) => {
			const value = args[k] ?? 0;
			if (r === -1) {
				// Radii and rotation round in place; arc flags are integers already.
				const flag = lower === 'a' && (k === 3 || k === 4);
				emit(flag ? String(value) : format(round(value), decimals));
				return;
			}
			const exact = relative ? (r === 0 ? x : y) + value : value;
			const base = relative ? (r === 0 ? rx : ry) : 0;
			const offset = round(exact - base);
			emit(format(offset, decimals));
			if (r === 0) [ex, erx] = [exact, base + offset];
			else [ey, ery] = [exact, base + offset];
		});
		previous = implicit ? previous : command;
		[x, y, rx, ry] = [ex, ey, erx, ery];
		if (lower === 'm') [startX, startY, startRx, startRy] = [x, y, rx, ry];
	}
	return out;
}

/**
 * An Iconify body with every `d` attribute compacted for its box. A path that
 * rounding would not shorten (one already drawn on a coarse grid) is kept as
 * it was.
 */
export function compactBody(body: string, width: number, height: number): string {
	const step = glyphStep(width, height);
	return body.replace(/(\sd=")([^"]*)(")/g, (_, open: string, d: string, close: string) => {
		const compact = compactPath(d, step);
		return open + (compact.length < d.length ? compact : d) + close;
	});
}
