<script lang="ts">
    import { base } from '$app/paths';
    import type { Publication, Communication } from '$lib/types';
    
    let { 
        item = undefined, 
        itemType = undefined, 
        id, 
        hasPopup = false 
    }: {
        item?: Publication | Communication | undefined;
        itemType?: 'publication' | 'communication' | undefined;
        id: string;
        hasPopup?: boolean;
    } = $props();
    
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
        }    }

    const referenceText = $derived(item
        ? `(${getAuthorCitation(item)}, ${getYear(item)})`
        : `(${id})`);

    const itemUrl = $derived(item && itemType
        ? `${base}/${itemType === 'publication' ? 'publications' : 'communications'}/${item.id}`
        : '#');

    const ariaLabel = $derived(item
        ? `View ${itemType || 'item'}: ${item.title}`
        : `Reference ${id}`);
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