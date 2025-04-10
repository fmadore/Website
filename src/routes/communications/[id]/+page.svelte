<script lang="ts">
    import { allCommunications } from '$lib/data/communications/index';
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths';
    import type { Communication } from '$lib/types/communication';
    import type { ComponentType } from 'svelte';
    import MapVisualization from '$lib/components/communications/MapVisualization.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    import DetailsGrid from '$lib/components/molecules/DetailsGrid.svelte';
    import HeroImageDisplay from '$lib/components/molecules/HeroImageDisplay.svelte';
    import TagList from '$lib/components/molecules/TagList.svelte';
    import ActionLinks from '$lib/components/molecules/ActionLinks.svelte';
    import AbstractSection from '$lib/components/molecules/AbstractSection.svelte';
    import RelatedItemsList from '$lib/components/organisms/RelatedItemsList.svelte';
    import RelatedItemCard from '$lib/components/molecules/RelatedItemCard.svelte';
    
    // Get communication from the page data
    export let data;
    $: communication = data.communication as Communication;
    
    // Prepare marker data for the map (array with one item)
    $: singleMarkerData = communication.coordinates ? [{
        id: communication.id,
        title: communication.title,
        coordinates: communication.coordinates,
        year: communication.year
    }] : [];
    
    // Format date for display
    function formatDate(dateString: string): string {
        return dateString || '';
    }

    // Helper to get badge text
    function getTypeBadgeText(type: string): string {
        switch (type) {
            case 'conference': return 'Conference Paper';
            case 'workshop': return 'Workshop Presentation';
            case 'seminar': return 'Seminar';
            case 'lecture': return 'Lecture';
            case 'panel': return 'Panel';
            default: return type;
        }
    }

    // Prepare details for the DetailsGrid component
    $: communicationDetails = [
        { label: 'Event', value: communication.conference ?? '' },
        { label: 'Panel', value: communication.panelTitle ?? '', condition: communication.type === 'conference' && !!communication.panelTitle },
        { label: 'Location', value: communication.location ?? '' },
        { label: 'Country', value: communication.country ?? '' },
        { label: 'Language', value: communication.language ?? '' },
        { label: 'Year', value: String(communication.year ?? '') },
    ];
</script>

<SEO 
    title="{communication.title} | Communications | Frédérick Madore"
    description="{communication.abstract || `Details about ${communication.title} by ${communication.authors?.join(', ')}`}"
    keywords="{[
        'communication',
        communication.type,
        ...(communication.tags || []),
        ...(communication.authors || []),
        'Islam',
        'West Africa',
        'Frédérick Madore'
    ].join(', ')}"
    ogImage="{base}/{communication.image}"
/>

<div class="container mx-auto py-8 px-4">
    <article class="communication-article rounded-lg p-6 mb-8">
        <PageHeader 
            title={communication.title}
            backLinkHref="conference-activity"
            backLinkLabel="← Back to Conference Activity"
            date={communication.date}
            typeBadgeText={getTypeBadgeText(communication.type || '')}
            authors={communication.authors}
        />
        
        <!-- Use the new HeroImageDisplay component -->
        <HeroImageDisplay 
            heroImage={communication.heroImage} 
            fallbackImage={communication.image} 
            defaultAlt={communication.title}
            imageClass="w-full h-auto rounded-md" 
            figcaptionClass="text-text-muted text-sm mt-2 italic"
        />
        
        <!-- Use the new AbstractSection component -->
        <AbstractSection abstract={communication.abstract} />
        
        <!-- Use the new DetailsGrid component -->
        <DetailsGrid details={communicationDetails} />
        
        <!-- Panel-specific information -->
        {#if communication.type === 'panel' && communication.papers && communication.papers.length > 0}
            <section class="mb-6">
                <h2 class="text-xl font-semibold mb-3">Papers in this Panel</h2>
                <div class="space-y-4">
                    {#each communication.papers as paper, index}
                        <div class="panel-paper p-4 rounded-md">
                            <h3 class="font-semibold text-lg">{paper.title}</h3>
                            {#if paper.authors && paper.authors.length > 0}
                                <div class="text-sm text-text-secondary mt-1 panel-paper-authors">
                                    {paper.authors.join(', ')}
                                </div>
                            {/if}
                            {#if paper.abstract}
                                <div class="mt-2 text-sm">
                                    {paper.abstract}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </section>
        {/if}
        
        {#if communication.participants && communication.participants.length > 0}
            <section class="mb-6">
                <h2 class="text-xl font-semibold mb-3">Participants</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {#each communication.participants as participant}
                        <div class="panel-participant p-3 rounded-md">
                            <div class="font-medium">{participant.name}</div>
                            {#if participant.role}
                                <div class="text-sm text-text-secondary participant-role">
                                    {participant.role}
                                </div>
                            {/if}
                            {#if participant.affiliation}
                                <div class="text-xs text-text-muted mt-1">
                                    {participant.affiliation}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </section>
        {/if}
        
        <!-- Use the new TagList component -->
        <TagList tags={communication.tags} baseUrl="/conference-activity?tag=" />
        
        {#if communication.coordinates}
            <section class="mb-6">
                <h2 class="text-lg font-semibold mb-2">Location</h2>
                <div class="map-container-wrapper rounded-md overflow-hidden shadow-sm">
                     <MapVisualization markersData={singleMarkerData} />
                </div>
            </section>
        {/if}
        
        <!-- Use the new ActionLinks component -->
        <ActionLinks 
            primaryUrl={communication.url} 
            primaryLabel="Access Presentation" 
            additionalUrls={communication.additionalUrls} 
        />
    </article>
    
    <!-- Use the RelatedItemsList organism -->
    <RelatedItemsList
        allItems={allCommunications}
        currentItemId={communication.id}
        filterKey="type"
        filterValue={communication.type}
        title={`More ${communication.type === 'panel' ? 'Panels' : communication.type === 'conference' ? 'Conference Papers' : 'Presentations'}`}
        itemComponent={RelatedItemCard as unknown as ComponentType}
        baseItemUrl="/conference-activity/"
        maxItems={3}
    />
</div>

<style>
    /* Theme styles for main article container */
    .communication-article {
        background-color: var(--color-background);
        box-shadow: var(--shadow-md);
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }

    /* Theme styles for panel paper/participant divs */
    .panel-paper,
    .panel-participant {
        background-color: var(--color-border);
        transition: background-color 0.3s ease;
    }
    .panel-paper-authors,
    .participant-role {
        color: var(--color-text-light);
    }

    /* Related item styles are now in RelatedItemCard.svelte */
</style> 