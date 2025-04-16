<script lang="ts">
    import { onMount } from 'svelte';
    import { allCommunications } from '../../data/communications/index';
    import type { Communication } from '$lib/types/communication';
    import RelevantItemsList from '$lib/components/organisms/RelevantItemsList.svelte';
    import type { RelevantItem } from '$lib/components/organisms/RelevantItemsList.svelte';

    // Props - project name and limit
    export let projectName: string;
    export let limit = 5;

    // Local communications array - cast to RelevantItem[]
    let communicationList: RelevantItem[] = [];

    // Filter communications by project name
    $: communicationList = allCommunications
        .filter(comm => comm.project === projectName)
        .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
        .slice(0, limit) as RelevantItem[]; // Cast to the generic type

    // Get unique communication types for the type filter
    $: communicationTypes = [...new Set(communicationList.map(comm => comm.type).filter(Boolean))].sort() as string[];

    // Add state for selected type filter
    let selectedType: string | null = null;

    // Compute filtered list based on selected type
    $: filteredList = selectedType
        ? communicationList.filter(comm => comm.type === selectedType)
        : communicationList;

    // Handler for type filter button
    function selectType(type: string) {
        selectedType = selectedType === type ? null : type;
    }

    // Format communication type for display
    function formatCommunicationType(type: string): string {
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

    // Format authors for display (can be reused or moved to utils later)
    function formatAuthors(authors: string[]): string {
        if (!authors || authors.length === 0) return '';
        if (authors.length === 1) return authors[0];
        if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
        return `${authors[0]} et al.`;
    }
</script>

<RelevantItemsList
    title="Relevant Communications"
    items={filteredList}
    itemTypePlural="communications"
    basePath="/conference-activity"
    formatType={formatCommunicationType}
    {formatAuthors}
/>

{#if communicationTypes.length > 1}
    <div class="type-filter-container" style="margin-top: var(--spacing-4);">
        <span class="text-sm text-light" style="margin-right: var(--spacing-2);">Browse by type:</span>
        {#each communicationTypes as type}
            <button
                class="type-filter-btn{selectedType === type ? ' active' : ''}"
                type="button"
                on:click={() => selectType(type)}
                aria-pressed={selectedType === type}
            >
                {formatCommunicationType(type)}
            </button>
        {/each}
    </div>
{/if}

<style>
/* Style for type filter pill buttons (to match .year-tag in LatestActivities) */
.type-filter-container {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-2);
    margin-top: var(--spacing-2);
}
.type-filter-btn {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background-color: var(--color-border);
    color: var(--color-text);
    border-radius: 9999px;
    font-size: var(--font-size-sm);
    font-weight: 600;
    transition: all 0.2s ease;
    box-shadow: 0 1px 4px 0 rgba(26,54,93,0.06);
    border: 1px solid var(--color-border);
    cursor: pointer;
    text-decoration: none;
}
.type-filter-btn:hover,
.type-filter-btn.active {
    background-color: var(--color-primary);
    color: #fff;
    border-color: var(--color-primary);
    box-shadow: 0 2px 8px 0 rgba(26,54,93,0.12);
}
</style>