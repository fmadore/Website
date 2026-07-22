/**
 * One-shot optimizer for the images under static/images/.
 *
 * PageSpeed flagged several source files as far larger than any size they are
 * ever displayed at (e.g. a 1704px-wide research card image shown at ~700px).
 * This script caps each category at a maximum width derived from the largest
 * rendering context (HeroImageDisplay's `sizes` tops out at 800 CSS px, so
 * 1280px covers 2×-ish DPR; covers/plates render smaller still) and re-encodes
 * WebP at quality 80. A rewrite is kept only when it saves at least 10% —
 * otherwise the original is left untouched.
 *
 * Usage: node scripts/optimize-images.mjs [--dry-run]
 * Re-run it after adding new images; it is idempotent (already-optimal files
 * are left as they are).
 */
import { readdir, stat, rename, unlink } from 'node:fs/promises';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('../static/images', import.meta.url).pathname;

/** Max width per category. Anything not listed is skipped. */
const MAX_WIDTHS = {
	publications: 800, // covers: ≤175 CSS px in lists, ≤400 CSS px on detail pages
	communications: 1280, // mix of covers and hero/poster plates
	activities: 1280, // hero plates: ≤800 CSS px (HeroImageDisplay sizes attr)
	research: 1280,
	'digital-humanities': 1280
};

const WEBP_QUALITY = 80;
const MIN_SAVINGS = 0.1; // keep a rewrite only if ≥10% smaller

const dryRun = process.argv.includes('--dry-run');

let scanned = 0;
let rewritten = 0;
let bytesBefore = 0;
let bytesAfter = 0;

for (const [category, maxWidth] of Object.entries(MAX_WIDTHS)) {
	const dir = join(ROOT, category);
	let entries;
	try {
		entries = await readdir(dir, { recursive: true });
	} catch {
		continue; // category directory absent
	}

	for (const entry of entries) {
		if (extname(entry).toLowerCase() !== '.webp') continue;
		const file = join(dir, entry);
		scanned++;

		const { size: origSize } = await stat(file);
		const meta = await sharp(file).metadata();
		const targetWidth = Math.min(meta.width ?? maxWidth, maxWidth);

		const tmp = `${file}.tmp`;
		await sharp(file)
			.resize({ width: targetWidth, withoutEnlargement: true })
			.webp({ quality: WEBP_QUALITY })
			.toFile(tmp);

		const { size: newSize } = await stat(tmp);
		if (newSize < origSize * (1 - MIN_SAVINGS)) {
			if (dryRun) {
				await unlink(tmp);
			} else {
				await rename(tmp, file);
			}
			rewritten++;
			bytesBefore += origSize;
			bytesAfter += newSize;
			console.log(
				`${category}/${entry}: ${meta.width}w ${(origSize / 1024).toFixed(0)}KB -> ${targetWidth}w ${(newSize / 1024).toFixed(0)}KB`
			);
		} else {
			await unlink(tmp);
		}
	}
}

console.log(
	`\n${scanned} scanned, ${rewritten} rewritten${dryRun ? ' (dry run — nothing saved)' : ''}: ` +
		`${(bytesBefore / 1024 / 1024).toFixed(1)}MB -> ${(bytesAfter / 1024 / 1024).toFixed(1)}MB`
);
