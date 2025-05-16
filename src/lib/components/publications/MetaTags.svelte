<script lang="ts">
  import type { Publication } from '$lib/types';
  import { base } from '$app/paths';
  import { page } from '$app/stores';

  export let publication: Publication;

  // Helper to generate full URLs
  const getFullUrl = (path: string | undefined) => {
    if (!path) return undefined;
    // If it's already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Otherwise, prepend the base and origin
    return `${$page.url.origin}${base}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  $: console.log("Publication object in MetaTags:", publication);
  $: console.log("Base URL:", base);
  $: console.log("Page store:", $page);
  $: console.log("Generated public URL:", getFullUrl(publication.url));
  $: console.log("Generated PDF URL:", getFullUrl(publication.pdfUrl));
  $: console.log("Generated abstract URL:", `${$page.url.origin}${$page.url.pathname}`);


  // General Properties
  const metaTags = [
    // Highwire Press Tags
    { name: 'citation_title', content: publication.title },
    ...(publication.authors?.map(author => ({ name: 'citation_author', content: author })) || []),
    { name: 'citation_publication_date', content: publication.dateISO || publication.date }, // YYYY or YYYY/MM/DD
    { name: 'citation_date', content: publication.dateISO || publication.date }, // YYYY or YYYY/MM/DD
    { name: 'citation_year', content: String(publication.year) },
    { name: 'citation_publisher', content: publication.publisher },
    { name: 'citation_doi', content: publication.doi },
    { name: 'citation_isbn', content: publication.isbn },
    { name: 'citation_issn', content: (publication as any).issn }, // Add type assertion for now
    { name: 'citation_language', content: publication.language },
    { name: 'citation_keywords', content: publication.tags?.join('; ') },
    { name: 'citation_public_url', content: getFullUrl(publication.url) },
    { name: 'citation_abstract_html_url', content: `${$page.url.origin}${$page.url.pathname}` }, // URL of the current page
    { name: 'citation_pdf_url', content: getFullUrl((publication as any).pdfUrl) }, // Add type assertion for now

    // Type-specific Highwire Press Tags
    // Journal Article
    { name: 'citation_journal_title', content: publication.journal, condition: publication.type === 'article' || publication.type === 'special-issue' },
    { name: 'citation_volume', content: publication.volume, condition: publication.type === 'article' || publication.type === 'special-issue' },
    { name: 'citation_issue', content: publication.issue, condition: publication.type === 'article' || publication.type === 'special-issue' },
    { name: 'citation_firstpage', content: publication.pages?.split('-')[0].trim(), condition: (publication.type === 'article' || publication.type === 'chapter') && publication.pages?.includes('-') },
    { name: 'citation_lastpage', content: publication.pages?.split('-')[1]?.trim(), condition: (publication.type === 'article' || publication.type === 'chapter') && publication.pages?.includes('-') },

    // Book
    { name: 'citation_book_title', content: publication.title, condition: publication.type === 'book' },
    // Note: For book chapters, citation_book_title should be the title of the book, not the chapter.
    // This needs to be handled if 'book' field contains the book title for chapters.
    { name: 'citation_book_title', content: publication.book, condition: publication.type === 'chapter' },
    ...(Array.isArray(publication.editors) ? publication.editors.map(editor => ({ name: 'citation_editor', content: editor, condition: publication.type === 'chapter' })) : []),

    // Dissertation
    { name: 'citation_dissertation_institution', content: publication.university, condition: ['masters-thesis', 'phd-dissertation'].includes(publication.type) },
    { name: 'citation_dissertation_name', content: publication.title, condition: ['masters-thesis', 'phd-dissertation'].includes(publication.type) }, // Often, dissertation title is used here as well

    // Report
    { name: 'citation_technical_report_institution', content: (publication as any).institution, condition: publication.type === 'report' }, // Add type assertion
    { name: 'citation_technical_report_number', content: (publication as any).reportNumber, condition: publication.type === 'report' }, // Add type assertion, corrected syntax

    // Dublin Core (DC) as fallback or supplement - Zotero prefers Highwire for bibliographic
    { name: 'DC.title', content: publication.title },
    ...(publication.authors?.map(author => ({ name: 'DC.creator', content: author })) || []),
    { name: 'DC.description', content: publication.abstract },
    { name: 'DC.publisher', content: publication.publisher },
    { name: 'DC.date', content: publication.dateISO || publication.date },
    { name: 'DC.type', content: publication.type }, // Map to DC types if necessary
    { name: 'DC.identifier', content: publication.doi ? `doi:${publication.doi}` : publication.url },
    { name: 'DC.language', content: publication.language },
    ...(publication.tags?.map(tag => ({ name: 'DC.subject', content: tag })) || []),
  ].filter(tag => tag.content && (tag.condition === undefined || tag.condition)); // Filter out tags with no content or failed condition

</script>

<svelte:head>
  {#each metaTags as tag}
    <meta name="{tag.name}" content="{tag.content}" />
  {/each}
</svelte:head>

<!-- 
  This component does not render any visible HTML itself, 
  only adds tags to the document's head. 
--> 