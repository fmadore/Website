import type { Contributor } from '$lib/types/contributor';

/** Read the credited name without resolving or changing a historical byline. */
export function getContributorName(contributor: Contributor): string {
	return typeof contributor === 'string' ? contributor : contributor.name;
}

/** Corporate credits belong in bylines, but not in a network of people. */
export function isPersonContributor(contributor: Contributor): boolean {
	return typeof contributor === 'string' || contributor.kind !== 'organisation';
}

/** Preserve credited order and spelling for display, citations and public APIs. */
export function getContributorNames(
	contributors: readonly Contributor[] | undefined | null
): string[] {
	return contributors?.map(getContributorName) ?? [];
}
