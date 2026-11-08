import { describe, expect, it } from 'vitest';
import { CV_SECTIONS, type CvPayload } from '#lib/apiContract.ts';
import { PUBLICATION_TYPE_BADGE_LABELS } from '#lib/utils/publicationTypeLabels.ts';
import { COMMUNICATION_TYPE_BADGE_LABELS } from '#lib/utils/typeUtils.ts';
import {
	COMMUNICATION_TYPES,
	PUBLICATION_TYPES,
	cvEntryCount,
	cvOverview,
	cvSection,
	dhProjectList,
	researchProjectList
} from './apiViews';

describe('type vocabularies', () => {
	it('are the label registries’ keys', () => {
		expect(PUBLICATION_TYPES).toEqual(Object.keys(PUBLICATION_TYPE_BADGE_LABELS));
		expect(COMMUNICATION_TYPES).toEqual(Object.keys(COMMUNICATION_TYPE_BADGE_LABELS));
	});
});

describe('researchProjectList', () => {
	it('drops the narrative and says how long it is', () => {
		const list = researchProjectList([{ id: 'p', title: 'P', body: 'four' }, { id: 'q' }]);
		expect(list).toEqual({
			count: 2,
			items: [
				{ id: 'p', title: 'P', bodyChars: 4 },
				{ id: 'q', bodyChars: 0 }
			]
		});
	});
});

describe('dhProjectList', () => {
	const records = [
		{
			id: 'iwac',
			group: 'project',
			description: '<p>Long</p>',
			embeddableContent: [{ src: 'x' }],
			seoTitle: 's',
			seoDescription: 'd',
			seoKeywords: 'k',
			skills: ['Omeka']
		},
		{ id: 'app', group: 'software', application: { status: 'beta' } }
	];

	it('drops descriptions, embeds and search-engine copy', () => {
		expect(dhProjectList(records).items[0]).toEqual({
			id: 'iwac',
			group: 'project',
			skills: ['Omeka'],
			descriptionChars: 11
		});
	});

	it('filters by group', () => {
		expect(dhProjectList(records, 'software')).toEqual({
			count: 1,
			items: [
				{ id: 'app', group: 'software', application: { status: 'beta' }, descriptionChars: 0 }
			]
		});
	});
});

describe('CV views', () => {
	const cv = {
		version: 1,
		person: { name: 'F. M.' },
		sections: {
			grants: [{}, {}],
			teaching: { courses: [{}], guestLectures: [{}, {}, {}] }
		}
	} as unknown as CvPayload;

	it('counts lists and lists of lists', () => {
		expect(cvEntryCount([1, 2])).toBe(2);
		expect(cvEntryCount({ a: [1], b: [2, 3] })).toBe(3);
		expect(cvEntryCount(undefined)).toBe(0);
	});

	it('gives the person and every section’s size', () => {
		const overview = cvOverview(cv);
		expect(overview.person).toEqual({ name: 'F. M.' });
		expect(Object.keys(overview.sections)).toEqual([...CV_SECTIONS]);
		expect(overview.sections.grants).toBe(2);
		expect(overview.sections.teaching).toBe(4);
		expect(overview.sections.consulting).toBe(0);
	});

	it('returns one section, empty when absent', () => {
		expect(cvSection(cv, 'grants')).toEqual({ section: 'grants', entries: [{}, {}] });
		expect(cvSection(cv, 'awards')).toEqual({ section: 'awards', entries: [] });
	});
});
