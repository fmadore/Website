import { describe, it, expect } from 'vitest';
import {
	cvEventDate,
	formatCvEditionDate,
	groupFieldworkByPlace,
	invitedTalkVenue,
	isCvPublication,
	lectureHostAndLevel,
	organisedPanelTitle,
	parseProjectYears,
	realEditorialMemberships,
	realPeerReviews,
	sortCoursesByYear,
	sortDhProjectsByRecency,
	splitCvTalks,
	splitEducation,
	talkAsLecture,
	teachingLectures,
	teachingLevelLabel
} from './cvSections';
import type { CvCommunication } from '$lib/types/communication';

describe('formatCvEditionDate', () => {
	it('prints the build date in British form, in UTC', () => {
		expect(formatCvEditionDate(new Date('2026-10-08T23:30:00Z'))).toBe('8 October 2026');
	});
});

describe('splitEducation', () => {
	it('splits by type in the dataset’s order, with untyped records under other', () => {
		const entries = [
			{ id: 'a', type: 'Degree' },
			{ id: 'b', type: 'Training' },
			{ id: 'c' },
			{ id: 'd', type: 'Certificate' },
			{ id: 'e', type: 'Degree' },
			{ id: 'f', type: 'Language course' }
		];
		const { degrees, trainings, certificates, other } = splitEducation(entries);
		expect(degrees.map((entry) => entry.id)).toEqual(['a', 'e']);
		expect(trainings.map((entry) => entry.id)).toEqual(['b']);
		expect(certificates.map((entry) => entry.id)).toEqual(['d']);
		expect(other.map((entry) => entry.id)).toEqual(['c', 'f']);
	});
});

describe('isCvPublication', () => {
	it('leaves theses out of the publication list', () => {
		expect(isCvPublication({ type: 'article' })).toBe(true);
		expect(isCvPublication({ type: 'book' })).toBe(true);
		expect(isCvPublication({ type: 'phd-dissertation' })).toBe(false);
		expect(isCvPublication({ type: 'masters-thesis' })).toBe(false);
	});
});

describe('digital humanities projects', () => {
	it('parse a span, an open range and a single year', () => {
		expect(parseProjectYears('2018-2023')).toEqual({ start: 2018, end: 2023 });
		expect(parseProjectYears('2023-')).toEqual({ start: 2023, end: Infinity });
		expect(parseProjectYears('2021')).toEqual({ start: 2021, end: 2021 });
	});

	it('sort by start year, then ongoing before closed, then title, on a copy', () => {
		const projects = [
			{ title: 'Long', years: '2018-2024' },
			{ title: 'Closed', years: '2023' },
			{ title: 'Ongoing', years: '2023-' },
			{ title: 'Alpha', years: '2023' }
		];
		const sorted = sortDhProjectsByRecency(projects);
		expect(sorted.map((project) => project.title)).toEqual(['Ongoing', 'Alpha', 'Closed', 'Long']);
		expect(projects[0]!.title).toBe('Long');
	});
});

describe('talks', () => {
	const talk = (id: string, type: CvCommunication['type']) => ({ id, type });

	it('split by type into the CV’s sections, keeping order', () => {
		const sections = splitCvTalks([
			talk('l', 'lecture'),
			talk('c1', 'conference'),
			talk('s', 'seminar'),
			talk('p', 'panel'),
			talk('w', 'workshop'),
			talk('po', 'poster'),
			talk('e', 'event'),
			talk('pod', 'podcast'),
			talk('c2', 'conference'),
			talk('none', undefined)
		]);
		const ids = Object.fromEntries(
			Object.entries(sections).map(([name, list]) => [name, list.map((item) => item.id)])
		);
		expect(ids).toEqual({
			invited: ['l', 's', 'w'],
			panels: ['p'],
			papers: ['c1', 'c2'],
			posters: ['po'],
			events: ['e'],
			podcasts: ['pod'],
			teaching: []
		});
	});

	it('hold a talk given as teaching back from every talk section, for Teaching alone', () => {
		const taught = { institution: 'EHESS (France)' };
		const sections = splitCvTalks([
			{ id: 'l', type: 'lecture' as const },
			{ id: 'taught', type: 'lecture' as const, teaching: taught },
			{ id: 'w', type: 'workshop' as const, teaching: taught }
		]);
		expect(sections.invited.map((item) => item.id)).toEqual(['l']);
		expect(sections.teaching.map((item) => item.id)).toEqual(['taught', 'w']);
	});

	it('print an invited talk’s venue only when the title does not already name it', () => {
		expect(
			invitedTalkVenue({
				title: 'University of Kansas AI and Africa Symposium',
				conference: 'AI and Africa Symposium'
			})
		).toBe('');
		expect(invitedTalkVenue({ title: 'Archives and algorithms', conference: 'Seminar' })).toBe(
			'Seminar'
		);
		expect(invitedTalkVenue({ title: 'Untitled', conference: '' })).toBe('');
	});

	it('list an organised panel under its own title when it has one', () => {
		expect(organisedPanelTitle({ title: 'ECAS 2025', panelTitle: 'DH and AI' })).toBe('DH and AI');
		expect(organisedPanelTitle({ title: 'ECAS 2025' })).toBe('ECAS 2025');
	});

	it('date an event: a range keeps its form without the year, a day is day and month', () => {
		expect(cvEventDate({ date: '12-14 March 2026', dateISO: '2026-03-12' })).toBe('12-14 March');
		expect(cvEventDate({ date: '23 September 2025', dateISO: '2025-09-23' })).toBe('23 September');
	});
});

