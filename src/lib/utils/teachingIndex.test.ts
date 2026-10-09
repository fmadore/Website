import { describe, it, expect } from 'vitest';
import {
	courseSpan,
	groupLecturesByInstitution,
	hostPeriod,
	lectureHosts,
	lectureSpan,
	yearSpan
} from './teachingIndex';

const lectures = [
	{ year: '2022', institution: 'Bayreuth', title: 'a' },
	{ year: '2016', institution: 'Laval', title: 'b' },
	{ year: '2020', institution: 'Florida', title: 'c' },
	{ year: '2017', institution: 'Laval', title: 'd' },
	{ year: '2014', institution: 'Laval', title: 'e' }
];

describe('spans', () => {
	it('run from the first to the last year, and are empty with nothing on record', () => {
		expect(yearSpan(['2020', '2016', '2018'])).toBe('2016–2020');
		expect(yearSpan([])).toBe('');
		expect(lectureSpan(lectures)).toBe('2014–2022');
	});

	it('count a course’s span end to end', () => {
		expect(courseSpan([{ year: '2020' }, { year: '2016-2017' }])).toBe('2016–2020');
		expect(courseSpan([])).toBe('');
	});
});

describe('guest lectures by host', () => {
	it('group in the dataset’s order', () => {
		expect(
			groupLecturesByInstitution(lectures).map((group) => [
				group.institution,
				group.lectures.map((lecture) => lecture.title)
			])
		).toEqual([
			['Bayreuth', ['a']],
			['Laval', ['b', 'd', 'e']],
			['Florida', ['c']]
		]);
	});

	it('count each host and its first and last year', () => {
		expect(lectureHosts(lectures)).toEqual([
			{ institution: 'Bayreuth', count: 1, from: '2022', to: '2022' },
			{ institution: 'Laval', count: 3, from: '2014', to: '2017' },
			{ institution: 'Florida', count: 1, from: '2020', to: '2020' }
		]);
	});

	it('print a single year once and a range with an en dash', () => {
		expect(hostPeriod({ from: '2022', to: '2022' })).toBe('2022');
		expect(hostPeriod({ from: '2014', to: '2017' })).toBe('2014–2017');
	});
});
