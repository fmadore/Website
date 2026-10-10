/**
 * Markdown twins of the teaching pages: `/teaching.md`, the courses taught and
 * the guest lectures and workshops indexed by host, and
 * `/teaching/guest-lectures.md`, every one of them under the institution that
 * hosted it. The lectures are the pages' rows: the guest lectures and the
 * talks given as teaching (`$lib/server/teachingLectures`).
 *
 * Ordered and counted as the pages are: the course sort is `CVTeaching`'s
 * (`$lib/utils/cvSections`), the spans and host groupings are
 * `$lib/utils/teachingIndex`'s, and each page's standfirst is read from its
 * own markup.
 */
import type { TeachingExperience, TeachingLecture } from '$lib/types/teachingExperience';
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

const lectureCount = (count: number) => `${count} ${count === 1 ? 'entry' : 'entries'}`;

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
	lectures: readonly TeachingLecture[]
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
			'Guest lectures and workshops',
			lectures.length > 0 &&
				`${lectureCount(lectures.length)}, ${lectureSpan(lectures)}: lectures and workshops given in colleagues’ courses, seminars and training programmes, indexed here by host institution. The [full list](${markdownUrl('/teaching/guest-lectures')}) gives each one.`,
			bullets(
				hosts.map(
					(host) =>
						`**${inline(hostPeriod(host))}** ${inline(host.institution)}, ${lectureCount(host.count)}`
				)
			)
		)
	);
}

/** One lecture: date, title, the course it was part of, its level when known, and its talk page. */
function lectureRow(lecture: TeachingLecture): string {
	const level = lecture.level ? ` (${teachingLevelLabel(lecture.level)})` : '';
	const talk = lecture.talkId
		? ` ${link('Talk', markdownUrl(`/communications/${lecture.talkId}`))}.`
		: '';
	return `**${inline(lecture.date)}** ${inline(lecture.title)}, in *${inline(lecture.course)}*${level}.${talk}`;
}

/** `/teaching/guest-lectures.md` */
export function guestLecturesMarkdown(lectures: readonly TeachingLecture[]): string {
	const groups = groupLecturesByInstitution(lectures);
	const institutions = `${groups.length} ${groups.length === 1 ? 'institution' : 'institutions'}`;

	return document(
		'# Guest lectures and workshops',
		pageProseMarkdown('/src/routes/teaching/guest-lectures/+page.svelte', 'PageIntro'),
		lectures.length > 0 &&
			`${lectureCount(lectures.length)}, ${institutions}, ${lectureSpan(lectures)}. The [web page](${pageUrl('/teaching/guest-lectures')}) prints the same list; the [teaching page](${markdownUrl('/teaching')}) has the courses taught.`,
		...groups.map((group) =>
			section(
				inline(group.institution),
				`${lectureCount(group.lectures.length)}.`,
				bullets(group.lectures.map(lectureRow))
			)
		)
	);
}
