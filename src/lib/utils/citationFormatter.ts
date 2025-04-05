import type { Publication } from '$lib/types/publication'; // Assuming this path

// Human-readable labels for publication types
export const typeLabels: { [key: string]: string } = {
    'book': 'Book',
    'article': 'Journal Article',
    'chapter': 'Book Chapter',
    'special-issue': 'Special Issue',
    'report': 'Report',
    'encyclopedia': 'Encyclopedia Entry',
    'blogpost': 'Blog Post',
    'dissertation': 'Ph.D. Dissertation'
};

// Helper function to handle authors that might be string or array
export function getAuthorsArray(authors: string[] | string | undefined): string[] {
    if (!authors) return [];
    if (typeof authors === 'string') return authors.split(' and ');
    return authors;
}

// Define type for metadata items (kept for internal use within formatter)
type MetadataItem = { label: string; value: string | number | undefined | null };

// Define the structure for the formatted citation output
export interface FormattedCitation {
    typeLabel: string;
    // authorHtml: string; // We'll handle authors separately in the component for now due to interactivity
    detailsHtml: string;
    year?: number | string; // Include year separately if useful
}

// Main formatting function (to be implemented)
export function formatCitation(publication: Publication): FormattedCitation {
    const type = publication.type;
    const typeLabel = typeLabels[type] || type;
    let detailsHtml = '';
    let year = publication.year; // Keep year separate

    // --- Logic to build detailsHtml based on type ---
    // (This will consolidate logic from PublicationItem's metadata block and template)

    if (type === 'book') {
        let details = '';
        if (publication.placeOfPublication) {
            details += publication.placeOfPublication;
            if (publication.publisher) details += ':';
        }
        if (publication.placeOfPublication && publication.publisher) details += ' ';
        if (publication.publisher) details += publication.publisher;
        if (details) details += '.'; // Add period if details exist
        detailsHtml = details;

    } else if (type === 'chapter') {
        let details = 'In ';
        let hasBookInfo = false;
        if (publication.book) {
            details += `<em>${publication.book}</em>`;
            hasBookInfo = true;
        }
        if (publication.editors) {
            if (hasBookInfo) details += ', ';
            // Parse and format editors string
            let editorsFormatted = 'ed. ';
            if (typeof publication.editors === 'string') {
                // Replace " and " with ", " then split by comma, trim, and filter empty
                const editorsArray = publication.editors.replace(/\s+and\s+/g, ', ').split(',').map(name => name.trim()).filter(Boolean);
                const numEditors = editorsArray.length;
                editorsArray.forEach((editor, i) => {
                    editorsFormatted += editor;
                    if (i < numEditors - 1) {
                        // Use " and " before the last editor, ", " otherwise
                        editorsFormatted += (i === numEditors - 2) ? ' and ' : ', ';
                    }
                });
            } else {
                 // Fallback for non-string (though data seems to use string)
                 editorsFormatted += publication.editors;
            }
            details += editorsFormatted;
            hasBookInfo = true;
        }
        if (publication.pages) {
            if (hasBookInfo) details += ', ';
            details += `pp. ${publication.pages}`; // Use standard pp. notation
            hasBookInfo = true;
        }
        if (hasBookInfo) details += '. ';// Separator after main book/editor/page info

        let bookPubInfo = '';
        if (publication.placeOfPublication) {
            bookPubInfo += publication.placeOfPublication;
            if (publication.publisher) bookPubInfo += ':';
        }
        if (publication.placeOfPublication && publication.publisher) bookPubInfo += ' ';
        if (publication.publisher) bookPubInfo += publication.publisher;
        if (details.trim() && !details.trim().endsWith('.')) {
            details += '.'; // Ensure final period
        }
        detailsHtml = details;

    } else if (type === 'article') {
        let details = '';
        if (publication.journal) details += `<em>${publication.journal}</em>`;
        if (publication.volume) details += ` ${publication.volume}`; // Space before volume
        if (publication.issue) details += ` (${publication.issue})`;
        if (publication.pages) details += `: ${publication.pages}`; // Colon before pages
        if (details.trim() && !details.trim().endsWith('.')) {
             details += '.'; // Ensure final period
        }
        detailsHtml = details;
        year = publication.year;

    } else if (type === 'encyclopedia') {
        let details = `In <em>${publication.encyclopediaTitle || ''}</em>`;
        if (publication.editors) details += `, ed. ${publication.editors}`;
        if (publication.pages) details += `, pp. ${publication.pages}`;
        details += '. '; // Separator

        let pubInfo = '';
         if (publication.placeOfPublication) {
            pubInfo += publication.placeOfPublication;
            if (publication.publisher) pubInfo += ':';
        }
        if (publication.placeOfPublication && publication.publisher) pubInfo += ' ';
        if (publication.publisher) pubInfo += publication.publisher;
        if (details.trim() && !details.trim().endsWith('.')) {
            details += '.'; // Ensure final period
        }
        detailsHtml = details;
        year = publication.year;

    } else if (type === 'dissertation') {
        let details = 'Ph.D. dissertation';
        if (publication.department) details += `, ${publication.department}`;
        if (publication.university) details += `, ${publication.university}`;
        if (details.trim() && !details.trim().endsWith('.')) {
            details += '.'; // Ensure final period
        }
        detailsHtml = details;
        year = publication.year;
    }
    // Add other types like 'report', 'special-issue', 'blogpost' if needed, ensuring they format correctly and end with a period.

    return {
        typeLabel,
        detailsHtml,
        year // Return the year separately
    };
}
