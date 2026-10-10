import guestLectures from '$lib/data/teaching/guest-lectures';
import { cvCommunicationsByDate } from '$lib/data/communications/cv';
import { teachingLectures } from '$lib/utils/cvSections';

/**
 * The guest lectures and the talks given as teaching, newest first: the list
 * `/teaching`, `/teaching/guest-lectures`, their Markdown twins and
 * `/api/cv.json` share with the CV's Teaching section. Server-side, so the
 * pages receive these rows rather than the talks they are drawn from.
 */
export const allLectures = teachingLectures(guestLectures, cvCommunicationsByDate);
