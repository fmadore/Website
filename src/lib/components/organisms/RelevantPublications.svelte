<script lang="ts">
    import { onMount } from 'svelte';
    import { allPublications } from '../../data/publications/index';
    import type { Publication } from '$lib/types';
    import RelevantItemsList from '$lib/components/organisms/RelevantItemsList.svelte';
    import type { RelevantItem } from '$lib/components/organisms/RelevantItemsList.svelte';

    // Props - project name and limit
    export let projectName: string;
    export let limit = 5;
    export let showTypeFilters = true;

    // Local publications array - cast to RelevantItem[] for the organism
    let publicationList: RelevantItem[] = [];

    // Filter publications by project name
    $: publicationList = allPublications
        .filter(pub => pub.project === projectName)
        .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
        .slice(0, limit) as RelevantItem[];

    // Get unique publication types for the type filter
    $: publicationTypes = [...new Set(publicationList.map(pub => pub.type).filter(Boolean))].sort() as string[];

    // Add state for selected type filter
    let selectedType: string | null = null;

    // Compute filtered list based on selected type
    $: filteredList = selectedType
        ? publicationList.filter(pub => pub.type === selectedType)
        : publicationList;

    // Handler for type filter button
    function selectType(type: string) {
        selectedType = selectedType === type ? null : type;
    }

    // Format publication type for display
    function formatPublicationType(type: string): string {
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

    // Format authors for display (can be reused or moved to utils later)
    function formatAuthors(authors: string[]): string {
        if (!authors || authors.length === 0) return '';
        if (authors.length === 1) return authors[0];
        if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
        return `${authors[0]} et al.`;
    }
</script>

<div class="relevant-publications mb-4">
    {#if showTypeFilters && publicationTypes.length > 1}
        <div class="flex flex-wrap gap-2 mb-6">
            {#each publicationTypes as type}
                <button
                    class="filter-button {selectedType === type ? 'active' : ''}"
                    on:click={() => selectType(type)}
                    type="button"
                >
                    {formatPublicationType(type)}
                </button>
            {/each}
        </div>
    {/if}
    <RelevantItemsList
        title="Relevant Publications"
        items={filteredList}
        itemTypePlural="publications"
        basePath="/publications"
        formatType={formatPublicationType}
        {formatAuthors}
    />
</div>

<!-- Removed component-scoped <style> block, using utility classes and .filter-button from global CSS -->