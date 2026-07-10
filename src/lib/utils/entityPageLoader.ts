/**
 * Shared detail-page load logic for `[id]` routes.
 *
 * Every entity detail page does the same three things: find the entity by id,
 * 404 when it's missing, and serialize its JSON-LD. Callers rename `entity`
 * to their domain word in the returned data (`publication`, `activity`, …).
 */

import { error } from '@sveltejs/kit';
import { base } from '$app/paths';

export function loadEntityDetail<T>(options: {
	id: string;
	find: (id: string) => T | undefined;
	buildJsonLd: (entity: T, base: string) => object;
	notFound: string;
}): { entity: T; jsonLdString: string } {
	const entity = options.find(options.id);
	if (!entity) {
		throw error(404, options.notFound);
	}
	return {
		entity,
		jsonLdString: JSON.stringify(options.buildJsonLd(entity, base))
	};
}
