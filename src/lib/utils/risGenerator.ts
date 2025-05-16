import type { Publication } from '$lib/types';

function addTag(tag: string, value: string | number | undefined | null, lines: string[]) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
        lines.push(`${tag}  - ${String(value).replace(/\r\n|\r|\n/g, ' ')}`);
    }
}

function addRepeatedTag(tag: string, values: string[] | undefined | null, lines: string[]) {
    if (values && values.length > 0) {
        values.forEach(value => addTag(tag, value, lines));
    }
}

function getRisType(publicationType: Publication['type']): string {
    switch (publicationType) {
        case 'article': return 'JOUR';
        case 'book': return 'BOOK'; // Also for edited volumes
        case 'chapter': return 'CHAP';
        case 'special-issue': return 'JOUR'; // Or potentially JOUR for the issue, with articles as JOUR inside
        case 'report': return 'RPRT';
        case 'encyclopedia': return 'ENCYC';
        case 'blogpost': return 'BLOG';
        case 'phd-dissertation': return 'THES';
        case 'masters-thesis': return 'THES';
        default: return 'GEN';
    }
}

export function generateRis(publication: Publication): string {
    const lines: string[] = [];
    const risType = getRisType(publication.type);

    addTag('TY', risType, lines);
    addTag('TI', publication.title, lines);

    // Authors / Editors
    if (publication.type === 'book' && publication.isEditedVolume) {
        if (publication.authors && publication.authors.length > 0) { // These are editors
            addRepeatedTag('A2', publication.authors, lines);
        } else if (typeof publication.editors === 'string' && publication.editors) {
            addTag('A2', publication.editors, lines); // Fallback to editors string
        } else if (Array.isArray(publication.editors) && publication.editors.length > 0){
            addRepeatedTag('A2', publication.editors, lines);
        }
    } else {
        addRepeatedTag('AU', publication.authors, lines); // Primary authors
        // For non-book or non-edited-book types, if editors are present, they are secondary
        if (publication.type !== 'book') { // Avoid double-adding for regular books where authors are AU
            if (typeof publication.editors === 'string' && publication.editors) {
                addTag('A2', publication.editors, lines);
            } else if (Array.isArray(publication.editors) && publication.editors.length > 0) {
                addRepeatedTag('A2', publication.editors, lines);
            }
        }
    }

    // Revised Date Handling (PY only, formatted with slashes)
    let pyValue: string | number | undefined = publication.year;

    if (publication.dateISO) {
        const isoParts = publication.dateISO.split('-');
        if (isoParts.length === 1 && /^\d{4}$/.test(isoParts[0])) { // YYYY
            pyValue = isoParts[0];
        } else if (isoParts.length === 2 && /^\d{4}$/.test(isoParts[0]) && /^\d{1,2}$/.test(isoParts[1])) { // YYYY-MM
            pyValue = `${isoParts[0]}/${isoParts[1].padStart(2, '0')}`;
        } else if (isoParts.length === 3 && /^\d{4}$/.test(isoParts[0]) && /^\d{1,2}$/.test(isoParts[1]) && /^\d{1,2}$/.test(isoParts[2])) { // YYYY-MM-DD
            pyValue = `${isoParts[0]}/${isoParts[1].padStart(2, '0')}/${isoParts[2].padStart(2, '0')}`;
        }
    }
    addTag('PY', pyValue, lines);

    if (publication.abstract) addTag('AB', publication.abstract, lines);
    addRepeatedTag('KW', publication.tags, lines);
    if (publication.doi) addTag('DO', publication.doi, lines);
    if (publication.url) addTag('UR', publication.url, lines);
    if (publication.language) addTag('LA', publication.language, lines);
    if (publication.publisher && !(risType === 'THES')) { 
        addTag('PB', publication.publisher, lines);
    }
    if (publication.placeOfPublication) addTag('CY', publication.placeOfPublication, lines);
    if (publication.isbn) addTag('SN', publication.isbn, lines);
    if ((publication as any).issn) addTag('SN', (publication as any).issn, lines); 

    const notes: string[] = [];
    if (publication.prefacedBy) {
        notes.push(`Prefaced by ${publication.prefacedBy}.`);
    }

    // Type-specific fields
    switch (risType) {
        case 'JOUR':
            addTag('JO', publication.journal, lines); 
            addTag('JF', publication.journal, lines); 
            addTag('VL', publication.volume, lines);
            addTag('IS', publication.issue, lines);
            // If it's a special issue that is an edited work, its editors are A2.
            // This is handled by the main editor logic if publication.type is not 'book'.
            // If it *is* a special issue and isEditedWork, the main logic for AU/A2 should correctly place authors/editors.
            // The primary authors of articles within the special issue are AU.
            // The editors of the special issue itself should be A2.
            // The current main author/editor block handles this: if type is 'special-issue' (so not 'book'),
            // and publication.editors is populated, they become A2.
            break;
        case 'BOOK': // Includes edited volumes
            if (publication.series) addTag('T3', publication.series, lines);
            if (publication.pageCount && publication.pageCount > 0) {
                // Add page count to notes as well for books, as EP might go to "Extra"
                notes.push(`Total pages: ${publication.pageCount}.`);
            }
            break;
        case 'CHAP':
            addTag('T2', publication.book, lines); 
            if (publication.series) addTag('T3', publication.series, lines); 
            break;
        case 'THES':
            addTag('PB', publication.university, lines); 
            addTag('M3', publication.type === 'phd-dissertation' ? 'PhD dissertation' : 'Master\'s thesis', lines); 
            if (publication.department) addTag('AD', publication.department, lines);
            if (publication.advisors && publication.advisors.length > 0) {
                notes.push(`Advisors: ${publication.advisors.join('; ')}.`);
            }
            break;
        case 'RPRT':
            addTag('IS', (publication as any).reportNumber, lines); 
            addTag('PB', (publication as any).institution || publication.publisher, lines); 
            break;
        case 'BLOG':
            addTag('JO', publication.publisher, lines); 
            break;
        case 'ENCYC':
            addTag('T2', publication.encyclopediaTitle, lines); 
            break;
    }

    // Page Handling (SP, EP) - EP for books is handled in notes and still below
    if (risType === 'BOOK' && publication.pageCount && publication.pageCount > 0) {
        addTag('EP', String(publication.pageCount), lines); // Keep EP, Zotero might use it for something even if not display
    } else if (publication.pages && String(publication.pages).trim()) {
        let startPage: string | undefined = undefined;
        let endPage: string | undefined = undefined;
        const pageString = String(publication.pages).trim();
        const parts = pageString.split('-').map(p => p.trim());

        if (parts.length === 2 && parts[0] && parts[1] && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) {
            startPage = parts[0];
            endPage = parts[1];
        } else if (parts.length === 1 && parts[0] && /^\d+$/.test(parts[0])) {
            const singlePageNum = parts[0];
            if (risType === 'THES' || risType === 'RPRT') { 
                startPage = '1'; 
                endPage = singlePageNum;
            } else { 
                startPage = singlePageNum;
                endPage = singlePageNum; 
            }
        }
        addTag('SP', startPage, lines);
        addTag('EP', endPage, lines);
    }
  
    if (notes.length > 0) {
        addTag('N1', notes.join(' '), lines); // Join notes with a space
    }

    // Final tags
    if (publication.pdfUrl) addTag('L1', publication.pdfUrl, lines); 
    addTag('ER', '', lines); 

    return lines.join('\r\n');
} 