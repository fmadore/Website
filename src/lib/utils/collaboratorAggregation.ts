import type { Contributor } from '$lib/types/contributor';
import type { Person, PersonAffiliation, Institution } from '$lib/types/person';
import type { Publication } from '$lib/types/publication';
import type { Communication } from '$lib/types/communication';
import type { LocationDatum, LocationCollaborator } from '$lib/data/geo';
import { author } from '$lib/data/siteConfig';
import { getContributorName } from '$lib/utils/contributor';

export type CollaboratorItem = { id: string; title: string; href: string };
export type UnresolvedCollaborator = {
	id: string;
	name: string;
	reason: string;
	items: CollaboratorItem[];
};
export type CollaboratorMapResult = {
	locations: LocationDatum[];
	unresolved: UnresolvedCollaborator[];
	totalPeople: number;
	mappedPeople: number;
	uncertainPeople: number;
};

/** Diacritics and punctuation vary across credited names; aliases handle other differences. */
export function collaboratorNameKey(name: string): string {
	return name
		.normalize('NFKD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim();
}

/** An observation establishes that year only. Undated evidence never establishes a tenure. */
export function affiliationAppliesInYear(affiliation: PersonAffiliation, year: number): boolean {
	if (affiliation.years) return affiliation.years.includes(year);
	if (affiliation.startYear === undefined && affiliation.endYear === undefined) return false;
	// An end date without a start date does not establish an unlimited past appointment.
	if (affiliation.startYear === undefined) return affiliation.endYear === year;
	return (
		year >= affiliation.startYear &&
		(affiliation.endYear === undefined || year <= affiliation.endYear)
	);
}

type Credit = { contributor: Contributor; affiliation?: string };
type Collaboration = { year: number; item: CollaboratorItem; credits: Credit[] };

function aggregateCollaborators(
	records: Collaboration[],
	people: readonly Person[],
	institutions: readonly Institution[],
	year: number | undefined,
	includeUncertain: boolean
): CollaboratorMapResult {
	const peopleById = new Map(people.map((person) => [person.id, person]));
	const peopleByName = new Map<string, Person>();
	for (const person of people) {
		for (const name of [person.name, ...(person.aliases ?? [])])
			peopleByName.set(collaboratorNameKey(name), person);
	}
	const institutionsById = new Map(
		institutions.map((institution) => [institution.id, institution])
	);
	const institutionsByName = new Map<string, Institution>();
	for (const institution of institutions) {
		for (const name of [institution.name, ...(institution.aliases ?? [])])
			institutionsByName.set(collaboratorNameKey(name), institution);
	}
	const groups = new Map<
		string,
		{ institution: Institution; people: Map<string, LocationCollaborator> }
	>();
	const missing = new Map<string, UnresolvedCollaborator>();
	const allIds = new Set<string>();
	const mappedIds = new Set<string>();
	const uncertainIds = new Set<string>();
	const ownerKey = collaboratorNameKey(author.name);

	for (const record of records) {
		if (year !== undefined && record.year !== year) continue;
		const creditsByPerson = new Map<
			string,
			{ name: string; person?: Person; explicitId?: string; credits: Credit[] }
		>();
		for (const credit of record.credits) {
			if (typeof credit.contributor !== 'string' && credit.contributor.kind === 'organisation')
				continue;
			const name = getContributorName(credit.contributor);
			if (collaboratorNameKey(name) === ownerKey) continue;
			const explicitId =
				typeof credit.contributor === 'string' ? undefined : credit.contributor.personId;
			// An invalid explicit id is an error to expose, never a reason to merge another person.
			const person = explicitId
				? peopleById.get(explicitId)
				: peopleByName.get(collaboratorNameKey(name));
			if (person && collaboratorNameKey(person.name) === ownerKey) continue;
			const id = person?.id ?? explicitId ?? collaboratorNameKey(name);
			if (!id) continue;
			const entry = creditsByPerson.get(id) ?? { name, person, explicitId, credits: [] };
			entry.credits.push(credit);
			creditsByPerson.set(id, entry);
		}
		for (const [id, { name, person, explicitId, credits }] of creditsByPerson) {
			allIds.add(id);
			let affiliations =
				person?.affiliations.filter((entry) => affiliationAppliesInYear(entry, record.year)) ?? [];
			if (!affiliations.length && (person || !explicitId)) {
				for (const credit of credits) {
					if (!credit.affiliation) continue;
					const institution = institutionsByName.get(collaboratorNameKey(credit.affiliation));
					if (institution && !affiliations.some((entry) => entry.institutionId === institution.id))
						affiliations.push({
							institutionId: institution.id,
							institution: institution.name,
							years: [record.year],
							confidence: 'uncertain',
							sources: [],
							note: 'Affiliation recorded in the event programme on this site; independent confirmation is pending.'
						});
				}
			}
			const verifiedInstitutions = new Set(
				affiliations
					.filter((entry) => entry.confidence === 'verified')
					.map((entry) => entry.institutionId ?? entry.institution)
			);
			// A corroborated observation supersedes the same uncertain observation, not conflicting evidence.
			affiliations = affiliations.filter(
				(entry) =>
					entry.confidence === 'verified' ||
					!verifiedInstitutions.has(entry.institutionId ?? entry.institution)
			);
			const reasons = new Set<string>();
			if (!affiliations.length)
				reasons.add(
					explicitId && !person
						? 'Person reference could not be resolved.'
						: `No affiliation recorded for ${record.year}.`
				);
			for (const affiliation of affiliations) {
				if (affiliation.confidence === 'uncertain') {
					uncertainIds.add(id);
					if (!includeUncertain) {
						reasons.add(
							`Uncertain affiliation for ${record.year}: ${affiliation.institution}. Include uncertain affiliations to map it where a campus location is recorded.`
						);
						continue;
					}
				}
				const institution = affiliation.institutionId
					? institutionsById.get(affiliation.institutionId)
					: undefined;
				const coordinates = institution?.coordinates;
				if (
					!institution ||
					!coordinates ||
					!Number.isFinite(coordinates.latitude) ||
					!Number.isFinite(coordinates.longitude) ||
					Math.abs(coordinates.latitude) > 90 ||
					Math.abs(coordinates.longitude) > 180
				) {
					reasons.add(`${affiliation.institution}: no campus location recorded yet.`);
					continue;
				}
				let group = groups.get(institution.id);
				if (!group) {
					group = { institution, people: new Map() };
					groups.set(institution.id, group);
				}
				let collaborator = group.people.get(id);
				if (!collaborator) {
					collaborator = {
						id,
						name: person?.name ?? name,
						confidence: affiliation.confidence,
						items: []
					};
					group.people.set(id, collaborator);
				}
				// All-years views must not hide an uncertain historical attribution behind a later verification.
				if (affiliation.confidence === 'uncertain') collaborator.confidence = 'uncertain';
				if (!collaborator.items.some((item) => item.href === record.item.href))
					collaborator.items.push(record.item);
				mappedIds.add(id);
			}
			if (reasons.size) {
				const reason = [...reasons].join(' ');
				const key = `${id}\u0000${reason}`;
				const unresolved = missing.get(key) ?? {
					id,
					name: person?.name ?? name,
					reason,
					items: []
				};
				if (!unresolved.items.some((item) => item.href === record.item.href))
					unresolved.items.push(record.item);
				missing.set(key, unresolved);
			}
		}
	}
	const locations = [...groups.values()]
		.map(({ institution, people: groupedPeople }): LocationDatum => {
			const collaborators = [...groupedPeople.values()].sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const items = [
				...new Map(
					collaborators.flatMap((person) => person.items).map((item) => [item.href, item])
				).values()
			];
			return {
				id: institution.id,
				label: `${institution.name} · ${institution.city}`,
				country: institution.country,
				count: collaborators.length,
				coordinates: {
					lat: institution.coordinates.latitude,
					lng: institution.coordinates.longitude
				},
				items,
				collaborators
			};
		})
		.sort((a, b) => b.count - a.count || a.label!.localeCompare(b.label!));
	return {
		locations,
		unresolved: [...missing.values()].sort(
			(a, b) => a.name.localeCompare(b.name) || a.reason.localeCompare(b.reason)
		),
		totalPeople: allIds.size,
		mappedPeople: mappedIds.size,
		uncertainPeople: uncertainIds.size
	};
}

export function buildPublicationCollaborators(
	publications: readonly Publication[],
	people: readonly Person[],
	institutions: readonly Institution[],
	year?: number,
	includeUncertain = false
): CollaboratorMapResult {
	return aggregateCollaborators(
		publications.map((publication) => ({
			year: publication.year,
			item: {
				id: publication.id,
				title: publication.title,
				href: `/publications/${publication.id}`
			},
			credits: publication.authors.map((contributor) => ({ contributor }))
		})),
		people,
		institutions,
		year,
		includeUncertain
	);
}

export function buildCommunicationCollaborators(
	communications: readonly Communication[],
	people: readonly Person[],
	institutions: readonly Institution[],
	year?: number,
	includeUncertain = false
): CollaboratorMapResult {
	return aggregateCollaborators(
		communications.map((communication) => ({
			year: communication.year,
			item: {
				id: communication.id,
				title: communication.title,
				href: `/communications/${communication.id}`
			},
			credits: [
				...(communication.papers ?? []).flatMap((paper) =>
					paper.authors.map((contributor) => ({
						contributor,
						affiliation: contributor.affiliation
					}))
				),
				...(communication.participants ?? []).map((contributor) => ({
					contributor,
					affiliation: contributor.affiliation
				})),
				...communication.authors.map((contributor) => ({ contributor }))
			]
		})),
		people,
		institutions,
		year,
		includeUncertain
	);
}
