<script lang="ts">
    import { onMount } from 'svelte';
    import Button from '$lib/components/atoms/Button.svelte';
    
    let showBanner = false;
    
    onMount(() => {
        // Check if user has already made a choice
        const cookiesAccepted = localStorage.getItem('cookiesAccepted');
        if (cookiesAccepted === null) {
            // Only show banner if no choice has been made
            showBanner = true;
        }
    });
    
    function acceptCookies() {
        localStorage.setItem('cookiesAccepted', 'true');
        showBanner = false;
        
        // Enable Google Analytics tracking
        if (typeof window !== 'undefined' && 'gtag' in window) {
            // First enable tracking for current page
            window.gtag('config', 'G-DQ644SW7RG', {
                'send_page_view': true,
                'anonymize_ip': true
            });
        }
    }
    
    function declineCookies() {
        localStorage.setItem('cookiesAccepted', 'false');
        showBanner = false;
    }
</script>

{#if showBanner}
<div class="cookie-banner">
    <div class="cookie-content">
        <h3>Cookie Consent</h3>
        <p>This website uses cookies to improve your experience and analyse site traffic.</p>
        <div class="cookie-actions">
            <Button variant="primary" on:click={acceptCookies}>Accept</Button>
            <Button variant="secondary" on:click={declineCookies}>Decline</Button>
        </div>
    </div>
</div>
{/if}

<style>
    .cookie-banner {
        position: fixed;
        bottom: 1rem;
        left: 1rem;
        right: 1rem;
        background-color: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-lg);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        padding: 1rem;
        max-width: 24rem;
        margin: 0 auto;
    }
    
    .cookie-content {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    h3 {
        font-size: var(--font-size-lg);
        margin: 0;
        color: var(--color-text);
    }
    
    p {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
    }
    
    .cookie-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        margin-top: 0.5rem;
    }
    
    @media (max-width: 640px) {
        .cookie-banner {
            left: 0.5rem;
            right: 0.5rem;
            bottom: 0.5rem;
        }
    }
</style>