/**
 * Breadcrumb JSON-LD Utility
 *
 * Builds BreadcrumbList structured data. Pure: the caller renders the result
 * through `<JsonLd>`, which puts it in `<svelte:head>` and therefore in the
 * prerendered HTML.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import JsonLd from '$lib/components/common/JsonLd.svelte';
 *   import { buildBreadcrumbJsonLd, BREADCRUMB_SCRIPT_ID } from '$lib/utils/breadcrumbJsonLd';
 *
 *   const breadcrumbItems = $derived([
 *     { label: 'Research', path: '/research' },
 *     { label: 'My Project', path: '/research/my-project' }
 *   ]);
 *   const breadcrumbJsonLd = $derived(buildBreadcrumbJsonLd(breadcrumbItems));
 * </script>
 *
 * <JsonLd id={BREADCRUMB_SCRIPT_ID} json={breadcrumbJsonLd} />
 * ```
 */

import { createBreadcrumbSchema } from '$lib/utils/jsonLdSchemas';
import { siteUrl } from '$lib/utils/siteHelpers';

/**
 * One step of a trail, for the structured data. `path` is the route path from
 * the site root (`/publications`) and never carries Kit's `base`: with
 * `paths.relative` on, `base` renders as `.` or `..`, and gluing that to the
 * origin shipped `https://www.frederickmadore.com../publications` on every
 * record page.
 */
export interface BreadcrumbTrailItem {
	label: string;
	path: string;
}

/**
 * A step the visible `<Breadcrumb>` also prints, so it carries the resolved,
 * base-prefixed link beside the route path the structured data reads.
 */
export interface BreadcrumbNavItem extends BreadcrumbTrailItem {
	href: string;
}

export const BREADCRUMB_SCRIPT_ID = 'breadcrumb-json-ld';

/**
 * Builds the two-level breadcrumb trail used by sub-pages
 * (section index → sub-page), for both the visible `Breadcrumb`
 * component and `buildBreadcrumbJsonLd`.
 *
 * @example
 * createSubsectionBreadcrumbs(base, 'Publications', '/publications', 'Visualisations', '/publications/visualisations')
 */
export function createSubsectionBreadcrumbs(
	base: string,
	sectionLabel: string,
	sectionPath: string,
	subLabel: string,
	subPath: string
): BreadcrumbNavItem[] {
	return [
		{ label: sectionLabel, href: `${base}${sectionPath}`, path: sectionPath },
		{ label: subLabel, href: `${base}${subPath}`, path: subPath }
	];
}

/**
 * Builds the BreadcrumbList JSON-LD for a trail, or null when there is none.
 *
 * Every trail starts at Home, as the visible one does, and every `item` is an
 * absolute URL on the configured production origin — never `page.url.origin`,
 * which during prerendering is an internal placeholder rather than the address
 * the page will be served from.
 */
export function buildBreadcrumbJsonLd(items: BreadcrumbTrailItem[]): string | null {
	if (!items || items.length === 0) return null;

	return JSON.stringify(
		createBreadcrumbSchema([
			{ name: 'Home', url: siteUrl('/') },
			...items.map((item) => ({ name: item.label, url: siteUrl(item.path) }))
		])
	);
}
