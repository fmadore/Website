import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import type { LocationDatum } from '../src/lib/data/geo';
import type { CollaboratorMapResult } from '../src/lib/utils/collaboratorAggregation';
import {
	CollaboratorLocations,
	type CollaboratorLocationsOptions
} from '../src/lib/utils/collaboratorLocations.svelte';

const venue = { country: 'Togo', count: 2 } as unknown as LocationDatum;
const affiliation = { country: 'Germany', count: 1 } as unknown as LocationDatum;

let stop: (() => void) | undefined;
afterEach(() => {
	stop?.();
	stop = undefined;
});

/** Settle the controller's awaited loaders, then Svelte's scheduler. */
async function settle() {
	for (let i = 0; i < 5; i++) await Promise.resolve();
	flushSync();
}

function setup(overrides: Partial<CollaboratorLocationsOptions> = {}) {
	const collaborators = vi.fn(
		(people: unknown[], _institutions: unknown[], year: number | undefined) =>
			({
				locations: people.length > 0 ? [affiliation] : [],
				mappedPeople: people.length,
				totalPeople: people.length,
				year
			}) as unknown as CollaboratorMapResult
	);
	let controller!: CollaboratorLocations;
	stop = $effect.root(() => {
		controller = new CollaboratorLocations({
			locations: () => [venue],
			collaborators,
			loadRegistries: vi.fn(async () => ({ people: [{} as never], institutions: [] })),
			loadMap: vi.fn(async () => (() => {}) as never),
			...overrides
		});
	});
	flushSync();
	return { controller, collaborators };
}

describe('CollaboratorLocations', () => {
	it('draws the records’ own locations until the collaborator view is chosen', () => {
		const { controller } = setup();
		expect(controller.dataset).toBe('locations');
		expect(controller.selected).toEqual([venue]);
		expect(controller.affiliationStatus).toBe('idle');
	});

	it('loads the registries only for the collaborator view, then draws them', async () => {
		const loadRegistries = vi.fn(async () => ({ people: [{} as never], institutions: [] }));
		const { controller } = setup({ loadRegistries });
		expect(loadRegistries).not.toHaveBeenCalled();
		controller.dataset = 'collaborators';
		flushSync();
		expect(controller.affiliationStatus).toBe('loading');
		expect(controller.loadingPoints).toBe(true);
		await settle();
		expect(loadRegistries).toHaveBeenCalledTimes(1);
		expect(controller.affiliationStatus).toBe('ready');
		expect(controller.selected).toEqual([affiliation]);
		expect(controller.loadingPoints).toBe(false);
	});

	it('passes the year and certainty filters to the builder', () => {
		const { controller, collaborators } = setup();
		controller.year = 2024;
		controller.includeUncertain = true;
		expect(controller.collaborators).toMatchObject({ year: 2024 });
		expect(collaborators).toHaveBeenLastCalledWith([], [], 2024, true);
	});

	it('retries the registries after a failure', async () => {
		const loadRegistries = vi
			.fn<NonNullable<CollaboratorLocationsOptions['loadRegistries']>>()
			.mockRejectedValueOnce(new Error('offline'))
			.mockResolvedValueOnce({ people: [{} as never], institutions: [] });
		const { controller } = setup({ loadRegistries });
		controller.dataset = 'collaborators';
		flushSync();
		await settle();
		expect(controller.affiliationStatus).toBe('error');
		await controller.loadAffiliations();
		flushSync();
		expect(controller.affiliationStatus).toBe('ready');
	});

	it('loads the map once, and can retry it after a failed chunk (#215)', async () => {
		const Map = () => {};
		const loadMap = vi
			.fn<NonNullable<CollaboratorLocationsOptions['loadMap']>>()
			.mockRejectedValueOnce(new Error('chunk lost'))
			.mockResolvedValue(Map as never);
		const { controller } = setup({ loadMap });

		await controller.loadMap();
		expect(controller.mapStatus).toBe('error');
		expect(controller.mapUnavailable).toBe(true);
		expect(controller.map).toBeNull();

		await controller.loadMap();
		expect(controller.mapStatus).toBe('ready');
		expect(controller.map).toBe(Map);
		expect(controller.mapUnavailable).toBe(false);

		await controller.loadMap();
		expect(loadMap).toHaveBeenCalledTimes(2);
	});

	it('reports a map that loaded but could not draw', () => {
		const { controller } = setup();
		controller.mapFailed = true;
		expect(controller.mapUnavailable).toBe(true);
	});
});
