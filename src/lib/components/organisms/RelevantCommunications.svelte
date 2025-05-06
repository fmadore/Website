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

<div class="item-panel">
    <RelevantItemsList
        title="Relevant Communications"
        items={filteredList}
        itemTypePlural="communications"
        basePath="/communications"
        viewAllPath="/conference-activity"
        formatType={formatCommunicationType}
        {formatAuthors}
    />
    {#if communicationTypes.length > 1}
      <div class="item-panel-content item-panel-filter-container mt-4">
            {#each communicationTypes as type}
                <button
                    class="item-panel-tag {selectedType === type ? 'active' : ''}"
                    on:click={() => selectType(type)}
                    type="button"
                >
                    {formatCommunicationType(type)}
                </button>
            {/each}
        </div>
    {/if}
</div>