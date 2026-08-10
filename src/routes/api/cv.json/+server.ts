import type { RequestHandler } from '@sveltejs/kit';
import {
	author,
	address,
	contact,
	website,
	socialLinks,
	researchTopics
} from '$lib/data/siteConfig';
import { appointmentsByDate } from '$lib/data/appointments';
import { educationByDate } from '$lib/data/education';
import { grantsByDate } from '$lib/data/grants';
import { awardsByDate } from '$lib/data/awards';
import { editorialMembershipsByDate } from '$lib/data/editorial-memberships';
import { peerReviewsByDate } from '$lib/data/peer-reviews';
import { researchRolesByDate } from '$lib/data/research-roles';
import { affiliationsByStartDate } from '$lib/data/affiliations';
import { languagesByProficiency } from '$lib/data/languages';
import { fieldworksByDate } from '$lib/data/fieldworks';
import { mediaAppearancesByDate } from '$lib/data/media-appearances';
import teaching from '$lib/data/teaching';
import guestLectures from '$lib/data/teaching/guest-lectures';
import { absoluteUrl, API_VERSION, buildLinks, compact, jsonResponse } from '$lib/utils/apiPayload';

// Prerendered to build/api/cv.json alongside the rest of the site.
export const prerender = true;

/**
 * The CV categories are many and individually small (2–14 records each), so
 * they ship as one document keyed by section rather than a dozen endpoints.
 * Publications and talks stay in their own datasets — they are the large ones,
 * and a consumer that only wants the career record should not have to fetch them.
 */
export const GET: RequestHandler = async () => {
	const payload = {
		version: API_VERSION,
		dataset: 'cv',
		url: `${website.url}/api/cv.json`,
		person: {
			name: author.name,
			fullName: author.fullName,
			position: author.position,
			nationality: author.nationality,
			email: contact.email,
			url: website.url,
			affiliation: {
				institution: address.institution,
				department: address.department,
				city: address.city,
				country: address.country,
				url: address.institutionUrl
			},
			researchTopics,
			profiles: Object.values(socialLinks)
				.filter((link) => !link.url.startsWith('mailto:'))
				.map((link) => compact({ name: link.name, url: link.url, username: link.username }))
		},
		sections: {
			appointments: appointmentsByDate.map((item) => compact({ ...item })),
			education: educationByDate.map((item) => compact({ ...item })),
			researchRoles: researchRolesByDate.map((item) => compact({ ...item })),
			grants: grantsByDate.map((grant) =>
				compact({
					...grant,
					url: undefined,
					links: buildLinks([{ label: 'Grant', url: grant.url }])
				})
			),
			awards: awardsByDate.map((award) =>
				compact({
					...award,
					url: undefined,
					links: buildLinks([{ label: 'Award', url: award.url }])
				})
			),
			teaching: {
				courses: teaching.map((course) =>
					compact({
						...course,
						syllabusUrl: course.syllabusUrl ? absoluteUrl(course.syllabusUrl) : undefined
					})
				),
				guestLectures: guestLectures.map((lecture) => compact({ ...lecture }))
			},
			editorialMemberships: editorialMembershipsByDate.map((item) => compact({ ...item })),
			peerReviews: peerReviewsByDate.map((item) => compact({ ...item })),
			affiliations: affiliationsByStartDate.map((item) => compact({ ...item })),
			fieldworks: fieldworksByDate.map((fieldwork) =>
				compact({
					...fieldwork,
					image: fieldwork.image ? absoluteUrl(fieldwork.image) : undefined,
					heroImage: undefined
				})
			),
			mediaAppearances: mediaAppearancesByDate.map((appearance) =>
				compact({
					...appearance,
					url: undefined,
					links: buildLinks([{ label: 'Appearance', url: appearance.url }])
				})
			),
			languages: languagesByProficiency.map((item) => compact({ ...item }))
		}
	};

	return jsonResponse(payload);
};
