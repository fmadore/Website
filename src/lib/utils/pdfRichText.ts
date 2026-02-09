import type { jsPDF } from 'jspdf';

export interface TextFragment {
    text: string;
    style: 'normal' | 'italic' | 'bold' | 'bolditalic';
    href?: string;
}

/**
 * Safely checks if a URL is a valid DOI link by parsing the hostname.
 * Prevents URL substring attacks by verifying the actual host.
 */
const isValidDoiUrl = (href: string): boolean => {
    try {
        const url = new URL(href);
        // Only allow exact doi.org host (not subdomains like evil.doi.org)
        return url.hostname === 'doi.org' || url.hostname === 'dx.doi.org';
    } catch {
        return false;
    }
};

/**
 * Extracts the DOI identifier from a validated DOI URL.
 * Should only be called after isValidDoiUrl returns true.
 */
const extractDoiFromUrl = (href: string): string => {
    try {
        const url = new URL(href);
        // Remove leading slash from pathname
        return url.pathname.slice(1);
    } catch {
        return '';
    }
};

/**
 * Extracts text from an HTML element, preserving URL links and basic formatting (italic/bold).
 * Returns an array of TextFragments suitable for rich text rendering.
 * Normalizes whitespace (collapses newlines and tabs to single spaces).
 */
export const extractRichText = (node: Element | ChildNode): TextFragment[] => {
    let fragments: TextFragment[] = [];

    // Handle text nodes with DOI detection
    if (node.nodeType === 3) { // Node.TEXT_NODE
        const rawText = node.textContent || '';
        if (rawText) {
            // Normalize whitespace: collapse newlines and tabs to single spaces
            const text = rawText.replace(/\s+/g, ' ');

            const doiMatch = text.match(/DOI:\s*(10\.\d{4,}\/[^\s]+)/i);
            if (doiMatch) {
                const doi = doiMatch[1];
                // Format: "DOI: 10.xxxx (https://doi.org/10.xxxx)"
                const newText = text.replace(doiMatch[0], `DOI: ${doi} (https://doi.org/${doi})`);
                fragments.push({ text: newText, style: 'normal' });
            } else {
                fragments.push({ text, style: 'normal' });
            }
        }
        return fragments;
    }

    // Handle element nodes
    if (node.nodeType === 1) { // Node.ELEMENT_NODE
        const el = node as Element;
        const tagName = el.tagName;

        // Map styles based on tag
        let style: 'normal' | 'italic' | 'bold' | 'bolditalic' = 'normal';
        if (tagName === 'EM' || tagName === 'I') style = 'italic';
        if (tagName === 'STRONG' || tagName === 'B') style = 'bold';

        // Handle links
        if (tagName === 'A') {
            const href = el.getAttribute('href') || '';
            // Normalize link text
            const linkText = (el.textContent?.trim() || '').replace(/\s+/g, ' ');

            // Handle special links logic (similar to originalPdfGenerator)
            if (!linkText || el.classList.contains('doi-link')) {
                fragments.push({ text: linkText, style: 'normal' });
            } else if (isValidDoiUrl(href)) {
                // Safely extract DOI from validated URL (prevents URL substring attacks)
                const doi = extractDoiFromUrl(href);
                fragments.push({ text: `${linkText} (https://doi.org/${doi})`, style: 'normal', href });
            } else if (href.startsWith('http') || href.startsWith('mailto:')) {
                const isGenericLinkText = /^\[?(link|listen|view|read|download|here|click)\]?$/i.test(linkText);
                if (isGenericLinkText) {
                    fragments.push({ text: href, style: 'normal', href });
                } else {
                    fragments.push({ text: `${linkText} (${href})`, style: 'normal', href });
                }
            } else {
                fragments.push({ text: linkText, style: 'normal' });
            }
            return fragments;
        }

        // Recurse for children
        el.childNodes.forEach((child) => {
            const childFragments = extractRichText(child);
            childFragments.forEach(frag => {
                const newFrag = { ...frag };
                if (style !== 'normal') {
                    if (newFrag.style === 'normal') newFrag.style = style;
                    else if (newFrag.style === 'italic' && style === 'bold') newFrag.style = 'bolditalic';
                    else if (newFrag.style === 'bold' && style === 'italic') newFrag.style = 'bolditalic';
                }
                fragments.push(newFrag);
            });
        });
    }

    return fragments;
};

