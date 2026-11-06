/**
 * The publications the home page promotes, listed under the book covers in
 * this order. Add, remove or reorder ids here: each is a publication's `id`
 * (the last part of its address, /publications/<id>). The covers are chosen
 * on their own: every book with a cover image, newest first.
 *
 * An id that matches no publication fails the build and `homeFeatured.test.ts`.
 * Leave the list empty and the home page shows the five newest instead.
 */
export const featuredPublicationIds: readonly string[] = [
	'for-whom-for-what-purpose-dh-ai-african-studies-2026',
	'ai-meets-archive-iwac-llm-2026',
	'repenser-categorisation-religieuse-benin-2026',
	'beyond-keywords-entity-linking-research-metadata-2026'
];
