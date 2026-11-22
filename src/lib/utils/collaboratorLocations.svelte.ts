/**
 * The state behind the "locations" section the two visualisation pages share:
 * a map of where the records were published or given, switchable to where the
 * collaborators on them were affiliated (#215).
 *
 * Both pages carried the same ~120 lines: the dataset toggle and its filters,
 * the lazy load of the people and institutions registries, and the lazy load
 * of the map component. Held here once, as a runed class each page constructs
 * with what differs (its locations and its collaborator builder) and reads
 * directly — the section's count in the contents ledger needs this state at
 * page level, which is why it is a controller and not a component.
 *
 * Both lazy loads can be retried. The map chunk once could not: a page set
 * its "requested" flag before the `import()` and never cleared it, so one
 * failed fetch (a cold offline load, a stale service-worker manifest) left
 * the map in its error state until a full reload. The chunk now goes through
 * `retryableLoader`, which forgets a rejected attempt, and `loadMap` can be
 * called again. Chromium also remembers a failed module fetch, so a second
 * attempt there fails at once; `LocationMapPlate` falls back to a reload.
 */
import type { Component } from 'svelte';
import type { LocationDatum } from '#lib/data/geo.ts';
import type { Institution, Person } from '#lib/types/person.ts';
import type { CollaboratorMapResult } from '#lib/utils/collaboratorAggregation.ts';
import { retryableLoader } from '#lib/utils/retryableLoader.ts';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';
export type LocationDataset = 'locations' | 'collaborators';

/** The map component, typed loosely: this module must not import it statically. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the component's own props type lives in a chunk this module may not reach
export type LocationMapComponent = Component<any>;

/** Neither load ever runs on the server: they answer the browser's scroll and clicks. */
const notOnServer = () => Promise.reject(new Error('Not loaded during server rendering'));

/**
 * Module-level, so a second visit to either page reuses the loaded chunk, and
 * a failed attempt is forgotten rather than cached.
 *
 * The `import.meta.env.SSR` branch is not defensive: it is what keeps the
 * `import()` out of the server build. SvelteKit inlines the CSS of every
 * dynamic import the server bundle still holds, so a loader left in it put
 * LocationMap's styles and map-chrome.css (2.3 kB gzipped) into the prerendered
 * head of both visualisation pages, for a plate a dozen viewports down.
 */
const loadLocationMap: () => Promise<LocationMapComponent> = import.meta.env.SSR
	? notOnServer
	: retryableLoader(
			async () => (await import('#lib/components/visualisations/LocationMap.svelte')).default
		);

/** The two registries the collaborator view resolves affiliations from. */
const loadRegistries: () => Promise<{ people: Person[]; institutions: Institution[] }> = import.meta
	.env.SSR
	? notOnServer
	: retryableLoader(async () => {
			const [peopleModule, institutionsModule] = await Promise.all([
				import('#lib/data/people/index.ts'),
				import('#lib/data/institutions.ts')
			]);
			return { people: peopleModule.allPeople, institutions: institutionsModule.institutions };
		});

export interface CollaboratorLocationsOptions {
	/** The records' own locations (publishers, venues), read reactively. */
	locations: () => LocationDatum[];
	/** Resolve the collaborators against the registries, for a year and certainty. */
	collaborators: (
		people: Person[],
		institutions: Institution[],
		year: number | undefined,
		includeUncertain: boolean
	) => CollaboratorMapResult;
	/** Loaders, replaceable in tests. */
	loadMap?: () => Promise<LocationMapComponent>;
	loadRegistries?: () => Promise<{ people: Person[]; institutions: Institution[] }>;
}

export class CollaboratorLocations {
	dataset = $state<LocationDataset>('locations');
	year = $state<number | undefined>(undefined);
	includeUncertain = $state(false);

	affiliationStatus = $state<LoadStatus>('idle');
	#people = $state.raw<Person[]>([]);
	#institutions = $state.raw<Institution[]>([]);

	readonly #options: CollaboratorLocationsOptions;

	mapStatus = $state<LoadStatus>('idle');
	map = $state.raw<LocationMapComponent | null>(null);
	/** Bound to the map: true when it loaded but could not draw (tiles, WebGL). */
	mapFailed = $state(false);

	collaborators = $derived.by(() =>
		this.#options.collaborators(this.#people, this.#institutions, this.year, this.includeUncertain)
	);

	/** What the map draws: the records' locations, or the collaborators'. */
	selected = $derived.by(() =>
		this.dataset === 'collaborators' ? this.collaborators.locations : this.#options.locations()
	);

	/** The collaborator points are still on their way. */
	loadingPoints = $derived(
		this.affiliationStatus === 'idle' || this.affiliationStatus === 'loading'
	);

	/**
	 * The map could not be had (its chunk or its drawing failed), so the
	 * section's note must stop promising view modes to switch between.
	 */
	mapUnavailable = $derived(this.mapFailed || this.mapStatus === 'error');

	constructor(options: CollaboratorLocationsOptions) {
		// The deriveds that read #options are lazy (`$derived.by`): nothing reads
		// it before this assignment.
		this.#options = options;
		// The registries are substantial and belong only to the collaborator view.
		$effect(() => {
			if (this.dataset === 'collaborators' && this.affiliationStatus === 'idle') {
				void this.loadAffiliations();
			}
		});
	}

	/** Load the registries; after a failure, calling it again tries again. */
	loadAffiliations = async (): Promise<void> => {
		if (this.affiliationStatus === 'loading' || this.affiliationStatus === 'ready') return;
		this.affiliationStatus = 'loading';
		try {
			const { people, institutions } = await (this.#options.loadRegistries ?? loadRegistries)();
			this.#people = people;
			this.#institutions = institutions;
			this.affiliationStatus = 'ready';
		} catch (error) {
			this.affiliationStatus = 'error';
			if (import.meta.env.DEV) console.error('Affiliation evidence failed to load:', error);
		}
	};

	/** Load the map component; after a failure, calling it again tries again. */
	loadMap = async (): Promise<void> => {
		if (this.mapStatus === 'loading' || this.mapStatus === 'ready') return;
		this.mapStatus = 'loading';
		try {
			this.map = await (this.#options.loadMap ?? loadLocationMap)();
			this.mapStatus = 'ready';
		} catch (error) {
			this.mapStatus = 'error';
			if (import.meta.env.DEV) console.error('map chunk failed to load:', error);
		}
	};
}
