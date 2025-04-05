<script lang="ts">
    import { onMount } from 'svelte';
    import { allCommunications } from './data/communications/index';
    import type { Communication } from '$lib/types/communication';
    import { base } from '$app/paths';
    
    // Props - project name and limit
    export let projectName: string;
    export let limit = 5;
    export let showTypeFilters = true;
    
    // Local communications array
    let communicationList: Communication[] = [];
    
    // Filter communications by project name
    $: communicationList = allCommunications
        .filter(comm => comm.project === projectName)
        .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
        .slice(0, limit);
    
    // Get unique communication types for the type filter
    $: communicationTypes = [...new Set(communicationList.map(comm => comm.type).filter(Boolean))].sort() as string[];
    
    // Format communication type for display
    function formatType(type: string): string {
        const typeMap: Record<string, string> = {
            'conference': 'Conference Paper',
            'workshop': 'Workshop',
            'seminar': 'Seminar',
            'lecture': 'Lecture',
            'panel': 'Panel',
            'event': 'Academic Event'
        };
        
        return typeMap[type] || type;
    }
    
    // Format authors for display
    function formatAuthors(authors: string[]): string {
        if (!authors || authors.length === 0) return '';
        
        if (authors.length === 1) return authors[0];
        
        if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
        
        return `${authors[0]} et al.`;
    }
</script>

<div class="relevant-communications card">
    <h2 class="card-title">Relevant Communications</h2>
    
    {#if communicationList.length === 0}
        <p class="no-communications">No communications found for this project.</p>
    {:else}
        <ul class="communication-list">
            {#each communicationList as communication}
                <li class="communication-item">
                    <div class="communication-meta">
                        <span class="communication-type">{communication.type ? formatType(communication.type) : 'Communication'}</span>
                        <span class="communication-date">{communication.date}</span>
                    </div>
                    <a href="{base}/communications/{communication.id}" class="communication-title">
                        {communication.title}
                    </a>
                    <div class="communication-authors">
                        {formatAuthors(communication.authors)}
                    </div>
                    {#if communication.abstract}
                        <div class="communication-abstract">
                            {communication.abstract.length > 120 ? communication.abstract.substring(0, 120) + '...' : communication.abstract}
                        </div>
                    {/if}
                </li>
            {/each}
        </ul>
        
        {#if showTypeFilters && communicationTypes.length > 1}
            <div class="type-filters mt-4">
                <span class="text-sm text-light">Browse by type:</span>
                <div class="flex flex-wrap gap-2 mt-2">
                    {#each communicationTypes as type}
                        <a href="{base}/communications?type={type}" class="type-tag">
                            {formatType(type)}
                        </a>
                    {/each}
                </div>
            </div>
        {/if}
        
        <div class="mt-4 text-right">
            <a href="{base}/communications?project={encodeURIComponent(projectName)}" class="view-all">View all communications</a>
        </div>
    {/if}
</div>

<style>
    .relevant-communications {
        background-color: var(--color-background);
        border-radius: var(--border-radius-md);
        box-shadow: var(--shadow-sm);
        padding: var(--spacing-4);
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }
    
    .card-title {
        font-size: var(--font-size-xl);
        font-weight: 700;
        margin-bottom: var(--spacing-4);
        color: var(--color-primary);
        border-bottom: 1px solid var(--color-border);
        padding-bottom: var(--spacing-2);
    }
    
    .communication-list {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }
    
    .communication-item {
        margin-bottom: var(--spacing-4);
        padding-bottom: var(--spacing-4);
        border-bottom: 1px solid var(--color-border);
    }
    
    .communication-item:last-child {
        border-bottom: none;
    }
    
    .communication-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--spacing-1);
    }
    
    .communication-type {
        font-size: var(--font-size-xs);
        text-transform: uppercase;
        font-weight: 600;
        color: var(--color-primary);
        background-color: var(--color-border);
        padding: 0.1rem 0.5rem;
        border-radius: var(--border-radius-sm);
    }
    
    .communication-date {
        font-size: var(--font-size-sm);
        color: var(--color-text-light);
    }
    
    .communication-title {
        font-weight: 600;
        color: var(--color-text);
        text-decoration: none;
        display: block;
        line-height: 1.4;
        margin-bottom: var(--spacing-1);
    }
    
    .communication-title:hover {
        color: var(--color-primary);
    }
    
    .communication-authors {
        font-size: var(--font-size-sm);
        color: var(--color-text-light);
        font-style: italic;
        margin-bottom: var(--spacing-1);
    }
    
    .communication-abstract {
        font-size: var(--font-size-sm);
        margin-top: var(--spacing-1);
        color: var(--color-text-light);
        line-height: 1.5;
    }
    
    .no-communications {
        font-style: italic;
        color: var(--color-text-light);
        text-align: center;
        padding: var(--spacing-4) 0;
    }
    
    .type-tag {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background-color: var(--color-border);
        color: var(--color-text);
        border-radius: var(--border-radius-full);
        font-size: var(--font-size-sm);
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .type-tag:hover {
        background-color: var(--color-primary);
        color: var(--color-background);
    }
    
    .view-all {
        color: var(--color-primary);
        font-weight: 600;
        text-decoration: none;
        font-size: var(--font-size-sm);
    }
    
    .view-all:hover {
        text-decoration: underline;
    }
</style> 