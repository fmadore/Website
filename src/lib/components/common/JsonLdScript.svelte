<script lang="ts">
    export let jsonString: string;
</script>

{#if jsonString}
    <script type="application/ld+json">
        {@html jsonString}
    </script>
{/if} 