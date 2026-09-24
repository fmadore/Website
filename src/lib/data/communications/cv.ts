/**
 * The talks as /cv prints them: the CV view of the summaries (see
 * `CvCommunication`), in the same date order as the summaries and the full
 * index. The CV sections read this rather than the summaries, which carry the
 * programmes, participants, excerpts and images the index pages need.
 */
import type { CvCommunication } from '$lib/types/communication';
import { sortByDate } from '$lib/utils/dataAggregation';
import { cvCommunications } from './cv.generated';

export const cvCommunicationsByDate: CvCommunication[] = sortByDate(cvCommunications);
