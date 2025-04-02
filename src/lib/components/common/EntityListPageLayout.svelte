<script lang="ts">
    export let title: string; // The page title
    export let containerClass = "container mx-auto py-6"; // Customizable container class
    export let gridClass = "grid grid-cols-1 md:grid-cols-4 gap-6"; // Customizable grid class
    export let titleClass = "text-primary mb-6"; // Class for the title
    export let sidebarClass = "md:col-span-1"; // Class for the sidebar
    export let mainClass = "md:col-span-3"; // Class for the main content
    
    // Optional top area content - useful for filters, toggle buttons, etc.
    export let showTopArea = false;
</script>

<div class={containerClass}>
    <div class="flex justify-between items-center mb-6">
        <h1 class={titleClass}>{title}</h1>
        
        {#if showTopArea}
            <slot name="top-area"></slot>
        {/if}
    </div>
    
    <div class={gridClass}>
        <div class={sidebarClass}>
            <slot name="sidebar"></slot>
        </div>
        
        <div class={mainClass}>
            <slot></slot>
        </div>
    </div>
</div> 