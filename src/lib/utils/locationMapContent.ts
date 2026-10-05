import { COUNTRY_COORDINATES, type LocationDatum, type LocationMapItem } from '$lib/data/geo';

type Coordinates = { lat: number; lng: number };

/** Precise institution markers must never inherit a country's centre. */
export function locationCoordinates(
	datum: LocationDatum,
	precisePoints = false
): Coordinates | undefined {
	const coordinates =
		precisePoints || datum.collaborators !== undefined
			? datum.coordinates
			: (datum.coordinates ?? COUNTRY_COORDINATES[datum.country]);
	if (
		!coordinates ||
		!Number.isFinite(coordinates.lat) ||
		!Number.isFinite(coordinates.lng) ||
		Math.abs(coordinates.lat) > 90 ||
		Math.abs(coordinates.lng) > 180
	) {
		return undefined;
	}
	return coordinates;
}

export function escapeMapText(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/** Registry links are internal paths; reject schemes and protocol-relative URLs. */
export function locationItemHref(item: LocationMapItem, base: string, basePath: string): string {
	const href = item.href;
	return href?.startsWith('/') && !href.startsWith('//') && !href.includes('\\')
		? `${base}${href}`
		: `${base}${basePath}/${encodeURIComponent(item.id)}`;
}

/** Popup content uses the same people and linked records as the table below the map. */
export function collaboratorPopupContent(
	datum: LocationDatum,
	base: string,
	basePath: string
): string {
	const collaborators = datum.collaborators ?? [];
	const countLabel = `${datum.count} ${datum.count === 1 ? 'collaborator' : 'collaborators'}`;
	const people = collaborators
		.map((person) => {
			const items = person.items
				.map(
					(item) =>
						`<li><a class="item-link" href="${escapeMapText(locationItemHref(item, base, basePath))}">${escapeMapText(item.title)}</a></li>`
				)
				.join('');
			return `<li>
				<span class="collaborator-name">${escapeMapText(person.name)}</span>
				${person.confidence === 'uncertain' ? '<span class="affiliation-uncertain">Uncertain affiliation</span>' : ''}
				<ul class="item-sublist">${items}</ul>
			</li>`;
		})
		.join('');

	return `<div class="location-popup">
		<strong>${escapeMapText(datum.label ?? datum.country)}</strong>
		<div class="item-count">${countLabel} · ${escapeMapText(datum.country)}</div>
		<ul class="item-list">${people}</ul>
	</div>`;
}