describe('teaching', () => {
	it('sorts courses by the first year of their span, newest first, on a copy', () => {
		const courses = [{ year: '2016' }, { year: '2019-2020' }, { year: '2017-2018' }];
		expect(sortCoursesByYear(courses).map((course) => course.year)).toEqual([
			'2019-2020',
			'2017-2018',
			'2016'
		]);
		expect(courses[0]!.year).toBe('2016');
	});

	const lecture = (title: string, dateISO: string) => ({
		year: dateISO.slice(0, 4),
		title,
		course: 'Course',
		institution: 'Université Laval (Canada)',
		level: 'graduate' as const,
		date: dateISO,
		dateISO
	});
	const talk = (
		id: string,
		dateISO: string,
		teaching?: { institution: string; course?: string }
	) => ({
		id,
		title: `Talk ${id}`,
		conference: 'Atelier',
		date: '19 July 2023',
		dateISO,
		teaching
	});

	it('read a talk given as teaching as a lecture, its course defaulting to the venue', () => {
		expect(talkAsLecture(talk('t', '2023-07-19', { institution: 'UJKZ (Burkina Faso)' }))).toEqual({
			year: '2023',
			title: 'Talk t',
			course: 'Atelier',
			institution: 'UJKZ (Burkina Faso)',
			level: undefined,
			date: '19 July 2023',
			dateISO: '2023-07-19',
			talkId: 't'
		});
		expect(
			talkAsLecture(talk('z', '2019-06-07', { institution: 'UAO', course: 'Formation' })).course
		).toBe('Formation');
	});

	it('merge guest lectures with the talks given as teaching, newest first by date', () => {
		const merged = teachingLectures(
			[lecture('2019 lecture', '2019-09-05'), lecture('2017 lecture', '2017-02-28')],
			[
				talk('given', '2025-05-20'),
				talk('june', '2019-06-07', { institution: 'UAO' }),
				talk('may', '2025-05-12', { institution: 'EHESS (France)' })
			]
		);
		expect(merged.map((row) => row.title)).toEqual([
			'Talk may',
			'2019 lecture',
			'Talk june',
			'2017 lecture'
		]);
	});

	it('print the host, and the level only when it is on record', () => {
		expect(lectureHostAndLevel({ institution: 'Laval', level: 'graduate' })).toBe(
			'Laval, Graduate'
		);
		expect(lectureHostAndLevel({ institution: 'LASDEL (Niger)' })).toBe('LASDEL (Niger)');
	});

	it('labels the level', () => {
		expect(teachingLevelLabel('undergraduate')).toBe('Undergraduate');
		expect(teachingLevelLabel('graduate')).toBe('Graduate');
	});
});

describe('groupFieldworkByPlace', () => {
	it('keys each place by every year on site, newest first, places alphabetically', () => {
		expect(
			groupFieldworkByPlace([
				{ city: 'Lomé', country: 'Togo', date: 'March 2019', year: 2019 },
				{
					city: 'Abidjan',
					country: "Côte d'Ivoire",
					date: 'November 2014 - April 2015',
					year: 2014
				},
				{ city: 'Abidjan', country: "Côte d'Ivoire", date: 'Summer', year: 2024 },
				{ city: 'Lomé', country: 'Togo', date: 'May 2019', year: 2019 }
			])
		).toEqual([
			{ location: "Abidjan, Côte d'Ivoire", years: [2024, 2015, 2014] },
			{ location: 'Lomé, Togo', years: [2019] }
		]);
	});
});

describe('service', () => {
	it('drops the template records', () => {
		expect(
			realPeerReviews([
				{ id: 'politique-africaine-2022', journal: 'Politique africaine' },
				{ id: 'peer-review-template', journal: 'Politique africaine' },
				{ id: 'placeholder', journal: 'Journal Name' },
				{ id: 'book-2024' }
			]).map((review) => review.id)
		).toEqual(['politique-africaine-2022', 'book-2024']);
		expect(
			realEditorialMemberships([{ id: 'rhca-2025' }, { id: 'membership-template' }]).map(
				(membership) => membership.id
			)
		).toEqual(['rhca-2025']);
	});
});
