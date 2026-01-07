// src/lib/types/timeline.ts
// Type definitions for Career Timeline visualization

/**
 * Categories for timeline items, each with a distinct color
 */
export type TimelineCategory =
    | 'positions'
    | 'education'
    | 'grants'
    | 'publications'
    | 'presentations'
    | 'awards'
    | 'fieldwork';

/**
 * A normalized item for display on the career timeline
 */
export interface TimelineItem {
    /** Unique identifier from the source data */
    id: string;
    /** Category determines the color and swim lane */
    category: TimelineCategory;
    /** Primary title (position title, publication title, etc.) */
    title: string;
    /** Secondary label (institution, journal, conference, etc.) */
    subtitle?: string;
    /** Optional longer description */
    description?: string;
    /** Start date for positioning on timeline */
    startDate: Date;
    /** End date - if undefined, item is rendered as a point */
    endDate?: Date;
    /** Whether the item is ongoing (no end date yet) */
    isOngoing?: boolean;
    /** Optional URL for linking to details */
    url?: string;
    /** Original source type for more specific display */
    sourceType?: string;
}

/**
 * Configuration for a timeline category
 */
export interface TimelineCategoryConfig {
    id: TimelineCategory;
    label: string;
    color: string;
}

/**
 * Default category configurations with colors matching the design system
 */
export const TIMELINE_CATEGORIES: TimelineCategoryConfig[] = [
    { id: 'positions', label: 'Positions', color: 'var(--color-timeline-positions)' },
    { id: 'education', label: 'Education', color: 'var(--color-timeline-education)' },
    { id: 'grants', label: 'Grants', color: 'var(--color-timeline-grants)' },
    { id: 'publications', label: 'Publications', color: 'var(--color-timeline-publications)' },
    { id: 'presentations', label: 'Presentations', color: 'var(--color-timeline-presentations)' },
    { id: 'awards', label: 'Awards', color: 'var(--color-timeline-awards)' },
    { id: 'fieldwork', label: 'Fieldwork', color: 'var(--color-timeline-fieldwork)' }
];

/**
 * Get the color for a given category
 */
export function getCategoryColor(category: TimelineCategory): string {
    const config = TIMELINE_CATEGORIES.find((c) => c.id === category);
    return config?.color ?? 'var(--color-text-muted)';
}

/**
 * Get the label for a given category
 */
export function getCategoryLabel(category: TimelineCategory): string {
    const config = TIMELINE_CATEGORIES.find((c) => c.id === category);
    return config?.label ?? category;
}
