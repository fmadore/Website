<script lang="ts">
	import EChartsBarChart from './EChartsBarChart.svelte';
	import EChartsHorizontalBarChart from './EChartsHorizontalBarChart.svelte';
	import VizSection from './VizSection.svelte';
	import VizChartCard from './VizChartCard.svelte';
	import VizDataTable from './VizDataTable.svelte';
	import Pagination from '#lib/components/molecules/Pagination.svelte';
	import { usePagination } from '#lib/utils/pagination.svelte.ts';
	import { BUILT_AT } from '#lib/utils/buildDate.ts';
	type YearCount = { year: number; count: number };
	type AuthorCount = { author: string; count: number };
	type Section = { id: string; no: string; title: string; count: string };
	let {
		years,
		authors,
		yearSection,
		authorSection
	}: {
		years: YearCount[];
		authors: AuthorCount[];
		yearSection: Section;
		authorSection: Section;
	} = $props();
	const perPage = 15;
	const pagination = usePagination(() => authors, perPage);
	const pagedAuthors = $derived(pagination.items);
	const maxCitationCount = $derived(Math.max(0, ...authors.map((row) => row.count)));
	// Pine marks the current year — the build's, never simply the last row,
	// which can be a forthcoming year. Later years are drawn in outline.
	const buildYear = BUILT_AT.getUTCFullYear();
	const currentCitationYear = $derived(
		years.some((row) => row.year === buildYear) ? buildYear : undefined
	);
	const citationsTableRows = $derived(
		years.map((row) => ({
			label: row.year > buildYear ? `${row.year} (forthcoming)` : String(row.year),
			value: row.count
		}))
	);
	const getYear = (row: YearCount) => row.year;
	const getCitationCount = (row: YearCount) => row.count;
	const getAuthorName = (row: AuthorCount) => row.author;
	const getAuthorCitationCount = (row: AuthorCount) => row.count;
</script>

<VizSection
	{...yearSection}
	description="Citations counted in the year the citing work appeared. They are swept from OpenAlex and from full-text searches of Google Books, HAL and Wikipedia, then recorded against the work cited, so this counts what the record holds rather than what an index estimates. The current year is marked; a later year, cited by forthcoming work, is drawn in outline."
	height="400px"
	hasData={years.length > 0}
	empty="No citations recorded."
>
	<EChartsBarChart
		data={years}
		xAccessor={getYear}
		yAccessor={getCitationCount}
		accentKey={currentCitationYear}
		forthcomingAfter={buildYear}
		measure="Citations per year"
		itemSingular="citation"
		itemPlural="citations"
	/>
	{#snippet table()}
		<VizDataTable
			rows={citationsTableRows}
			keyLabel="Year"
			valueLabel="Citations"
			caption="Recorded citations counted in the year the citing work appeared."
		/>
	{/snippet}
</VizSection>

<!-- Paginated: the chart is followed by the pager, so this section composes
	     VizChartCard itself rather than delegating. The `{#key}` sits INSIDE the
	     card, not around it: re-creating the card on every page turn would also
	     re-create its `use:inView` gate, and the reader would see "Loading
	     chart…" flash between two instant states. This way the plate is gated
	     once, on the way down the page, and the pager only redraws the chart. -->
<VizSection
	{...authorSection}
	description="The authors who cite the work most often, from the same recorded citations. The scale is fixed across pages so bars stay comparable."
>
	{#if authors.length > 0}
		<VizChartCard height="{Math.max(350, pagedAuthors.length * 35 + 70)}px">
			{#key pagination.page}
				<EChartsHorizontalBarChart
					data={pagedAuthors}
					xAccessor={getAuthorCitationCount}
					yAccessor={getAuthorName}
					measure="Citations per author"
					maxValue={maxCitationCount}
					itemSingular="author"
					itemPlural="authors"
					descriptionLead="Most citations"
				/>
			{/key}
			{#snippet table()}
				<VizDataTable
					rows={pagedAuthors.map((d) => ({ label: d.author, value: d.count }))}
					keyLabel="Author"
					valueLabel="Citations"
					caption="The authors on this page of the chart, with the number of times each cites the record."
				/>
			{/snippet}
		</VizChartCard>

		<Pagination
			page={pagination.page}
			{perPage}
			total={authors.length}
			onchange={(p) => (pagination.page = p)}
		/>
	{:else}
		<VizChartCard hasData={false}>
			{#snippet placeholder()}
				<div class="viz-empty">
					<span class="dateline">No data</span>
					<p>No citing authors recorded.</p>
				</div>
			{/snippet}
		</VizChartCard>
	{/if}
</VizSection>
