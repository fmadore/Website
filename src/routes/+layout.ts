import { createWebSiteSchema, createPersonSchema } from '#lib/utils/jsonLdSchemas.ts';
import type { LayoutLoad } from './$types';

export const prerender = true;

/**
 * Root layout load: the WebSite and Person schemas every page carries, which
 * Google reads for the site structure and sitelinks. They stay objects here;
 * the layout combines them, because a page that publishes a fuller Person of
 * its own (the home page, `personSchema` in its load) replaces the minimal one
 * rather than shipping a second node with the same `@id`.
 */
export const load: LayoutLoad = () => ({
	globalSchemas: {
		webSite: createWebSiteSchema(),
		person: createPersonSchema()
	}
});
