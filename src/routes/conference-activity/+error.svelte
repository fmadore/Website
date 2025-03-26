<script>
    import { page } from '$app/stores';
</script>

<div class="container mx-auto py-12">
    <div class="bg-red-50 border border-red-300 p-6 rounded-lg">
        <h1 class="text-xl font-semibold text-red-700 mb-4">Error</h1>
        <p class="text-red-600 mb-4">
            {$page.status}: {$page.error?.message || 'An unknown error occurred'}
        </p>
        
        <div class="bg-white p-4 rounded overflow-auto">
            <pre class="text-xs">{JSON.stringify($page.error, null, 2)}</pre>
        </div>
        
        <div class="mt-6">
            <a href="/" class="text-blue-600 hover:underline">Return to homepage</a>
        </div>
    </div>
</div> 