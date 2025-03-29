<script lang="ts">
    import type { Communication } from '$lib/types/communication';
    import { toggleTagFilter, toggleCountryFilter } from '$lib/data/communications/filters';
    
    export let communication: Communication;
    
    // Human-readable labels for communication types
    const typeLabels: {[key: string]: string} = {
        'conference': 'Conference',
        'workshop': 'Workshop',
        'seminar': 'Seminar',
        'lecture': 'Lecture',
        'panel': 'Panel',
        'event': 'Academic Event'
    };
</script>

<li class="card p-4 mb-4 hover-shadow">
    <div class="grid md:grid-cols-1 gap-4">
        {#if communication?.image}
            <div class="col-span-1">
                <img 
                    src={communication.image} 
                    alt={communication.title} 
                    class="communication-image"
                />
            </div>
        {/if}
        
        <div class="col-span-1">
            <div class="mb-2">
                <span class="text-primary text-sm">{typeLabels[communication?.type || 'conference'] || communication?.type || 'Conference'}</span>
                {#if communication?.language && communication.language !== 'English'}
                    <span class="text-light text-sm ml-2">({communication.language})</span>
                {/if}
            </div>
            
            <h3 class="text-dark font-weight-500 mb-2">
                {#if communication?.url}
                    <a href={communication.url} target="_blank" rel="noopener noreferrer" class="hover:text-primary">
                        {communication?.title || 'Untitled Communication'}
                    </a>
                {:else}
                    {communication?.title || 'Untitled Communication'}
                {/if}
            </h3>
            
            <div class="communication-details text-light mb-2">
                <!-- Authors -->
                {#if communication?.authors && communication.authors.length > 0}
                    <div>
                        {communication.authors.join(' and ')}
                    </div>
                {/if}
                
                <!-- Conference details -->
                <div>
                    <span>{communication?.conference || 'Unknown Conference'}</span>
                    {#if communication?.location}
                        <span>, {communication.location}</span>
                    {/if}
                    {#if communication?.country}
                        <button class="country-btn" on:click={() => toggleCountryFilter(communication.country)}>
                            <span>, {communication.country}</span>
                        </button>
                    {/if}
                    {#if communication?.date}
                        <span>, {communication.date}</span>
                    {/if}
                </div>
            </div>
            
            {#if communication?.abstract}
                <div class="text-light text-sm mb-4">
                    {communication.abstract}
                </div>
            {/if}
            
            {#if communication?.tags && communication.tags.length > 0}
                <div class="mt-3 flex flex-wrap gap-2">
                    {#each communication.tags as tag}
                        <button 
                            class="btn-sm bg-gray-100 hover:bg-gray-200 rounded-full border-0 text-sm"
                            on:click={() => toggleTagFilter(tag)}
                        >
                            {tag}
                        </button>
                    {/each}
                </div>
            {/if}
            
            {#if communication?.additionalUrls && communication.additionalUrls.length > 0}
                <div class="mt-3">
                    {#each communication.additionalUrls as url, i}
                        <a 
                            href={url.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            class="btn-sm btn-outline-primary mr-2"
                        >
                            {url.label || `Link ${i+1}`}
                        </a>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</li>

<style>
    .country-btn {
        background: none;
        border: none;
        padding: 0;
        font-size: inherit;
        font-family: inherit;
        color: inherit;
        text-decoration: underline;
        cursor: pointer;
        display: inline;
    }
    
    .country-btn:hover {
        color: var(--color-primary);
    }
    
    .hover-shadow:hover {
        box-shadow: var(--shadow-md);
    }
    
    .font-weight-500 {
        font-weight: 500;
    }
    
    .text-sm {
        font-size: 0.875rem;
    }
    
    .ml-2 {
        margin-left: 0.5rem;
    }
    
    .communication-image {
        width: 100%;
        height: auto;
        border-radius: 4px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
</style> 