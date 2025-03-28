<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    
    onMount(() => {
        // Check if URL has the ?p= query param
        const url = new URL(window.location.href);
        if (url.searchParams.has('p')) {
            const path = url.searchParams.get('p');
            url.searchParams.delete('p');
            
            // Clean up the URL without causing a page reload
            const cleanPath = `${base}${path}`;
            window.history.replaceState(null, '', cleanPath);
        }
    });
</script> 