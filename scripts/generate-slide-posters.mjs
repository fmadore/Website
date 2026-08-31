/**
 * Mirror each published deck's cover slide into static/images as a poster.
 *
 * The slides repo already renders what we want: tools/export-pdf.mjs writes a
 * 1280x720 screenshot of every deck's cover slide to `<deck>/social-card.png`
 * (it is each deck's og:image). There is nothing to render here — only to
 * fetch, transcode and commit.
 *
 * Why mirror instead of hotlinking the PNG:
 *   - a 1280x720 PNG is ~85 kB, and hotlinking ships all of it to every
 *     viewport. Mirrored into static/images, the file goes through
 *     generate-image-variants.mjs and gets 400w/800w webp candidates like
 *     every other image on the site.
 *   - the site is otherwise self-hosted; a cross-origin <img> on a detail page
 *     makes the render depend on a second deployment being up.
 *
 * Why this is NOT in `prebuild`: it reaches the network, and a build that
 * fetches is a build that fails when someone else's DNS does. Posters are
 * generated deliberately and committed, like the other generated artefacts in
 * this repo; scripts/check-slides.mjs is what notices when they drift.
 *
 * Usage:
 *   node scripts/generate-slide-posters.mjs           # fetch, transcode, write
 *   node scripts/generate-slide-posters.mjs --check   # report drift, write nothing
 *   node scripts/generate-slide-posters.mjs --prune   # also delete orphaned posters
 *
 * Exit code is 1 when a cover could not be fetched, or when --check finds a
 * missing or stale poster; else 0.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { walkData, loadModule } from './vault-sync-lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'src/lib/data/communications');
const POSTER_DIR = path.join(ROOT, 'static/images/communications/slides');

const CHECK_ONLY = process.argv.includes('--check');
const PRUNE = process.argv.includes('--prune');
const REQUEST_TIMEOUT_MS = 20_000;

/** WebP settings, kept in step with generate-image-variants.mjs. */
const WEBP = { quality: 80 };

/**
 * `https://slides.frederickmadore.com/talks/<slug>/` -> `<slug>`.
 * Mirrored in scripts/check-slides.mjs and SlideDeckEmbed.svelte — three lines
 * of URL parsing is cheaper to repeat than a shared module that a .mjs script,
 * a .ts module and a Svelte component would all have to reach into.
 */
function deckSlug(slidesUrl) {
	try {
		const segments = new URL(slidesUrl).pathname.split('/').filter(Boolean);
		if (segments[0] !== 'talks' || !segments[1]) return null;
		return segments[1];
	} catch {
		return null;
	}
}

async function fetchCover(slidesUrl) {
	const url = new URL('social-card.png', slidesUrl.endsWith('/') ? slidesUrl : `${slidesUrl}/`);
	const response = await fetch(url, {
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		headers: { accept: 'image/png,image/*' }
	});
	if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
	return Buffer.from(await response.arrayBuffer());
}

async function mirror(communications) {
	mkdirSync(POSTER_DIR, { recursive: true });

	const drift = [];
	const failures = [];
	const expected = new Set();
	let written = 0;
	let unchanged = 0;

	for (const record of communications) {
		const slug = deckSlug(record.slidesUrl);
		if (!slug) {
			failures.push(`${record.id}: slidesUrl is not a /talks/<slug>/ URL (${record.slidesUrl})`);
			continue;
		}
		expected.add(`${slug}.webp`);
		const out = path.join(POSTER_DIR, `${slug}.webp`);

		let webp;
		try {
			// The cover is transcoded at its native 1280x720; the variants
			// generator derives the 400w/800w candidates from this file after.
			webp = await sharp(await fetchCover(record.slidesUrl))
				.webp(WEBP)
				.toBuffer();
		} catch (error) {
			failures.push(`${slug}: ${error.message}`);
			continue;
		}

		// webp encoding is deterministic for the same input and options, so a
		// byte comparison is a sufficient staleness test — no sidecar hash.
		// Read it outright rather than existsSync-then-read: the pair is a TOCTOU
		// race, and ENOENT already means exactly 'there is no poster yet'.
		let current = null;
		try {
			current = readFileSync(out);
		} catch (err) {
			if (err.code !== 'ENOENT') throw err;
		}
		if (current && current.equals(webp)) {
			unchanged += 1;
			continue;
		}

		if (CHECK_ONLY) {
			drift.push(`${slug}: poster is ${current ? 'stale' : 'missing'} (${record.title})`);
			continue;
		}

		writeFileSync(out, webp);
		written += 1;
		console.log(`${current ? 'updated' : 'created'}  images/communications/slides/${slug}.webp`);
	}

	// A poster whose talk lost its slidesUrl is dead weight in the repo.
	// Reported always; removed only when asked, so an in-progress rename cannot
	// silently delete work.
	const orphans = readdirSync(POSTER_DIR, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.webp'))
		.map((entry) => entry.name)
		.filter((name) => !expected.has(name));
	for (const name of orphans) {
		if (PRUNE && !CHECK_ONLY) {
			unlinkSync(path.join(POSTER_DIR, name));
			console.log(`removed  images/communications/slides/${name} (no talk links this deck)`);
		} else {
			console.warn(
				`orphan   images/communications/slides/${name} (no talk links this deck; --prune removes it)`
			);
		}
	}

	if (failures.length > 0) {
		console.error(`\nCould not mirror ${failures.length} cover(s):`);
		for (const line of failures) console.error(`  ${line}`);
	}

	if (CHECK_ONLY) {
		if (drift.length > 0) {
			console.error(`\n${drift.length} poster(s) out of date:`);
			for (const line of drift) console.error(`  ${line}`);
			console.error('\nRegenerate with `npm run gen:posters` and commit the result.');
		} else if (failures.length === 0) {
			console.log(`All ${unchanged} deck poster(s) match their published cover slide.`);
		}
		process.exitCode = drift.length > 0 || failures.length > 0 ? 1 : 0;
		return;
	}

	console.log(
		`\n${written} written, ${unchanged} unchanged, ${communications.length} deck(s) total.`
	);
	if (written > 0) console.log('Run `npm run gen:images` to derive the responsive candidates.');
	process.exitCode = failures.length > 0 ? 1 : 0;
}

const communications = [];
for (const file of walkData(DATA_DIR)) {
	const record = await loadModule(file);
	if (record?.slidesUrl) communications.push(record);
}
communications.sort((a, b) => String(b.dateISO ?? '').localeCompare(String(a.dateISO ?? '')));

if (communications.length === 0) {
	console.log('No communications carry a slidesUrl; nothing to mirror.');
} else {
	await mirror(communications);
}
