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
 *   import { buildBreadcrumbJsonLd, BREADCRUMB_SCRIPT_ID } from '$lib/utils/breadcrumbJsonLd.svelte';
 *
 *   const breadcrumbItems = $derived([
 *     { label: 'Research', href: '/research' },
 *     { label: 'My Project', href: '/research/my-project' }
 *   ]);
 *   const breadcrumbJsonLd = $derived(buildBreadcrumbJsonLd(breadcrumbItems));
 * </script>
 *
 * <JsonLd id={BREADCRUMB_SCRIPT_ID} json={breadcrumbJsonLd} />
 * ```
 */

import { website } from '$lib/utils/siteHelpers';

/**
 * Breadcrumb item definition for generating JSON-LD
 */
export interface BreadcrumbNavItem {
	label: string;
	href: string;
}

export const BREADCRUMB_SCRIPT_ID = 'breadcrumb-json-ld';

/**
 * Builds the two-level breadcrumb trail used by sub-pages
 * (section index → sub-page), for both the visible `Breadcrumb`
 * component and `useBreadcrumbJsonLd`.
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
		{ label: sectionLabel, href: `${base}${sectionPath}` },
		{ label: subLabel, href: `${base}${subPath}` }
	];
}

/**
 * Builds the BreadcrumbList JSON-LD for a trail, or null when there is none.
 *
 * Pure, so the caller can render it through `<JsonLd>` into `<svelte:head>` and
 * have it land in the prerendered HTML. Addresses are built on the configured
 * production origin rather than `page.url.origin`, which during prerendering is
 * an internal placeholder rather than the address the page will be served from.
 */
export function buildBreadcrumbJsonLd(items: BreadcrumbNavItem[]): string | null {
	if (!items || items.length === 0) return null;

	return JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.label,
			item: `${website.url}${item.href}`
		}))
	});
}
