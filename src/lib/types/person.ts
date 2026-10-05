/** Public institutional affiliations, with evidence kept separate from inference. */
export type AffiliationSource = {
	url: string;
	label: string;
	quote?: string;
};

export type Institution = {
	id: string;
	name: string;
	aliases?: string[];
	city: string;
	country: string;
	/** Institutional campus or office, never a person's home or a country centroid. */
	coordinates: { latitude: number; longitude: number };
	/** Curator qualification of the location (e.g. a campus standing in for an institution). Never rendered. */
	coordinateNote?: string;
	/** Date and method of the institutional location review, separate from affiliation dates. */
	coordinateQueriedOn?: string;
	coordinateSourceKind?: 'reviewed-institutional-osm-feature';
	osmFeature?: {
		type: 'node' | 'way' | 'relation';
		id: number;
		category: string;
		featureType: string;
	};
	sources: AffiliationSource[];
};

export type PersonAffiliation = {
	/** Omitted when an organisation has no verified institutional location. */
	institutionId?: string;
	institution: string;
	role?: string;
	/** Years explicitly supported by the cited publication or event. No tenure is inferred. */
	years?: number[];
	/** Use ranges only when the source establishes an appointment's duration. */
	startYear?: number;
	endYear?: number;
	confidence: 'verified' | 'uncertain';
	sources: AffiliationSource[];
	/** Curator caveat, such as conflicting sources. Never rendered: the map states affiliations, not their provenance. */
	note?: string;
	/** Curator provenance (how the evidence was found and checked). Never rendered. */
	reviewNote?: string;
};

export type Person = {
	id: string;
	name: string;
	aliases?: string[];
	affiliations: PersonAffiliation[];
	orcid?: string;
	url?: string;
	/** Curator note when no affiliation applies, e.g. an unaffiliated scholar. Never rendered. */
	note?: string;
	/** Curator provenance: unresolved identities and research trail. Never rendered. */
	reviewNote?: string;
};
