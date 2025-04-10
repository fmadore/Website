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
        .slice(0, limit) as RelevantItem[]; // Cast the specific type to the generic type

    // Get unique publication types for the type filter
    $: publicationTypes = [...new Set(publicationList.map(pub => pub.type))].sort();

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

<RelevantItemsList
    title="Relevant Publications"
    items={publicationList}
    itemTypePlural="publications"
    basePath="/publications"
    {projectName}
    {showTypeFilters}
    formatType={formatPublicationType}
    {formatAuthors}
/> 