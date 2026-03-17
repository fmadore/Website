<script lang="ts">
	// This page redirects to the new URL
	// The redirect is handled by +page.server.ts
	import { resolve } from '$app/paths';
</script>

<!-- Fallback content in case redirect doesn't work -->
<p>
	Redirecting to <a href={resolve('/research/dh-ai-african-studies')}
		>Digital Humanities and AI in African Studies</a
	>...
</p>
