/**
 * How the teaching pages summarise their two datasets: the span of years a
 * list covers, and the guest lectures grouped by the institution that hosted
 * them. `/teaching`, `/teaching/guest-lectures` and their Markdown twins
 * (`$lib/server/markdown/teaching.ts`) all count off these, so a page and its
 * twin cannot disagree about the same record.
 *
 * Pure and dataset-free: each function takes the records it summarises.
 */
import type { GuestLecture, TeachingExperience } from '$lib/types/teachingExperience';

/**
 * "2016–2020": the first and last of a set of years. An empty set has no
 * first and no last year, and printing the span anyway is how a page ends up
 * advertising "undefined–undefined", so it yields an empty string.
 */
export function yearSpan(years: readonly string[]): string {
	const sorted = [...years].sort();
	return sorted.length > 0 ? `${sorted[0]}–${sorted[sorted.length - 1]}` : '';
}

/** The years a set of courses covers, each course's span counted end to end. */
export function courseSpan(courses: readonly Pick<TeachingExperience, 'year'>[]): string {
	return yearSpan(courses.flatMap((course) => course.year.split('-')));
}

/** The years a set of guest lectures covers. */
export function lectureSpan(lectures: readonly Pick<GuestLecture, 'year'>[]): string {
	return yearSpan(lectures.map((lecture) => lecture.year));
}

/** Guest lectures by host institution, institutions and lectures in the dataset's order. */
export function groupLecturesByInstitution<T extends Pick<GuestLecture, 'institution'>>(
	lectures: readonly T[]
): Array<{ institution: string; lectures: T[] }> {
	const groups: Array<{ institution: string; lectures: T[] }> = [];
	for (const lecture of lectures) {
		const group = groups.find((candidate) => candidate.institution === lecture.institution);
		if (group) group.lectures.push(lecture);
		else groups.push({ institution: lecture.institution, lectures: [lecture] });
	}
	return groups;
}

/** A host institution as `/teaching` indexes it: how many lectures, over which years. */
export interface LectureHost {
	institution: string;
	count: number;
	from: string;
	to: string;
}

/** Each host institution with its lecture count and first and last year. */
export function lectureHosts(
	lectures: readonly Pick<GuestLecture, 'institution' | 'year'>[]
): LectureHost[] {
	return groupLecturesByInstitution(lectures).map(({ institution, lectures: hosted }) => {
		const years = hosted.map((lecture) => lecture.year).sort();
		return {
			institution,
			count: hosted.length,
			from: years[0]!,
			to: years[years.length - 1]!
		};
	});
}

/** "2016" for a single year, "2016–2022" for a range. */
export function hostPeriod(host: Pick<LectureHost, 'from' | 'to'>): string {
	return host.from === host.to ? host.from : `${host.from}–${host.to}`;
}
