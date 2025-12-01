import { createWebSiteSchema, createPersonSchema, combineSchemas } from '$lib/utils/seoUtils';
import type { LayoutLoad } from './$types';

export const prerender = true;

/**
 * Root layout load function that provides global SEO data
 * WebSite and Person schemas are critical for Google to understand
 * the site structure and potentially display sitelinks
 */
export const load: LayoutLoad = () => {
	// Create global schemas for the entire site
	const webSiteSchema = createWebSiteSchema();
	const personSchema = createPersonSchema();

	// Combine into a graph structure
	const globalJsonLd = combineSchemas([webSiteSchema, personSchema]);

	return {
		globalJsonLd
	};
};
