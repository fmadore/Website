/**
 * Markdown twins of the teaching pages: `/teaching.md`, the courses taught and
 * the guest lectures indexed by host, and `/teaching/guest-lectures.md`, every
 * guest lecture under the institution that hosted it.
 *
 * Ordered and counted as the pages are: the course sort is `CVTeaching`'s
 * (`$lib/utils/cvSections`), the spans and host groupings are
 * `$lib/utils/teachingIndex`'s, and each page's standfirst is read from its
 * own markup.
 */
import type { GuestLecture, TeachingExperience } from '$lib/types/teachingExperience';
import { sortCoursesByYear, teachingLevelLabel } from '$lib/utils/cvSections';
import {
	courseSpan,
	groupLecturesByInstitution,
	hostPeriod,
	lectureHosts,
	lectureSpan
} from '$lib/utils/teachingIndex';
import { bullets, document, entries, inline, link, section } from './markdown';
import { markdownUrl, pageUrl, resolveLink, SITE } from './site';
import { pageProseMarkdown } from './svelteProse';

const lectureCount = (count: number) => `${count} ${count === 1 ? 'lecture' : 'lectures'}`;

/** One course: term, title, host, level, then its description and syllabus. */
function courseRow(course: TeachingExperience): string {
	const level = [teachingLevelLabel(course.level), course.sections].filter(Boolean).join(', ');
	const lines = [
		`**${inline(course.period ?? course.year)}** ${inline(course.title)}, ${inline(course.institution)}. ${inline(level)}.`,
		course.description && inline(course.description),
		course.syllabusUrl && link('Syllabus (PDF)', resolveLink(course.syllabusUrl))
	];
	return lines.filter(Boolean).join('\n');
}

/** `/teaching.md` */
export function teachingMarkdown(
	courses: readonly TeachingExperience[],
	lectures: readonly GuestLecture[]
): string {
	const sorted = sortCoursesByYear(courses);
	const hosts = lectureHosts(lectures);
	const span = courseSpan(sorted);

	return document(
		'# Teaching',
		pageProseMarkdown('/src/routes/teaching/+page.svelte', 'PageIntro'),
		`The [web page](${pageUrl('/teaching')}) prints the same record, and the [CV](${markdownUrl('/cv')}) lists it too. The same records are available as JSON at ${SITE}/api/cv.json.`,
		section(
			'Courses taught',
			sorted.length > 0 && `${entries(sorted.length)}${span ? `, ${span}` : ''}.`,
			bullets(sorted.map(courseRow))
		),
		section(
			'Guest lectures',
			lectures.length > 0 &&
				`${lectureCount(lectures.length)}, ${lectureSpan(lectures)}: invited talks in colleagues’ courses, indexed here by host institution. The [full list](${markdownUrl('/teaching/guest-lectures')}) gives each lecture.`,
			bullets(
				hosts.map(
					(host) =>
						`**${inline(hostPeriod(host))}** ${inline(host.institution)}, ${lectureCount(host.count)}`
				)
			)
		)
	);
}

/** `/teaching/guest-lectures.md` */
export function guestLecturesMarkdown(lectures: readonly GuestLecture[]): string {
	const groups = groupLecturesByInstitution(lectures);
	const institutions = `${groups.length} ${groups.length === 1 ? 'institution' : 'institutions'}`;

	return document(
		'# Guest lectures',
		pageProseMarkdown('/src/routes/teaching/guest-lectures/+page.svelte', 'PageIntro'),
		lectures.length > 0 &&
			`${lectureCount(lectures.length)}, ${institutions}, ${lectureSpan(lectures)}. The [web page](${pageUrl('/teaching/guest-lectures')}) prints the same list; the [teaching page](${markdownUrl('/teaching')}) has the courses taught.`,
		...groups.map((group) =>
			section(
				inline(group.institution),
				`${lectureCount(group.lectures.length)}.`,
				bullets(
					group.lectures.map(
						(lecture) =>
							`**${inline(lecture.date)}** ${inline(lecture.title)}, in the course *${inline(lecture.course)}* (${teachingLevelLabel(lecture.level)}).`
					)
				)
			)
		)
	);
}
