<script lang="ts">
    import { onMount } from 'svelte';
    import { allPublications } from './data/publications/index';
    import type { Publication } from '$lib/types';
    import { base } from '$app/paths';
    
    // Props - project name and limit
    export let projectName: string;
    export let limit = 5;
    export let showTypeFilters = true;
    
    // Local publications array
    let publicationList: Publication[] = [];
    
    // Filter publications by project name
    $: publicationList = allPublications
        .filter(pub => pub.project === projectName)
        .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
        .slice(0, limit);
    
    // Get unique publication types for the type filter
    $: publicationTypes = [...new Set(publicationList.map(pub => pub.type))].sort();
    
    // Format publication type for display
    function formatType(type: string): string {
        const typeMap: Record<string, string> = {
            'article': 'Journal Article',
            'book': 'Book',
            'chapter': 'Book Chapter',
            'special-issue': 'Special Issue',
            'report': 'Report',
            'encyclopedia': 'Encyclopedia Entry',
            'blogpost': 'Blog Post',
            'dissertation': 'Dissertation'
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

<div class="relevant-publications card">
    <h2 class="card-title">Relevant Publications</h2>
    
    {#if publicationList.length === 0}
        <p class="no-publications">No publications found for this project.</p>
    {:else}
        <ul class="publication-list">
            {#each publicationList as publication}
                <li class="publication-item">
                    <div class="publication-meta">
                        <span class="publication-type">{formatType(publication.type)}</span>
                        <span class="publication-date">{publication.date}</span>
                    </div>
                    <a href="{base}/publications/{publication.id}" class="publication-title">
                        {publication.title}
                    </a>
                    <div class="publication-authors">
                        {formatAuthors(publication.authors)}
                    </div>
                    {#if publication.abstract}
                        <div class="publication-abstract">
                            {publication.abstract.length > 120 ? publication.abstract.substring(0, 120) + '...' : publication.abstract}
                        </div>
                    {/if}
                </li>
            {/each}
        </ul>
        
        {#if showTypeFilters && publicationTypes.length > 1}
            <div class="type-filters mt-4">
                <span class="text-sm text-gray-600">Browse by type:</span>
                <div class="flex flex-wrap gap-2 mt-2">
                    {#each publicationTypes as type}
                        <a href="{base}/publications?type={type}" class="type-tag">
                            {formatType(type)}
                        </a>
                    {/each}
                </div>
            </div>
        {/if}
        
        <div class="mt-4 text-right">
            <a href="{base}/publications?project={encodeURIComponent(projectName)}" class="view-all">View all publications</a>
        </div>
    {/if}
</div>

<style>
    .relevant-publications {
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
    
    .publication-list {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }
    
    .publication-item {
        margin-bottom: var(--spacing-4);
        padding-bottom: var(--spacing-4);
        border-bottom: 1px solid var(--color-border);
    }
    
    .publication-item:last-child {
        border-bottom: none;
    }
    
    .publication-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--spacing-1);
    }
    
    .publication-type {
        font-size: var(--font-size-xs);
        text-transform: uppercase;
        font-weight: 600;
        color: var(--color-primary);
        background-color: var(--color-border);
        padding: 0.1rem 0.5rem;
        border-radius: var(--border-radius-sm);
    }
    
    .publication-date {
        font-size: var(--font-size-sm);
        color: var(--color-text-light);
    }
    
    .publication-title {
        font-weight: 600;
        color: var(--color-text);
        text-decoration: none;
        display: block;
        line-height: 1.4;
        margin-bottom: var(--spacing-1);
    }
    
    .publication-title:hover {
        color: var(--color-primary);
    }
    
    .publication-authors {
        font-size: var(--font-size-sm);
        color: var(--color-text-light);
        font-style: italic;
        margin-bottom: var(--spacing-1);
    }
    
    .publication-abstract {
        font-size: var(--font-size-sm);
        margin-top: var(--spacing-1);
        color: var(--color-text-light);
        line-height: 1.5;
    }
    
    .no-publications {
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