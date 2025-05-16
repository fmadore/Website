<script lang="ts">
  import type { Publication } from '$lib/types';
  import { base } from '$app/paths';
  import { page } from '$app/stores';

  export let publication: Publication;

  const getFullUrl = (path: string | undefined) => {
    if (!path) return undefined;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${$page.url.origin}${base}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // Helper to map your publication types to Dublin Core types Zotero might recognize
  function getDcType(type: Publication['type']): string {
    switch (type) {
      case 'article':
      case 'chapter':
      case 'encyclopedia':
      case 'blogpost':
        return 'Text'; // Common type for textual documents
      case 'book':
        return 'Book'; // Specific DCMI type, or use 'Text'
      case 'special-issue':
        return 'Collection'; // A collection of texts
      case 'report':
        return 'Text'; // Or potentially a more specific type if available
      case 'phd-dissertation':
      case 'masters-thesis':
        return 'Text'; // Theses are textual works
      default:
        return 'Text'; // Fallback
    }
  }

  // Reactive console logs for debugging (can be removed in production)
  $: console.log("Publication object in MetaTags:", publication);
  $: console.log("Generated public URL:", getFullUrl(publication.url));
  $: console.log("Generated PDF URL:", getFullUrl((publication as any).pdfUrl));
  $: console.log("Generated abstract URL:", `${$page.url.origin}${$page.url.pathname}`);

  // Define a type for our meta tag objects for better type safety
  type MetaTag = {
    name: string;
    content: string | undefined | null;
    condition?: boolean; // Make condition optional
  };

  const metaTags: MetaTag[] = [
    // --- Highwire Press Tags ---
    { name: 'citation_title', content: publication.title },
    ...(publication.authors?.map(author => ({ name: 'citation_author', content: author, condition: undefined })) || []),
    // Handle editors separately for chapters and edited volumes (special-issue, book with isEditedVolume)
    ...(publication.type === 'chapter' && Array.isArray(publication.editors) 
        ? publication.editors.map(editor => ({ name: 'citation_editor', content: editor, condition: undefined })) 
        : []),
    ...(publication.type === 'chapter' && typeof publication.editors === 'string' && publication.editors 
        ? publication.editors.split(/,\s*|\s+and\s+/).map(name => name.trim()).filter(name => name).map(editor => ({ name: 'citation_editor', content: editor, condition: undefined })) 
        : []),
    ...((publication.type === 'special-issue' || (publication.type === 'book' && publication.isEditedVolume)) && Array.isArray(publication.authors) // For edited volumes, authors are editors
        ? publication.authors.map(editor => ({ name: 'citation_editor', content: editor, condition: undefined })) 
        : []),
    // Add series if available
    { name: 'citation_series_title', content: publication.series},

    { name: 'citation_date', content: publication.dateISO || publication.date }, // Preferred date field
    { name: 'citation_publication_date', content: publication.dateISO || publication.date }, // Fallback
    { name: 'citation_year', content: String(publication.year) }, // Year is often useful
    
    { name: 'citation_publisher', content: publication.publisher },
    { name: 'citation_doi', content: publication.doi },
    { name: 'citation_isbn', content: publication.isbn }, // Mainly for books
    { name: 'citation_issn', content: (publication as any).issn }, // Mainly for journals
    { name: 'citation_language', content: publication.language },
    { name: 'citation_keywords', content: publication.tags?.join('; ') },

    // URLs
    { name: 'citation_public_url', content: getFullUrl(publication.url) }, // Link to the item itself
    { name: 'citation_abstract_html_url', content: `${$page.url.origin}${$page.url.pathname}` }, // Link to this page showing abstract
    { name: 'citation_pdf_url', content: getFullUrl((publication as any).pdfUrl) },

    // --- Type-specific Highwire Press Tags ---
    // Journal Article or Special Issue (often share journal context)
    { name: 'citation_journal_title', content: publication.journal, condition: publication.type === 'article' || publication.type === 'special-issue' },
    { name: 'citation_volume', content: publication.volume, condition: publication.type === 'article' || publication.type === 'special-issue' },
    { name: 'citation_issue', content: publication.issue, condition: publication.type === 'article' || publication.type === 'special-issue' },

    // Book Chapter specific: citation_book_title is the book's title
    { name: 'citation_book_title', content: publication.book, condition: publication.type === 'chapter' },
    // For Books (monographs or edited volumes), citation_book_title can also be the book's title
    { name: 'citation_book_title', content: publication.title, condition: publication.type === 'book' }, 

    // Page numbers for content within a larger work (article, chapter)
    { name: 'citation_firstpage', content: publication.pages?.split('-')[0]?.trim(), condition: (publication.type === 'article' || publication.type === 'chapter') && !!publication.pages && publication.pages.includes('-') },
    { name: 'citation_lastpage', content: publication.pages?.split('-')[1]?.trim(), condition: (publication.type === 'article' || publication.type === 'chapter') && !!publication.pages && publication.pages.includes('-') },
    // If pages is a single number (e.g. for an article, not a book's total page count)
    { name: 'citation_firstpage', content: publication.pages, condition: (publication.type === 'article' || publication.type === 'chapter') && !!publication.pages && !publication.pages.includes('-') && /^\d+$/.test(publication.pages.trim()) }, 
    { name: 'citation_lastpage', content: publication.pages, condition: (publication.type === 'article' || publication.type === 'chapter') && !!publication.pages && !publication.pages.includes('-') && /^\d+$/.test(publication.pages.trim()) },

    // Dissertation / Thesis
    { name: 'citation_dissertation_institution', content: publication.university, condition: ['masters-thesis', 'phd-dissertation'].includes(publication.type) },
    // citation_dissertation_name is often the title itself for theses, which is already covered by citation_title.

    // Report
    { name: 'citation_technical_report_institution', content: (publication as any).institution || publication.publisher, condition: publication.type === 'report' },
    { name: 'citation_technical_report_number', content: (publication as any).reportNumber, condition: publication.type === 'report' },

    // --- Dublin Core (DC) Tags ---
    { name: 'DC.title', content: publication.title },
    ...(publication.authors?.map(author => ({ name: 'DC.creator', content: author, condition: undefined })) || []),
    // DC.creator for editors as well
    ...(publication.type === 'chapter' && Array.isArray(publication.editors) 
        ? publication.editors.map(editor => ({ name: 'DC.creator', content: editor, condition: undefined })) // Or DC.contributor if more appropriate role
        : []),
    ...(publication.type === 'chapter' && typeof publication.editors === 'string' && publication.editors 
        ? publication.editors.split(/,\s*|\s+and\s+/).map(name => name.trim()).filter(name => name).map(editor => ({ name: 'DC.creator', content: editor, condition: undefined }))
        : []),
    ...((publication.type === 'special-issue' || (publication.type === 'book' && publication.isEditedVolume)) && Array.isArray(publication.authors) // Editors for edited volumes
        ? publication.authors.map(editor => ({ name: 'DC.creator', content: editor, condition: undefined })) 
        : []),
    { name: 'DC.description', content: publication.abstract },
    { name: 'DC.publisher', content: publication.publisher },
    { name: 'DC.date', content: publication.dateISO || publication.date }, // ISO 8601 format
    { name: 'DC.type', content: getDcType(publication.type) }, // Use helper to map to DCMI Type Vocabulary
    { name: 'DC.identifier', content: publication.doi ? `doi:${publication.doi}` : getFullUrl(publication.url) },
    { name: 'DC.language', content: publication.language },
    ...(publication.tags?.map(tag => ({ name: 'DC.subject', content: tag, condition: undefined })) || []),

  ].filter(tag => {
    if (!tag.content) return false; 
    if (typeof tag.condition === 'boolean') return tag.condition; 
    return true; 
  });

</script>

<svelte:head>
  {#each metaTags as tag}
    <meta name="{tag.name}" content="{tag.content ?? ''}" />
  {/each}
</svelte:head>

<!-- 
  This component does not render any visible HTML itself, 
  only adds tags to the document's head. 
--> 