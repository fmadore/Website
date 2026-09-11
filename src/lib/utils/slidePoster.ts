import { imageVariantManifest } from '$lib/data/imageVariants.generated';

/**
 * The mirrored cover slide of a deck, resolved from the deck's own URL.
 *
 * Decks live in a separate repository and deploy to slides.frederickmadore.com
 * on their own schedule. `scripts/generate-slide-posters.mjs` mirrors each
 * deck's `social-card.png` into `static/images/communications/slides/<slug>.webp`
 * and the result is committed like every other generated artefact, so the site
 * can print a deck's title slide without reaching the network at build time.
 *
 * Presence in the variant manifest is therefore the existence check: a deck
 * whose poster has never been mirrored simply has no plate, which is a known
 * absence rather than a load failure, and `npm run check:slides` is what
 * reports it.
 *
 * Both consumers — the deck gallery's ledger and the record page's embed
 * facade — resolve it here rather than each parsing the URL and probing the
 * manifest, because two copies of a rule about someone else's URL shape is two
 * places for a slug convention to change out from under the site.
 *
 * @param src Embeddable deck URL, e.g. `https://slides.…/talks/<slug>/`.
 * @returns A manifest-relative path (`images/communications/slides/<slug>.webp`)
 *          ready for `resolveImagePath`, or `undefined` when the URL is not a
 *          deck address or the poster was never mirrored.
 */
export function resolveSlidePoster(src: string | undefined): string | undefined {
	if (!src) return undefined;

	let slug: string | undefined;
	try {
		const segments = new URL(src).pathname.split('/').filter(Boolean);
		if (segments[0] === 'talks') slug = segments[1];
	} catch {
		return undefined;
	}
	if (!slug) return undefined;

	const key = `communications/slides/${slug}.webp`;
	return key in imageVariantManifest ? `images/${key}` : undefined;
}
