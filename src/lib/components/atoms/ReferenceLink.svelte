<script lang="ts">
    import { base } from '$app/paths';
    import type { Publication, Communication } from '$lib/types';
    
    export let item: Publication | Communication | undefined = undefined;
    export let itemType: 'publication' | 'communication' | undefined = undefined;
    export let id: string;
    export let hasPopup: boolean = false;
    
    // Helper to get year consistently
    function getYear(item: Publication | Communication): string {
        if ('dateISO' in item && item.dateISO) return item.dateISO.substring(0, 4);
        if ('date' in item && item.date) return item.date.substring(0, 4);
        if ('year' in item && item.year) return item.year.toString();
        return 'N/D';
    }

    // Helper to get author citation text
    function getAuthorCitation(item: Publication | Communication): string {
        const authors = item.authors;
        if (!authors || authors.length === 0) return 'N/A';
        
        // Get last names
        const lastNames = authors.map(author => {
            if (typeof author === 'string') {
                return author.split(' ').pop() || 'N/A';
            }
            return 'N/A';
        });
        
        if (lastNames.length === 1) {
            return lastNames[0];
        } else if (lastNames.length === 2) {
            return `${lastNames[0]} and ${lastNames[1]}`;
        } else {
            return `${lastNames[0]} et al.`;
        }
    }

    $: referenceText = item
        ? `(${getAuthorCitation(item)}, ${getYear(item)})`
        : `(${id})`;

    $: itemUrl = item && itemType
        ? `${base}/${itemType === 'publication' ? 'publications' : 'communications'}/${item.id}`
        : '#';

    $: ariaLabel = item
        ? `View ${itemType || 'item'}: ${item.title}`
        : `Reference ${id}`;
</script>

<a 
    href={itemUrl} 
    class="reference-link" 
    aria-label={ariaLabel}
    tabindex="-1" 
    class:has-popup={hasPopup}
>
    {referenceText}
</a>

<style>
    .reference-link {
        color: var(--color-primary); 
        text-decoration: underline;
        text-decoration-style: dotted;
        font-size: 0.9em; 
        transition: color 0.2s ease, text-decoration-style 0.2s ease;
        pointer-events: none; /* Let parent span handle interactions */
    }
    
    .reference-link.has-popup {
        cursor: pointer;
    }
</style> 