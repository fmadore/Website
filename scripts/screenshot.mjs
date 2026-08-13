/**
 * Capture a page as a card image for static/images/.
 *
 * Project cards under digital-humanities/ and research/ are screenshots of the
 * thing they point at, so they go stale whenever that site is redesigned. Doing
 * it by hand means a fresh browser, a guessed viewport and an ad-hoc crop every
 * time; this script fixes the recipe instead — 1280 CSS px wide at 2× DPR, then
 * a crop in CSS pixels, then WebP at the same quality the variant generator
 * uses. Run `gen:images` afterwards to emit the responsive derivatives.
 *
 * Usage:
 *   node scripts/screenshot.mjs --url <url> --out <path> [options]
 *   npm run shot -- --url https://example.org/ --out static/images/x/y.webp
 *
 *   --url <url>          page to capture (required)
 *   --out <path>         .webp, .png or .jpg destination (required)
 *   --width <px>         viewport width in CSS px (default 1280)
 *   --height <px>        viewport height in CSS px (default 900)
 *   --scale <n>          device pixel ratio to render at (default 2)
 *   --wait <ms>          settle time after load, for fonts and charts (default 4000)
 *   --selector <css>     scroll this element into view before capturing
 *   --element            capture only --selector's box, not the viewport
 *   --crop <top:height>  crop a full-page capture, in CSS px from the top
 *   --dark               request the dark colour scheme
 *   --quality <n>        WebP/JPEG quality (default 80, matching gen:images)
 *
 * Finding a crop: run once with `--crop 0:99999` to keep the whole page, open
 * the result, measure, then re-run with the real offsets.
 */
import { mkdir, stat } from 'node:fs/promises';
import { dirname, extname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// fileURLToPath, not URL.pathname: the latter yields "/C:/…" on Windows.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function arg(name, fallback = undefined) {
	const i = process.argv.indexOf(`--${name}`);
	return i === -1 ? fallback : process.argv[i + 1];
}
const flag = (name) => process.argv.includes(`--${name}`);

const url = arg('url');
const out = arg('out');
if (!url || !out) {
	console.error('usage: node scripts/screenshot.mjs --url <url> --out <path> [options]');
	console.error('       see the header of this file for the full option list');
	process.exit(2);
}

const width = Number(arg('width', 1280));
const height = Number(arg('height', 900));
const scale = Number(arg('scale', 2));
const wait = Number(arg('wait', 4000));
const quality = Number(arg('quality', 80));
const selector = arg('selector');
const elementOnly = flag('element');
const crop = arg('crop');

const outPath = isAbsolute(out) ? out : resolve(ROOT, out);
const ext = extname(outPath).toLowerCase();
if (!['.webp', '.png', '.jpg', '.jpeg'].includes(ext)) {
	console.error(`unsupported output extension "${ext}" — use .webp, .png or .jpg`);
	process.exit(2);
}

let chromium;
try {
	({ chromium } = await import('playwright'));
} catch {
	console.error('playwright is not installed; run `npx playwright install chromium`');
	process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width, height },
	deviceScaleFactor: scale,
	colorScheme: flag('dark') ? 'dark' : 'light'
});

let buffer;
try {
	await page.goto(url, { waitUntil: 'networkidle', timeout: 90_000 });

	if (selector) {
		const target = page.locator(selector).first();
		await target.scrollIntoViewIfNeeded({ timeout: 30_000 });
		await page.waitForTimeout(wait);
		buffer = await (elementOnly ? target : page).screenshot({ type: 'png' });
	} else {
		await page.waitForTimeout(wait);
		buffer = await page.screenshot({ type: 'png', fullPage: Boolean(crop) });
	}
} finally {
	await browser.close();
}

let image = sharp(buffer);

if (crop) {
	const [top, cropHeight] = crop.split(':').map(Number);
	if (!Number.isFinite(top) || !Number.isFinite(cropHeight)) {
		console.error(`--crop expects <top>:<height> in CSS px, got "${crop}"`);
		process.exit(2);
	}
	const meta = await image.metadata();
	// The capture is in device pixels; the crop is quoted in CSS pixels.
	const box = {
		left: 0,
		top: Math.min(Math.round(top * scale), (meta.height ?? 0) - 1),
		width: meta.width ?? width * scale,
		height: Math.round(cropHeight * scale)
	};
	box.height = Math.min(box.height, (meta.height ?? 0) - box.top);
	image = sharp(await image.extract(box).toBuffer());
}

// Card images are displayed at 1280 CSS px at most, so the 2× capture is
// downsampled rather than shipped: it is the size gen:images expects as source.
const meta = await image.metadata();
if ((meta.width ?? 0) > width) {
	image = image.resize({ width, withoutEnlargement: true });
}

await mkdir(dirname(outPath), { recursive: true });
if (ext === '.webp') await image.webp({ quality }).toFile(outPath);
else if (ext === '.png') await image.png().toFile(outPath);
else await image.jpeg({ quality }).toFile(outPath);

const final = await sharp(outPath).metadata();
const { size } = await stat(outPath);
console.log(
	`screenshot: ${url} → ${out} (${final.width}×${final.height}, ${Math.round(size / 1024)} KiB)`
);
console.log('run `npm run gen:images` to emit the responsive derivatives');
