// src/lib/utils/timelineData.ts
// Utility functions to transform various data types into TimelineItem format

import type { TimelineItem, TimelineCategory } from '#lib/types/timeline.ts';
import type { Appointment } from '#lib/types/appointment.ts';
import type { Education } from '#lib/types/education.ts';
import type { Grant } from '#lib/types/grant.ts';
import type { PublicationSummary } from '#lib/types/publication.ts';
import type { CommunicationSummary } from '#lib/types/communication.ts';
import type { Award } from '#lib/types/award.ts';
import type { Fieldwork } from '#lib/types/fieldwork.ts';

// Data imports
import { allAppointments } from '#lib/data/appointments/index.ts';
import { allEducation } from '#lib/data/education/index.ts';
import { allGrants } from '#lib/data/grants/index.ts';
// Both take the committed projections, not the full datasets: a card prints
// title, venue and date, and for a publication the opening of its abstract,
// which the summary carries as `abstractExcerpt`. The full index brought the
// abstracts and every recorded citation for that.
import { allPublicationSummaries as allPublications } from '#lib/data/publications/summaries.ts';
import { allCommunicationSummaries as allCommunications } from '#lib/data/communications/summaries.ts';
import { truncateAbstract } from '#lib/utils/textUtils.ts';
import { allAwards } from '#lib/data/awards/index.ts';
import { allFieldworks } from '#lib/data/fieldworks/index.ts';

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

/** The publication fields a timeline card reads. */
export type TimelinePublication = Pick<
	PublicationSummary,
	'id' | 'type' | 'title' | 'dateISO' | 'journal' | 'publisher' | 'book' | 'url' | 'doi'
> & { abstractExcerpt?: string };

/** How much of an abstract a timeline card prints. */
const TIMELINE_EXCERPT_LENGTH = 200;

/**
 * Transform a Publication to a TimelineItem
 */
export function publicationToTimelineItem(publication: TimelinePublication): TimelineItem {
	const date = new Date(publication.dateISO);

	return {
		id: publication.id,
		category: 'publications' as TimelineCategory,
		title: publication.title,
		subtitle: publication.journal || publication.publisher || publication.book,
		description: publication.abstractExcerpt
			? truncateAbstract(publication.abstractExcerpt, TIMELINE_EXCERPT_LENGTH)
			: undefined,
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
export function communicationToTimelineItem(communication: CommunicationSummary): TimelineItem {
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

const MONTHS = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december'
];

/**
 * When a fieldwork began, from its `date` string, as the first of that month
 * in UTC (the other records' ISO dates parse as UTC midnight too).
 *
 * The records give a month span — "November 2014 - April 2015",
 * "August - September 2024", "June 2024" — while `year` is the year it is
 * filed under, which for a span across a new year is the end. The start month
 * is the first month named; its year is the first year written after it. A
 * string with no month, or no year, falls back to 1 January of `year`.
 */
export function fieldworkStartDate(fieldwork: Pick<Fieldwork, 'date' | 'year'>): Date {
	const text = fieldwork.date.toLowerCase();
	const monthMatch = new RegExp(`\\b(${MONTHS.join('|')})\\b`).exec(text);
	if (!monthMatch) return new Date(Date.UTC(fieldwork.year, 0, 1));
	const yearMatch = /\b(\d{4})\b/.exec(text.slice(monthMatch.index));
	const year = yearMatch ? Number(yearMatch[1]) : fieldwork.year;
	return new Date(Date.UTC(year, MONTHS.indexOf(monthMatch[1]!), 1));
}

/**
 * Transform a Fieldwork to a TimelineItem
 */
export function fieldworkToTimelineItem(fieldwork: Fieldwork): TimelineItem {
	const date = fieldworkStartDate(fieldwork);

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
