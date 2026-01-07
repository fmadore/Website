// src/lib/utils/timelineData.ts
// Utility functions to transform various data types into TimelineItem format

import type { TimelineItem, TimelineCategory } from '$lib/types/timeline';
import type { Appointment } from '$lib/types/appointment';
import type { Education } from '$lib/types/education';
import type { Grant } from '$lib/types/grant';
import type { Publication } from '$lib/types/publication';
import type { Communication } from '$lib/types/communication';
import type { Award } from '$lib/types/award';
import type { Fieldwork } from '$lib/types/fieldwork';

// Data imports
import { allAppointments } from '$lib/data/appointments';
import { allEducation } from '$lib/data/education';
import { allGrants } from '$lib/data/grants';
import { allPublications } from '$lib/data/publications';
import { allCommunications } from '$lib/data/communications';
import { allAwards } from '$lib/data/awards';
import { allFieldworks } from '$lib/data/fieldworks';

/**
 * Transform an Appointment to a TimelineItem
 */
export function appointmentToTimelineItem(appointment: Appointment): TimelineItem {
    const startDate = new Date(appointment.dateISOStart);
    const endDate = appointment.dateISOEnd ? new Date(appointment.dateISOEnd) : undefined;
    const isOngoing = appointment.endYear === null || appointment.endYear === undefined;

    return {
        id: appointment.id,
        category: 'positions' as TimelineCategory,
        title: appointment.title,
        subtitle: appointment.institution,
        description: appointment.location,
        startDate,
        endDate: isOngoing ? undefined : endDate,
        isOngoing,
        sourceType: 'appointment'
    };
}

/**
 * Transform an Education entry to a TimelineItem
 */
export function educationToTimelineItem(education: Education): TimelineItem {
    const date = new Date(education.dateISO);

    return {
        id: education.id,
        category: 'education' as TimelineCategory,
        title: education.degree,
        subtitle: education.institution,
        description: education.thesisTitle || education.details,
        startDate: date,
        // Education is a point in time (graduation/completion)
        endDate: undefined,
        isOngoing: false,
        sourceType: education.type || 'Degree'
    };
}

/**
 * Transform a Grant to a TimelineItem
 */
export function grantToTimelineItem(grant: Grant): TimelineItem {
    const startDate = new Date(grant.dateISOStart);
    const endDate = grant.dateISOEnd ? new Date(grant.dateISOEnd) : undefined;
    const isOngoing = grant.endYear === null || grant.endYear === undefined;

    return {
        id: grant.id,
        category: 'grants' as TimelineCategory,
        title: grant.title,
        subtitle: grant.funder,
        description: grant.projectTitle || grant.details,
        startDate,
        endDate: isOngoing ? undefined : endDate,
        isOngoing,
        sourceType: 'grant'
    };
}

/**
 * Transform a Publication to a TimelineItem
 */
export function publicationToTimelineItem(publication: Publication): TimelineItem {
    const date = new Date(publication.dateISO);

    return {
        id: publication.id,
        category: 'publications' as TimelineCategory,
        title: publication.title,
        subtitle: publication.journal || publication.publisher || publication.book,
        description: publication.abstract,
        startDate: date,
        // Publications are point in time
        endDate: undefined,
        isOngoing: false,
        url: publication.url || (publication.doi ? `https://doi.org/${publication.doi}` : undefined),
        sourceType: publication.type
    };
}

/**
 * Transform a Communication to a TimelineItem
 */
export function communicationToTimelineItem(communication: Communication): TimelineItem {
    const date = new Date(communication.dateISO);

    return {
        id: communication.id,
        category: 'presentations' as TimelineCategory,
        title: communication.title,
        subtitle: communication.conference,
        description: communication.location,
        startDate: date,
        // Communications/presentations are point in time
        endDate: undefined,
        isOngoing: false,
        url: communication.url,
        sourceType: communication.type || 'conference'
    };
}

/**
 * Transform an Award to a TimelineItem
 */
export function awardToTimelineItem(award: Award): TimelineItem {
    const date = new Date(award.dateISO);

    return {
        id: award.id,
        category: 'awards' as TimelineCategory,
        title: award.title,
        subtitle: award.institution,
        description: award.details,
        startDate: date,
        // Awards are point in time
        endDate: undefined,
        isOngoing: false,
        sourceType: 'award'
    };
}

/**
 * Transform a Fieldwork to a TimelineItem
 */
export function fieldworkToTimelineItem(fieldwork: Fieldwork): TimelineItem {
    // Fieldwork only has year, create a date from that
    const date = new Date(fieldwork.year, 0, 1);

    return {
        id: fieldwork.id,
        category: 'fieldwork' as TimelineCategory,
        title: `${fieldwork.city}, ${fieldwork.country}`,
        subtitle: fieldwork.project,
        description: fieldwork.description,
        startDate: date,
        // Fieldwork entries are point in time
        endDate: undefined,
        isOngoing: false,
        sourceType: 'fieldwork'
    };
}

/**
 * Get all timeline items from all data sources, sorted by date
 */
export function getAllTimelineItems(): TimelineItem[] {
    const items: TimelineItem[] = [];

    // Transform all appointments
    for (const appointment of allAppointments) {
        items.push(appointmentToTimelineItem(appointment));
    }

    // Transform all education
    for (const edu of allEducation) {
        items.push(educationToTimelineItem(edu));
    }

    // Transform all grants
    for (const grant of allGrants) {
        items.push(grantToTimelineItem(grant));
    }

    // Transform all publications
    for (const pub of allPublications) {
        items.push(publicationToTimelineItem(pub));
    }

    // Transform all communications
    for (const comm of allCommunications) {
        items.push(communicationToTimelineItem(comm));
    }

    // Transform all awards
    for (const award of allAwards) {
        items.push(awardToTimelineItem(award));
    }

    // Transform all fieldworks
    for (const fieldwork of allFieldworks) {
        items.push(fieldworkToTimelineItem(fieldwork));
    }

    // Sort by start date (oldest first for timeline display)
    return items.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

/**
 * Get timeline items filtered by category
 */
export function getTimelineItemsByCategory(category: TimelineCategory): TimelineItem[] {
    return getAllTimelineItems().filter((item) => item.category === category);
}

/**
 * Get the year range covered by all timeline items
 */
export function getTimelineYearRange(): { minYear: number; maxYear: number } {
    const items = getAllTimelineItems();

    if (items.length === 0) {
        const currentYear = new Date().getFullYear();
        return { minYear: currentYear - 10, maxYear: currentYear + 1 };
    }

    const years = items.flatMap((item) => {
        const dates = [item.startDate];
        if (item.endDate) dates.push(item.endDate);
        return dates.map((d) => d.getFullYear());
    });

    // Add current year for ongoing items
    const currentYear = new Date().getFullYear();
    const hasOngoing = items.some((item) => item.isOngoing);
    if (hasOngoing) {
        years.push(currentYear);
    }

    return {
        minYear: Math.min(...years),
        maxYear: Math.max(...years, currentYear)
    };
}
