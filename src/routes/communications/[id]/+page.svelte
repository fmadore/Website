<script lang="ts">
    import { allCommunications } from '$lib/data/communications/index';
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths';
    import type { Communication } from '$lib/types/communication';
    import MapVisualization from '$lib/components/communications/MapVisualization.svelte';
    
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
    ogImage="{communication.image}"
/>

<div class="container mx-auto py-8 px-4">
    <a href="{base}/communications" class="text-primary hover:underline mb-4 inline-block">
        ← Back to Communications
    </a>
    
    <article class="bg-white rounded-lg shadow-md p-6 mb-8">
        <header class="mb-6">
            <div class="flex justify-between items-start mb-2">
                <div class="communication-type-badge">
                    {#if communication.type === 'conference'}
                        Conference Paper
                    {:else if communication.type === 'workshop'}
                        Workshop Presentation
                    {:else if communication.type === 'seminar'}
                        Seminar
                    {:else if communication.type === 'lecture'}
                        Lecture
                    {:else if communication.type === 'panel'}
                        Panel
                    {:else}
                        {communication.type}
                    {/if}
                </div>
                <div class="text-text-muted">{communication.date}</div>
            </div>
            
            <h1 class="text-2xl font-bold mb-2">{communication.title}</h1>
            
            <div class="text-lg mb-2">
                {#if communication.authors && communication.authors.length > 0}
                    {communication.authors.join(', ')}
                {/if}
            </div>
        </header>
        
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
                        <div class="panel-paper bg-gray-50 p-4 rounded-md">
                            <h3 class="font-semibold text-lg">{paper.title}</h3>
                            {#if paper.authors && paper.authors.length > 0}
                                <div class="text-sm text-text-secondary mt-1">
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
        
        {#if communication.type === 'panel' && communication.participants && communication.participants.length > 0}
            <section class="mb-6">
                <h2 class="text-xl font-semibold mb-3">Participants</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {#each communication.participants as participant}
                        <div class="panel-participant bg-gray-50 p-3 rounded-md">
                            <div class="font-medium">{participant.name}</div>
                            {#if participant.role}
                                <div class="text-sm text-text-secondary">
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
                        <a href="{base}/communications?tag={encodeURIComponent(tag)}" class="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-text-secondary">
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
                <a href="{base}/communications/{relatedComm.id}" class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                    <div class="text-sm text-text-muted mb-1">{relatedComm.date}</div>
                    <h3 class="font-medium text-primary">{relatedComm.title}</h3>
                    <div class="text-sm mt-1">{relatedComm.authors?.join(', ')}</div>
                </a>
            {/each}
        </div>
    </section>
</div>

<style>
    .communication-type-badge {
        display: inline-block;
        background-color: var(--color-primary-light);
        color: var(--color-primary-dark);
        font-size: var(--font-size-xs);
        font-weight: 600;
        text-transform: uppercase;
        padding: 0.25rem 0.75rem;
        border-radius: var(--border-radius-full);
    }
    
    .communication-details > div {
        padding: 0.5rem;
        border-bottom: 1px solid var(--color-border-light);
    }
    
    .communication-details strong {
        color: var(--color-text-secondary);
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
        background-color: var(--color-background-alt);
    }
</style> 