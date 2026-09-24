/**
 * The publications as /cv prints them: the CV view of the summaries (see
 * `CvPublication`), in the same order as the summaries and the full index:
 * newest first, forthcoming works above them. The CV section reads this rather than the summaries, which carry the
 * excerpts, tags, images and facet data the list pages need.
 */
import type { CvPublication } from '$lib/types/publication';
import { cvPublications } from './cv.generated';
import { sortPublicationsByDate } from './order';

export const cvPublicationsByDate: CvPublication[] = sortPublicationsByDate(cvPublications);
