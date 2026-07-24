/**
 * Generate the PWA icons in static/icons/ from an inline Ink + Signal SVG mark.
 *
 * The mark is the design system reduced to geometry: warm paper ground, the
 * rule hierarchy (masthead / section / hairline ledger rows), and one pine
 * signal block marking "the present". No text, so rasterization needs no
 * fonts. All content sits inside the centre 80% so the same art is safe for
 * `purpose: "maskable"`.
 *
 * One-off tool: run `node scripts/generate-pwa-icons.mjs` and commit the
 * PNGs. Colours mirror src/styles/base/variables.css.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'static', 'icons');

const PAPER = '#faf7ef';
const INK = '#191509';
const PINE = '#1e6a56';

// 512 canvas; content within x/y 64..448 (the maskable safe zone).
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
	<rect width="512" height="512" fill="${PAPER}"/>
	<!-- masthead rule -->
	<rect x="80" y="128" width="352" height="30" fill="${INK}"/>
	<!-- section rule -->
	<rect x="80" y="196" width="352" height="16" fill="${INK}"/>
	<!-- ledger rows (hairlines) -->
	<rect x="80" y="256" width="256" height="8" fill="${INK}"/>
	<rect x="80" y="304" width="256" height="8" fill="${INK}"/>
	<rect x="80" y="352" width="256" height="8" fill="${INK}"/>
	<!-- the pine signal: the accent marks the present -->
	<rect x="368" y="256" width="64" height="104" fill="${PINE}"/>
</svg>`;

await mkdir(outDir, { recursive: true });

const targets = [
	{ file: 'icon-192.png', size: 192 },
	{ file: 'icon-512.png', size: 512 },
	// Same art, exported separately so the manifest can declare purpose:
	// "maskable" without OSes cropping the "any" icon.
	{ file: 'icon-maskable-512.png', size: 512 }
];

for (const { file, size } of targets) {
	await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(outDir, file));
	console.log(`wrote static/icons/${file} (${size}x${size})`);
}
