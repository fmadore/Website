<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    // Props
    export let variant: 'primary' | 'secondary' | 'outline-primary' | 'outline-secondary' = 'primary';
    export let size: 'sm' | 'base' | 'lg' = 'base';
    export let href: string | undefined = undefined; // If provided, render as <a>
    export let type: 'button' | 'submit' | 'reset' = 'button'; // Only used for <button>
    export let disabled = false;
    export let block = false; // For btn-block
    export let iconOnly = false; // For icon-only buttons (adjusts padding potentially) - Not currently implemented in CSS, but adding prop
    export let ariaLabel: string | undefined = undefined; // For accessibility, esp. for iconOnly
    export let additionalClasses: string = ''; // ADDED PROP

    const dispatch = createEventDispatcher();

    // Compute classes based on props
    $: buttonClasses = [
        'btn',
        `btn-${variant}`,
        size !== 'base' ? `btn-${size}` : '',
        block ? 'btn-block' : '',
        $$slots.icon ? 'btn-icon' : '', // Add btn-icon if icon slot is used
        iconOnly ? 'btn-icon-only' : '', // Placeholder for potential future styling
        additionalClasses, // INCLUDE additionalClasses
    ].filter(Boolean).join(' ');

    function handleClick(event: MouseEvent) {
        if (!disabled) {
            dispatch('click', event);
        }
    }
</script>

{#if href}
    <a 
        {href}
        class={buttonClasses}
        role="button"
        aria-disabled={disabled}
        aria-label={ariaLabel || $$slots.default ? undefined : 'Link button'}
        {...$$restProps}
    >
        {#if $$slots.icon}
            <span class="btn-icon-slot"><slot name="icon"></slot></span>
        {/if}
        {#if !iconOnly && $$slots.default}
            <span class="btn-text-slot"><slot></slot></span>
        {/if}
    </a>
{:else}
    <button
        {type}
        class={buttonClasses}
        {disabled}
        on:click={handleClick}
        aria-label={ariaLabel || $$slots.default ? undefined : 'Button'}
        {...$$restProps}
    >
        {#if $$slots.icon}
             <span class="btn-icon-slot"><slot name="icon"></slot></span>
        {/if}
        {#if !iconOnly && $$slots.default}
            <span class="btn-text-slot"><slot></slot></span>
        {/if}
    </button>
{/if}

<style>
    /* Minimal styles to ensure icon and text slots align nicely if btn-icon class is present */
    .btn-icon-slot {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        /* Optional: Add margin if needed when both icon and text are present */
        /* .btn-icon .btn-icon-slot + .btn-text-slot { margin-left: var(--spacing-1); } */
    }
    .btn-text-slot {
        display: inline-block; /* Or inline-flex if needed */
    }

    /* Example for potential icon-only padding adjustment */
    /* .btn-icon-only { padding: var(--spacing-1); } */

    /* Ensure disabled links look disabled (already handled by .btn:disabled styles for buttons) */
     a[aria-disabled="true"] {
        opacity: 0.65;
        pointer-events: none;
        cursor: not-allowed;
    }
</style> 