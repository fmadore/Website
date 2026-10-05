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
	/** Shown to readers: only a qualification they should not take at face value. */
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
	/** Shown to readers beside the affiliation: a short caveat, such as conflicting sources. */
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
	/** Shown to readers when no affiliation applies, e.g. an unaffiliated scholar. */
	note?: string;
	/** Curator provenance: unresolved identities and research trail. Never rendered. */
	reviewNote?: string;
};
