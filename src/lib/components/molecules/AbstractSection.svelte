<script lang="ts">
    export let abstract: string | undefined | null = undefined;

    // Props for customization with sensible defaults
    export let sectionClass: string = 'mb-6';
    export let titleClass: string = 'text-xl font-semibold mb-2';
    export let titleText: string = 'Abstract';
    export let contentClass: string = 'text-text'; // Uses prose potentially if applied globally
</script>

{#if abstract}
    <section class={sectionClass}>
        <h2 class={titleClass}>{titleText}</h2>
        <div class={contentClass}>{abstract}</div>
    </section>
{/if} 