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
	coordinateNote?: string;
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
	note?: string;
};

export type Person = {
	id: string;
	name: string;
	aliases?: string[];
	affiliations: PersonAffiliation[];
	orcid?: string;
	url?: string;
	/** Unresolved identities and conflicting evidence remain visible to reviewers. */
	note?: string;
};
