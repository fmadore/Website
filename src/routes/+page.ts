import { base } from '$app/paths';
import type { PageLoad } from './$types';
import { author, contact, website, address, socialLinks } from '$lib/data/siteConfig';
import type { PersonPageJsonLd } from '$lib/types/jsonld';

// --- Load Function ---
export const load: PageLoad = () => {
	const personJsonLd: PersonPageJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		'@id': `${website.url}/#person`, // Required for ProfilePage mainEntity reference
		name: author.name,
		honorificPrefix: 'Dr.', // Added prefix
		url: website.url,
		image: `${base}/images/Profile-picture.webp`,
		email: contact.email, // Added email
		jobTitle: author.positionShort, // Keep jobTitle for compatibility
		worksFor: {
			// Used worksFor key
			'@type': 'Organization',
			name: `${address.institution} (${address.institutionAbbreviation})`,
			url: address.institutionUrl
		},
		workLocation: {
			// Added work location
			'@type': 'Place',
			name: address.city
		},
		nationality: 'Canada', // Added nationality
		alumniOf: [
			// Added educational history
			{
				'@type': 'EducationalOrganization',
				name: 'Université Laval',
				url: 'https://www.ulaval.ca/en'
			}
			// Add University of Florida if desired
			// {
			//     "@type": "EducationalOrganization",
			//     "name": "University of Florida",
			//     "url": "https://www.ufl.edu/"
			// }
		],
		memberOf: [
			// Added membership
			{
				'@type': 'Organization', // Can also use ProgramMembership if more fitting
				name: 'Islam in Africa Studies Group (IASG)',
				url: 'https://iasg.hcommons.org/'
			}
		],
		hasCredential: [
			// Added credentials
			{
				'@type': 'EducationalOccupationalCredential',
				credentialCategory: 'degree',
				educationalLevel: 'Doctorate',
				name: 'Ph.D. in History'
			}
		],
		knowsLanguage: ['French', 'English', 'German'], // Added languages
		sameAs: [
			socialLinks.linkedIn.url,
			socialLinks.github.url,
			socialLinks.orcid.url,
			socialLinks.bluesky.url,
			socialLinks.googleScholar.url,
			socialLinks.researchGate.url,
			'https://hcommons.org/members/fmadore/', // Knowledge Commons
			'https://www.wikidata.org/wiki/Q55725595'
		],
		knowsAbout: [
			// Added topics
			'Islam',
			'West Africa',
			'Muslim Societies',
			'History',
			'Religious Activism',
			'Secularism',
			'Muslim Politics',
			'Digital Humanities',
			'Benin',
			'Togo',
			"Côte d'Ivoire",
			'Burkina Faso'
		]
	};

	// Return the Person schema as an object for use in additionalSchemas
	return {
		personSchema: personJsonLd
	};
};
