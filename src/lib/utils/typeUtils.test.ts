import { describe, it, expect } from 'vitest';
import { allCommunicationSummaries } from '#lib/data/communications/summaries.ts';
import { allActivitySummaries } from '#lib/data/activities/summaries.ts';
import {
	ACTIVITY_TYPE_BADGE_LABELS,
	ACTIVITY_TYPE_SEO_LABELS,
	COMMUNICATION_TYPE_BADGE_LABELS,
	COMMUNICATION_TYPE_CHART_LABELS,
	COMMUNICATION_TYPE_CHIP_LABELS,
	COMMUNICATION_TYPE_LIST_LABELS,
	COMMUNICATION_TYPE_SEO_LABELS,
	activityTypeSeoLabel,
	communicationTypeSeoLabel,
	isActivityType
} from './typeUtils';

/**
 * The talk and activity label registers, held to the corpus.
 *
 * The registers are complete over `CommunicationType` and `ActivityType` by
 * construction (`satisfies Record<…, string>`), so what remains to prove is
 * that the unions are the corpus: every type a record actually uses is in its
 * union, and therefore labelled in every register. Before the registers were
 * typed, three podcast talks fell back to "Academic presentation" and three
 * activity types to "Academic update" in their meta descriptions.
 */

const COMMUNICATION_REGISTERS = {
	BADGE: COMMUNICATION_TYPE_BADGE_LABELS,
	SEO: COMMUNICATION_TYPE_SEO_LABELS,
	LIST: COMMUNICATION_TYPE_LIST_LABELS,
	CHIP: COMMUNICATION_TYPE_CHIP_LABELS,
	CHART: COMMUNICATION_TYPE_CHART_LABELS
};

const ACTIVITY_REGISTERS = {
	BADGE: ACTIVITY_TYPE_BADGE_LABELS,
	SEO: ACTIVITY_TYPE_SEO_LABELS
};

const used = (types: (string | undefined)[]) =>
	[...new Set(types.filter((type): type is string => Boolean(type)))].sort();

const talkTypes = used(allCommunicationSummaries.map((talk) => talk.type));
const activityTypes = used(allActivitySummaries.map((activity) => activity.type));

describe('talk type registers', () => {
	it('reads a plausible set of types off the dataset', () => {
		expect(talkTypes.length).toBeGreaterThanOrEqual(6);
	});

	it.each(Object.entries(COMMUNICATION_REGISTERS))('%s labels every type in use', (_, register) => {
		for (const type of talkTypes) expect(register[type], type).toBeTruthy();
	});

	it('keeps every register over the same key set', () => {
		const keys = Object.keys(COMMUNICATION_TYPE_BADGE_LABELS).sort();
		for (const register of Object.values(COMMUNICATION_REGISTERS)) {
			expect(Object.keys(register).sort()).toEqual(keys);
		}
	});

	it('labels a podcast as a podcast in a meta description', () => {
		expect(communicationTypeSeoLabel('podcast')).toBe('Podcast episode');
		expect(communicationTypeSeoLabel(undefined)).toBeUndefined();
	});
});

describe('activity type registers', () => {
	it('reads a plausible set of types off the dataset', () => {
		expect(activityTypes.length).toBeGreaterThanOrEqual(6);
	});

	it('knows every type the activity records use', () => {
		for (const type of activityTypes) expect(isActivityType(type), type).toBe(true);
	});

	it.each(Object.entries(ACTIVITY_REGISTERS))('%s labels every type in use', (_, register) => {
		for (const type of activityTypes) expect(register[type], type).toBeTruthy();
	});

	it('keeps every register over the same key set', () => {
		expect(Object.keys(ACTIVITY_TYPE_SEO_LABELS).sort()).toEqual(
			Object.keys(ACTIVITY_TYPE_BADGE_LABELS).sort()
		);
	});

	it('looks a label up by the plain string the record stores, undefined when unknown', () => {
		expect(activityTypeSeoLabel('career')).toBe('Career news');
		expect(activityTypeSeoLabel('presentation')).toBe('Presentation');
		expect(activityTypeSeoLabel('toString')).toBeUndefined();
		expect(activityTypeSeoLabel('unknown')).toBeUndefined();
		expect(activityTypeSeoLabel(undefined)).toBeUndefined();
	});
});
