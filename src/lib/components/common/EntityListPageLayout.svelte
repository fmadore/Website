<script lang="ts">
    export let containerClass = "container mx-auto py-6"; // Customizable container class
    export let gridClass = "grid grid-cols-1 md:grid-cols-4 gap-6"; // Customizable grid class
    export let sidebarClass = "md:col-span-1"; // Class for the sidebar
</script>

<div class={containerClass}>
    <div class={gridClass}>
        <div class={sidebarClass}>
            <slot name="sidebar"></slot>
        </div>
        
        <div class="md:col-span-3">
            <slot></slot>
        </div>
    </div>
</div> 