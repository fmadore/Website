<script lang="ts">
	import type { Snippet } from 'svelte';
	import { base } from '$app/paths';
	import type { LocationDatum } from '$lib/data/geo';
	import type { buildPublicationCollaborators } from '$lib/utils/collaboratorAggregation';
	import { locationItemHref } from '$lib/utils/locationMapContent';
	import VizChartCard from './VizChartCard.svelte';
	import VizDataTable from './VizDataTable.svelte';

	let {
		dataset = $bindable('locations'),
		year = $bindable<number | undefined>(undefined),
		includeUncertain = $bindable(false),
		locationLabel,
		locationData,
		collaborators,
		status,
		retry,
		years,
		basePath,
		itemLabel,
		children
	}: {
		dataset?: 'locations' | 'collaborators';
		year?: number;
		includeUncertain?: boolean;
		locationLabel: 'Publishers' | 'Venues';
		locationData: LocationDatum[];
		collaborators: ReturnType<typeof buildPublicationCollaborators>;
		status: 'idle' | 'loading' | 'ready' | 'error';
		retry: () => void;
		years: number[];
		basePath: string;
		itemLabel: 'Publications' | 'Talks';
		children: Snippet;
	} = $props();

	const controlId = $props.id();
	const countryRows = $derived(
		locationData.map((datum) => ({ label: datum.country, value: datum.count }))
	);
</script>

