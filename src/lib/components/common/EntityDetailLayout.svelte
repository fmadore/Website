<!--
EntityDetailLayout - Shared shell for item detail pages
(communications/[id], activities/[id], digital-humanities/[id])

Owns only what those routes genuinely share:

  - the outer `container py-8 page-enter` wrapper plus an inner wrapper div
    whose class differs per route (`wrapperClass`);
  - the <Breadcrumb> trail and the <PageHeader> masthead, exposed to the page
    as snippet parameters so each route keeps its exact DOM position for them
    (outside vs. inside the <article>, wrapped in plain divs, …);
  - the JSON-LD apparatus: breadcrumb JSON-LD plus the per-entity JSON-LD
    script injection.

Everything category-specific (hero plates, details grids, tag chips, action
links, related-items rails, back links) stays in the route and arrives through
the `children` / `after` snippets. SEO + MetaTags also stay in the route —
their props differ per category.

Usage:

  <EntityDetailLayout {breadcrumbItems} jsonLdScriptId="…" {jsonLdString} title={…}>
    {#snippet children({ breadcrumb, header })}
      {@render breadcrumb()}
      <article>…{@render header()}…</article>
    {/snippet}
  </EntityDetailLayout>
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import { useBreadcrumbJsonLd, type BreadcrumbNavItem } from '$lib/utils/breadcrumbJsonLd.svelte';
	import { useJsonLdScript } from '$lib/utils/jsonLd.svelte';

	interface Props {
		/** Breadcrumb trail — also feeds the breadcrumb JSON-LD. */
		breadcrumbItems: BreadcrumbNavItem[];
		/** Optional custom script id for the breadcrumb JSON-LD (defaults to the shared id). */
		breadcrumbJsonLdId?: string;
		/** Script id for the entity JSON-LD (e.g. 'communication-json-ld'). */
		jsonLdScriptId: string;
		/** Precomputed JSON-LD string from the route's load function. */
		jsonLdString?: string;
		/** Page title, rendered by the shared <PageHeader>. */
		title: string;
		/** Dateline for the header eyebrow. */
		date?: string;
		/** Type badge for the header eyebrow (e.g. 'Panel', 'Digital Humanities'). */
		typeBadgeText?: string;
		/** Byline authors for the header. */
		authors?: string[];
		/** Class of the inner wrapper div (differs per route). */
		wrapperClass?: string;
		/** Main content; receives the layout's breadcrumb + header snippets to place. */
		children: Snippet<[{ breadcrumb: Snippet; header: Snippet }]>;
		/** Optional content after the wrapper div, still inside the container. */
		after?: Snippet;
	}

	let {
		breadcrumbItems,
		breadcrumbJsonLdId,
		jsonLdScriptId,
		jsonLdString,
		title,
		date,
		typeBadgeText,
		authors,
		wrapperClass = 'max-w-6xl mx-auto',
		children,
		after
	}: Props = $props();

	// Script ids are static for the lifetime of a route component, so capturing
	// their initial value here is deliberate (the hooks take a fixed id).
	// svelte-ignore state_referenced_locally
	const breadcrumbScriptId = breadcrumbJsonLdId;
	// svelte-ignore state_referenced_locally
	const entityScriptId = jsonLdScriptId;

	// Inject breadcrumb JSON-LD structured data
	useBreadcrumbJsonLd(() => breadcrumbItems, breadcrumbScriptId);

	// Inject the entity's JSON-LD structured data
	useJsonLdScript(entityScriptId, () => jsonLdString);
</script>

{#snippet breadcrumb()}
	<Breadcrumb items={breadcrumbItems} />
{/snippet}

{#snippet header()}
	<PageHeader {title} {date} {typeBadgeText} {authors} />
{/snippet}

<div class="container py-8 page-enter">
	<div class={wrapperClass}>
		{@render children({ breadcrumb, header })}
	</div>
	{@render after?.()}
</div>
