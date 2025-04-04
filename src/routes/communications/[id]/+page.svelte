<script lang="ts">
    import { allCommunications } from '$lib/data/communications/index';
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths';
    import type { Communication } from '$lib/types/communication';
    import MapVisualization from '$lib/components/communications/MapVisualization.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    
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
            backLinkHref="communications"
            backLinkLabel="← Back to Communications"
            date={communication.date}
            typeBadgeText={getTypeBadgeText(communication.type || '')}
            authors={communication.authors}
            tags={communication.tags}
        />
        
        {#if communication.heroImage?.src}
            <figure class="mb-6">
                <img 
                    src="{base}/{communication.heroImage.src}" 
                    alt="{communication.heroImage.alt || communication.title}"
                    class="w-full h-auto rounded-md"
                >
                {#if communication.heroImage.caption}
                    <figcaption class="text-text-muted text-sm mt-2 italic">
                        {communication.heroImage.caption}
                    </figcaption>
                {/if}
            </figure>
        {:else if communication.image}
            <img 
                src="{base}/{communication.image}" 
                alt="{communication.title}"
                class="mb-6 w-full max-w-md h-auto rounded-md mx-auto"
            >
        {/if}
        
        {#if communication.abstract}
            <section class="mb-6">
                <h2 class="text-xl font-semibold mb-2">Abstract</h2>
                <div class="text-text">{communication.abstract}</div>
            </section>
        {/if}
        
        <section class="communication-details grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <!-- Common details for all communication types -->
            {#if communication.conference}
                <div>
                    <strong>Event:</strong> {communication.conference}
                </div>
            {/if}
            
            {#if communication.type === 'conference' && communication.panelTitle}
                <div>
                    <strong>Panel:</strong> {communication.panelTitle}
                </div>
            {/if}
            
            {#if communication.location}
                <div>
                    <strong>Location:</strong> {communication.location}
                </div>
            {/if}
            
            {#if communication.country}
                <div>
                    <strong>Country:</strong> {communication.country}
                </div>
            {/if}
            
            {#if communication.language}
                <div>
                    <strong>Language:</strong> {communication.language}
                </div>
            {/if}
            
            {#if communication.year}
                <div>
                    <strong>Year:</strong> {communication.year}
                </div>
            {/if}
        </section>
        
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
        
        {#if communication.tags && communication.tags.length > 0}
            <section class="mb-6">
                <h2 class="text-lg font-semibold mb-2">Tags</h2>
                <div class="flex flex-wrap gap-2">
                    {#each communication.tags as tag}
                        <a href="{base}/communications?tag={encodeURIComponent(tag)}" class="tag-link text-sm px-3 py-1 rounded-full">
                            {tag}
                        </a>
                    {/each}
                </div>
            </section>
        {/if}
        
        {#if communication.coordinates}
            <section class="mb-6">
                <h2 class="text-lg font-semibold mb-2">Location</h2>
                <div class="map-container-wrapper rounded-md overflow-hidden shadow-sm">
                     <MapVisualization markersData={singleMarkerData} />
                </div>
            </section>
        {/if}
        
        <section class="communication-links">
            {#if communication.url}
                <div class="mb-2">
                    <a href="{communication.url}" target="_blank" rel="noopener" class="btn btn-primary">
                        Access Presentation
                    </a>
                </div>
            {/if}
            
            {#if communication.additionalUrls && communication.additionalUrls.length > 0}
                <div class="flex flex-wrap gap-2">
                    {#each communication.additionalUrls as link}
                        <a href="{link.url}" target="_blank" rel="noopener" class="btn btn-outline">
                            {link.label}
                        </a>
                    {/each}
                </div>
            {/if}
        </section>
    </article>
    
    <!-- Related communications by same type -->
    <section class="mt-8">
        <h2 class="text-xl font-semibold mb-4">More {communication.type === 'panel' ? 'Panels' : communication.type === 'conference' ? 'Conference Papers' : 'Presentations'}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each allCommunications.filter(c => c.type === communication.type && c.id !== communication.id).slice(0, 3) as relatedComm}
                <a href="{base}/communications/{relatedComm.id}" class="related-item rounded-lg p-4 transition-shadow">
                    <div class="related-date text-sm mb-1">{relatedComm.date}</div>
                    <h3 class="font-medium text-primary">{relatedComm.title}</h3>
                    <div class="related-authors text-sm mt-1">{relatedComm.authors?.join(', ')}</div>
                </a>
            {/each}
        </div>
    </section>
</div>

<style>
    .communication-details > div {
        padding: 0.5rem;
        border-bottom: 1px solid var(--color-border);
    }
    
    .communication-details strong {
        color: var(--color-text-light);
        font-weight: 600;
        margin-right: 0.5rem;
    }
    
    .btn {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: var(--border-radius-md);
        font-weight: 600;
        text-decoration: none;
        text-align: center;
        transition: all 0.2s ease;
    }
    
    .btn-primary {
        background-color: var(--color-primary);
        color: white;
    }
    
    .btn-primary:hover {
        background-color: var(--color-primary-dark);
    }
    
    .btn-outline {
        border: 1px solid var(--color-border);
        color: var(--color-text);
    }
    
    .btn-outline:hover {
        background-color: var(--color-border);
    }

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

    /* Theme styles for tags */
    .tag-link {
        background-color: var(--color-border);
        color: var(--color-text-light);
        transition: background-color 0.2s ease, color 0.2s ease;
    }
    .tag-link:hover {
        background-color: var(--color-primary);
        color: var(--color-background);
    }

    /* Theme styles for related items */
    .related-item {
        background-color: var(--color-background);
        box-shadow: var(--shadow-sm);
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }
    .related-item:hover {
        box-shadow: var(--shadow-md);
    }
    .related-date,
    .related-authors {
        color: var(--color-text-light);
    }

    /* Theme style for image caption */
    .communication-article figcaption {
        color: var(--color-text-light);
    }
</style> 