<div class="collaborator-controls">
	<div class="dataset-toggle" role="group" aria-label="Map dataset">
		<button
			type="button"
			class:active={dataset === 'locations'}
			aria-pressed={dataset === 'locations'}
			onclick={() => (dataset = 'locations')}>{locationLabel}</button
		>
		<button
			type="button"
			class:active={dataset === 'collaborators'}
			aria-pressed={dataset === 'collaborators'}
			onclick={() => (dataset = 'collaborators')}>Collaborators</button
		>
	</div>
	{#if dataset === 'collaborators'}
		<div class="affiliation-filters">
			<label for="{controlId}-year">Collaboration year</label>
			<select id="{controlId}-year" bind:value={year}>
				<option value={undefined}>All years</option>
				{#each years as optionYear (optionYear)}
					<option value={optionYear}>{optionYear}</option>
				{/each}
			</select>
			<label class="uncertainty-filter">
				<input type="checkbox" bind:checked={includeUncertain} />
				Include uncertain affiliations
			</label>
		</div>
	{/if}
</div>

{#if dataset === 'collaborators'}
	<div class="affiliation-summary" role="status">
		{#if status === 'idle' || status === 'loading'}
			<p>Loading affiliations…</p>
		{:else if status === 'error'}
			<p>
				Affiliations could not be loaded. The {locationLabel.toLowerCase()} map remains available.
			</p>
			<button type="button" class="retry-affiliations" onclick={retry}>Try again</button>
		{:else}
			<p>
				{collaborators.mappedPeople} of {collaborators.totalPeople} collaborators mapped at
				{collaborators.locations.length}
				{collaborators.locations.length === 1 ? 'institution' : 'institutions'}.
				{#if collaborators.uncertainPeople > 0}
					{collaborators.uncertainPeople}
					{collaborators.uncertainPeople === 1
						? 'collaborator has an uncertain affiliation.'
						: 'collaborators have uncertain affiliations.'}
				{/if}
			</p>
		{/if}
		<p>
			Each affiliation is the one held in the year of the shared work. Each marker is an
			institution’s campus, never a person’s location; its size counts distinct collaborators there.
			Dashed markers include uncertain affiliations.
		</p>
	</div>
{/if}

<!-- Keep one map mounted as datasets and filters change, including empty results.
     VizChartCard and the page's map import retain the existing inView gates. -->
<VizChartCard variant="map" height="500px">
	{@render children()}
	{#snippet table()}
		{#if dataset === 'locations'}
			<VizDataTable
				rows={countryRows}
				keyLabel="Country"
				valueLabel={itemLabel}
				caption="{locationLabel} by country."
			/>
		{:else if status === 'ready'}
			<div class="chart-table-scroll">
				<table>
					<caption class="sr-only">Collaborator affiliations and shared works.</caption>
					<thead>
						<tr>
							<th scope="col">Institution</th>
							<th scope="col">Collaborator</th>
							<th scope="col">Shared works</th>
						</tr>
					</thead>
					<tbody>
						{#each collaborators.locations as location (location.id)}
							{#each location.collaborators ?? [] as person (person.id)}
								<tr>
									<td>
										{location.label}<span class="record-detail">{location.country}</span>
									</td>
									<th scope="row">
										{person.name}
										{#if person.confidence === 'uncertain'}
											<span class="uncertain">Uncertain affiliation</span>
										{/if}
									</th>
									<td>
										<ul class="work-list">
											{#each person.items as item (item.id)}
												<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- base-aware data-driven record route -->
												<li><a href={locationItemHref(item, base, basePath)}>{item.title}</a></li>
											{/each}
										</ul>
									</td>
								</tr>
							{/each}
						{/each}
					</tbody>
				</table>
				{#if collaborators.locations.length === 0}
					<p>No mapped affiliations match these filters.</p>
				{/if}
			</div>
		{:else}
			<p>
				{status === 'error' ? 'Affiliations could not be loaded.' : 'Loading affiliations…'}
			</p>
		{/if}
	{/snippet}
</VizChartCard>

{#if dataset === 'collaborators' && status === 'ready' && collaborators.unresolved.length > 0}
	<details class="chart-table unresolved-affiliations">
		<summary class="dateline">Affiliations not shown ({collaborators.unresolved.length})</summary>
		<p>
			These collaborators have no mapped affiliation for the shared work, or are hidden by the
			uncertainty filter.
		</p>
		<ul class="unresolved-list">
			{#each collaborators.unresolved as person (`${person.id}:${person.reason}`)}
				<li>
					<strong>{person.name}</strong>
					<p>{person.reason}</p>
					<ul class="work-list">
						{#each person.items as item (item.id)}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- base-aware data-driven record route -->
							<li><a href={locationItemHref(item, base, basePath)}>{item.title}</a></li>
						{/each}
					</ul>
				</li>
			{/each}
		</ul>
	</details>
{/if}

<style>
	.collaborator-controls,
	.affiliation-filters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-sm);
	}

	.collaborator-controls {
		margin-bottom: var(--space-md);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
	}

	.dataset-toggle {
		display: inline-flex;
		border: var(--border-width-thin) solid var(--color-border);
	}

	.dataset-toggle button {
		padding: var(--space-xs) var(--space-sm);
		border: 0;
		background: var(--color-surface-elevated);
		color: var(--color-text);
		font: inherit;
		cursor: pointer;
	}

	.dataset-toggle button + button {
		border-inline-start: var(--rule-hairline) solid var(--color-hairline);
	}

	.dataset-toggle button.active {
		background: var(--color-primary);
		color: var(--color-surface);
	}

	.dataset-toggle button:focus-visible,
	.retry-affiliations:focus-visible,
	select:focus-visible,
	input:focus-visible {
		outline: var(--border-width-medium) solid var(--color-border-focus);
		outline-offset: var(--border-width-medium);
	}

	select {
		padding: var(--space-xs);
		border: var(--border-width-thin) solid var(--color-border);
		background: var(--color-surface-elevated);
		color: var(--color-text);
		font: inherit;
	}

	.uncertainty-filter {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		cursor: pointer;
	}

	.affiliation-summary {
		margin-bottom: var(--space-md);
	}

	.affiliation-summary p,
	.unresolved-affiliations p {
		margin: var(--space-xs) 0;
	}

	.affiliation-summary p:first-child,
	.uncertain {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
	}

	.affiliation-summary p:last-child,
	.record-detail {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
	}

	.record-detail {
		display: block;
		margin-top: var(--space-2xs);
	}

	.uncertain {
		display: block;
		margin-top: var(--space-2xs);
		font-weight: var(--font-weight-bold);
	}

	.retry-affiliations {
		border: 0;
		padding: var(--space-xs) 0;
		background: transparent;
		color: var(--color-text);
		text-decoration: underline;
		cursor: pointer;
	}

	td,
	th {
		vertical-align: top;
	}

	.work-list,
	.unresolved-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.work-list li + li {
		margin-top: var(--space-xs);
	}

	.unresolved-list > li {
		padding-block: var(--space-sm);
		border-top: var(--rule-hairline) solid var(--color-hairline);
	}

	@media (--touch) {
		.dataset-toggle button,
		.retry-affiliations,
		select,
		.uncertainty-filter {
			min-height: var(--space-11);
		}
	}

	@media print {
		.collaborator-controls {
			display: none;
		}
	}
</style>