/**
 * Trims leading and trailing whitespace from a list of fragments.
 * Removes empty fragments resulting from trim.
 */
export const trimFragments = (fragments: TextFragment[]): TextFragment[] => {
    if (fragments.length === 0) return [];

    // Clone to avoid mutating original source if implicitly used elsewhere
    let result = fragments.map(f => ({ ...f }));

    // Trim Start
    while (result.length > 0) {
        const first = result[0];
        const trimmed = first.text.trimStart();
        if (trimmed.length === 0) {
            result.shift(); // Remove empty fragment
        } else {
            first.text = trimmed;
            break;
        }
    }

    // Trim End
    while (result.length > 0) {
        const last = result[result.length - 1];
        const trimmed = last.text.trimEnd();
        if (trimmed.length === 0) {
            result.pop();
        } else {
            last.text = trimmed;
            break;
        }
    }

    return result;
};


/**
 * Renders rich text fragments to the PDF, handling line wrapping and style switches.
 * @returns The new Y position after rendering.
 */
export const renderRichText = (
    pdf: jsPDF,
    fragments: TextFragment[],
    x: number,
    y: number,
    width: number,
    fontSize: number,
    defaultLineHeight: number,
    baseFont: string = 'helvetica'
): number => {
    let currentX = x;
    let currentY = y;

    pdf.setFontSize(fontSize);

    fragments.forEach(frag => {
        // Set font style
        let fontStyle = 'normal';
        if (frag.style === 'italic') fontStyle = 'italic';
        if (frag.style === 'bold') fontStyle = 'bold';
        if (frag.style === 'bolditalic') fontStyle = 'bolditalic';
        pdf.setFont(baseFont, fontStyle);

        // Split by whitespace
        const words = frag.text.split(/(\s+)/);

        words.forEach(word => {
            if (word.length === 0) return;

            const wordWidth = pdf.getStringUnitWidth(word) * fontSize / pdf.internal.scaleFactor;

            // Check if word fits
            if (currentX + wordWidth > x + width) {
                // Ignore leading whitespace on new line
                if (/^\s+$/.test(word) && currentX === x) {
                    return;
                }

                currentX = x;
                currentY += defaultLineHeight;
            }

            pdf.text(word, currentX, currentY);
            currentX += wordWidth;
        });
    });

    // Return next line Y
    return currentY + defaultLineHeight;
};

/**
 * Calculates the height required for rich text without rendering it.
 */
export const measureRichTextHeight = (
    pdf: jsPDF,
    fragments: TextFragment[],
    width: number,
    fontSize: number,
    lineHeight: number,
    baseFont: string = 'helvetica'
): number => {
    let currentX = 0; // Relative X
    let lines = 1;

    pdf.setFontSize(fontSize);

    fragments.forEach(frag => {
        let fontStyle = 'normal';
        if (frag.style === 'italic') fontStyle = 'italic';
        if (frag.style === 'bold') fontStyle = 'bold';
        if (frag.style === 'bolditalic') fontStyle = 'bolditalic';
        pdf.setFont(baseFont, fontStyle);

        const words = frag.text.split(/(\s+)/);

        words.forEach(word => {
            if (word.length === 0) return;
            const wordWidth = pdf.getStringUnitWidth(word) * fontSize / pdf.internal.scaleFactor;

            if (currentX + wordWidth > width) {
                if (/^\s+$/.test(word) && currentX === 0) return;
                currentX = 0;
                lines++;
            }
            currentX += wordWidth;
        });
    });

    return lines * lineHeight;
};
