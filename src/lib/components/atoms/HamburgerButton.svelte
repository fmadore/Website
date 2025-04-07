<script lang="ts">
    export let isActive = false;
    export let onClick: () => void;
</script>

<button 
    class="hamburger" 
    class:active={isActive}
    on:click={onClick} 
    aria-label="Toggle navigation menu"
    aria-expanded={isActive ? "true" : "false"}
    aria-controls="mobile-menu"
>
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
</button>

<style>
    .hamburger {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 24px;
        height: 18px;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        z-index: 210;
        position: relative;
    }
    
    .hamburger-line {
        width: 100%;
        height: 2px;
        background-color: var(--color-text);
        transition: all 0.3s ease;
    }
    
    /* Hide hamburger on desktop */
    @media (min-width: 1024px) {
        .hamburger {
            display: none;
        }
    }
    
    /* Hide hamburger when menu is active */
    .hamburger.active {
        display: none;
    }
</style> 