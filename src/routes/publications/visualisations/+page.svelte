<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    import { allPublications } from '$lib/data/publications'; // Assuming this is where your publication data is
    import { onMount } from 'svelte';
    import D3BarChart from '$lib/components/visualisations/D3BarChart.svelte';

    type CitationYearData = { year: number; count: number };

    let citationsPerYearData = $state<CitationYearData[]>([]);
    let citedAuthorsData: { author: string; count: number }[] = $state([]);

    // Calculate total citations reactively
    const totalCitations = $derived(
        citationsPerYearData.reduce((sum, item) => sum + item.count, 0)
    );

    onMount(() => {
        // Process allPublications to derive data for visualizations
        const yearlyCounts: Record<number, number> = {};
        allPublications.forEach(pub => {
            if (pub.citedBy && pub.citedBy.length > 0) {
                yearlyCounts[pub.year] = (yearlyCounts[pub.year] || 0) + pub.citedBy.length;
            }
        });
        citationsPerYearData = Object.entries(yearlyCounts)
            .map(([year, count]) => ({ year: parseInt(year), count }))
            .sort((a, b) => a.year - b.year);

        const authorCounts: Record<string, number> = {};
        allPublications.forEach(pub => {
            if (pub.citedBy) {
                pub.citedBy.forEach((citation: any) => { 
                    if (citation.authors && Array.isArray(citation.authors)) {
                        citation.authors.forEach((author: string) => {
                            authorCounts[author] = (authorCounts[author] || 0) + 1;
                        });
                    }
                });
            }
        });
        citedAuthorsData = Object.entries(authorCounts)
            .map(([author, count]) => ({ author, count }))
            .sort((a, b) => b.count - a.count); 
    });

    // Accessor functions for the D3BarChart
    const getYear = (d: CitationYearData) => d.year;
    const getCitationCount = (d: CitationYearData) => d.count;

</script>

<SEO
    title="Publication Visualisations | Frédérick Madore"
    description="Visualisations of publication data, including citation trends and cited authors."
    keywords="publications, visualisations, citations, research analytics, Frédérick Madore"
/>

<div class="page-container max-w-7xl">
    <PageHeader title="Publication Visualisations" />

    <p class="text-xl mb-10">
        This page presents various visualisations of my publication data, offering insights into citation trends, authorship patterns, and more.
    </p>

    <section class="visualization-section mb-12">
        <h2 class="text-2xl font-semibold mb-6">
            Citations Per Year
            {#if citationsPerYearData.length > 0 && totalCitations > 0}
                (Total: {totalCitations})
            {/if}
        </h2>
        {#if citationsPerYearData.length > 0}
            <div class="chart-wrapper p-6 rounded-lg shadow-md">
                 <D3BarChart
                    data={citationsPerYearData}
                    xAccessor={getYear}
                    yAccessor={getCitationCount}
                    xAxisLabel="Year"
                    yAxisLabel="Number of Citations"
                    barColor="var(--color-accent)" 
                />
            </div>
        {:else}
            <div class="placeholder-message p-6 rounded-lg shadow-md text-center">
                 <p class="text-light">No citation data available to display for this visualization, or data is still loading.</p>
            </div>
        {/if}
    </section>

    <section class="visualization-section">
        <h2 class="text-2xl font-semibold mb-6">Authors Citing My Work Most Frequently</h2>
        {#if citedAuthorsData.length > 0}
            <div class="list-display p-6 rounded-lg shadow-md">
                 <p class="text-lg font-medium mb-2">Authors Who Have Most Frequently Cited My Publications</p>
                <ul>
                    {#each citedAuthorsData.slice(0, 15) as item} <!-- Display top 15 for brevity -->
                        <li>{item.author}: {item.count} citation(s) of my work(s)</li>
                    {/each}
                </ul>
            </div>
        {:else}
             <div class="placeholder-message p-6 rounded-lg shadow-md text-center">
                <p class="text-light">No cited author data available to display for this visualization.</p>
            </div>
        {/if}
    </section>

</div>

<style>
    .page-container {
        /* max-width is handled by the .max-w-7xl utility class */
        margin: 0 auto;
        padding: var(--spacing-8) var(--spacing-4);
    }

    .chart-wrapper,
    .list-display,
    .placeholder-message {
        background-color: var(--color-sidebar-bg); /* Adapts to dark mode */
        color: var(--color-text); /* Ensures text is readable in both modes */
        /* Other utilities like p-6, rounded-lg, shadow-md are applied via classes in the HTML */
    }

    .chart-wrapper {
        border: 1px solid var(--color-border); /* Uses theme border color */
        min-height: 350px; 
        position: relative;
    }

    .list-display ul {
        list-style-type: disc;
        padding-left: var(--spacing-5); /* Standard spacing */
    }

    .list-display li {
        margin-bottom: var(--spacing-2); /* Standard spacing */
    }

    .placeholder-message {
        min-height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        /* text-center is applied as a class in the HTML */
    }

    /* Removed local definitions for .text-xl, .text-2xl, .font-semibold, .mb-10, .mb-12, 
       .mb-6, .p-6, .bg-white, .rounded-lg, .shadow-md, .text-gray-600 as these 
       should be handled by global utility classes applied in the HTML. 
       The text color within .placeholder-message <p> tags is now handled by .text-light class.
    */
</style> 