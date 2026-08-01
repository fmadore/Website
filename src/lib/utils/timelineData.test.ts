import { describe, expect, it } from 'vitest';
import type { Appointment } from '$lib/types/appointment';
import type { Education } from '$lib/types/education';
import type { Grant } from '$lib/types/grant';
import type { Publication } from '$lib/types/publication';
import type { Communication } from '$lib/types/communication';
import type { Award } from '$lib/types/award';
import type { Fieldwork } from '$lib/types/fieldwork';
import {
	appointmentToTimelineItem,
	educationToTimelineItem,
	grantToTimelineItem,
	publicationToTimelineItem,
	communicationToTimelineItem,
	awardToTimelineItem,
	fieldworkToTimelineItem,
	getAllTimelineItems,
	getTimelineItemsByCategory,
	getTimelineYearRange
} from './timelineData';

describe('timeline data transformations', () => {
	it('represents ongoing appointments and grants without an end date', () => {
		const appointment: Appointment = {
			id: 'appointment',
			title: 'Researcher',
			institution: 'Institute',
			location: 'Berlin',
			startYear: 2020,
			endYear: null,
			dateRangeString: '2020–Present',
			dateISOStart: '2020-01-01'
		};
		const grant: Grant = {
			id: 'grant',
			title: 'Research grant',
			funder: 'Foundation',
			projectTitle: 'Project',
			startYear: 2024,
			endYear: null,
			dateRangeString: '2024–Present',
			dateISOStart: '2024-01-01'
		};

		expect(appointmentToTimelineItem(appointment)).toMatchObject({
			category: 'positions',
			subtitle: 'Institute',
			description: 'Berlin',
			isOngoing: true,
			endDate: undefined
		});
		expect(grantToTimelineItem(grant)).toMatchObject({
			category: 'grants',
			subtitle: 'Foundation',
			description: 'Project',
			isOngoing: true,
			endDate: undefined
		});
	});

	it('preserves explicit end dates for completed ranges', () => {
		const result = appointmentToTimelineItem({
			id: 'past',
			title: 'Fellow',
			institution: 'Institute',
			startYear: 2020,
			endYear: 2022,
			dateRangeString: '2020–2022',
			dateISOStart: '2020-01-01',
			dateISOEnd: '2022-12-31'
		});

		expect(result.isOngoing).toBe(false);
		expect(result.endDate?.toISOString()).toContain('2022-12-31');
	});

	it('maps point-in-time academic records to their timeline categories', () => {
		const education: Education = {
			id: 'degree',
			degree: 'PhD',
			institution: 'University',
			year: 2018,
			type: 'Degree',
			thesisTitle: 'Thesis',
			dateISO: '2018-01-01'
		};
		const publication: Publication = {
			id: 'publication',
			type: 'article',
			title: 'Article',
			authors: ['Author'],
			date: '2023',
			dateISO: '2023-01-01',
			year: 2023,
			language: 'English',
			journal: 'Journal',
			doi: '10.1234/example'
		};
		const communication: Communication = {
			id: 'talk',
			title: 'Talk',
			authors: ['Author'],
			date: '2024',
			dateISO: '2024-02-01',
			year: 2024,
			conference: 'Conference',
			location: 'Paris',
			country: 'France'
		};
		const award: Award = {
			id: 'award',
			title: 'Prize',
			institution: 'Society',
			year: 2022,
			dateISO: '2022-01-01',
			details: 'Citation'
		};
		const fieldwork: Fieldwork = {
			id: 'fieldwork',
			city: 'Lomé',
			country: 'Togo',
			date: '2019',
			year: 2019,
			project: 'Project',
			description: 'Interviews'
		};

		expect(educationToTimelineItem(education)).toMatchObject({
			category: 'education',
			title: 'PhD',
			description: 'Thesis'
		});
		expect(publicationToTimelineItem(publication)).toMatchObject({
			category: 'publications',
			subtitle: 'Journal',
			url: 'https://doi.org/10.1234/example'
		});
		expect(communicationToTimelineItem(communication)).toMatchObject({
			category: 'presentations',
			subtitle: 'Conference',
			description: 'Paris'
		});
		expect(awardToTimelineItem(award)).toMatchObject({
			category: 'awards',
			subtitle: 'Society',
			description: 'Citation'
		});
		expect(fieldworkToTimelineItem(fieldwork)).toMatchObject({
			category: 'fieldwork',
			title: 'Lomé, Togo',
			subtitle: 'Project'
		});
	});
});

describe('timeline collections', () => {
	it('returns all records in chronological order', () => {
		const items = getAllTimelineItems();
		expect(items.length).toBeGreaterThan(0);
		expect(items.map(({ startDate }) => startDate.getTime())).toEqual(
			[...items].map(({ startDate }) => startDate.getTime()).sort((a, b) => a - b)
		);
	});

	it('filters by category and reports a valid year range', () => {
		const publications = getTimelineItemsByCategory('publications');
		expect(publications.length).toBeGreaterThan(0);
		expect(publications.every(({ category }) => category === 'publications')).toBe(true);

		const range = getTimelineYearRange();
		expect(range.minYear).toBeLessThanOrEqual(range.maxYear);
		expect(range.maxYear).toBeGreaterThanOrEqual(new Date().getFullYear());
	});
});
