/**
 * The two CV sections whose records have no dataset of their own elsewhere on
 * the site. Their data lives in `$lib/data/consulting.ts` and
 * `$lib/data/computerSkills.ts`, read by the CV page and its Markdown twin.
 */

/** A consulting engagement ("Consulting and legal expertise"). */
export interface ConsultingEngagement {
	/** The ledger key: a year or an open range ("2025–"). */
	year: string;
	role: string;
	organization: string;
	/** One sentence per line of the entry. */
	descriptions: string[];
}

/** A category of computer skills, the key of its ledger row ("Computer skills"). */
export interface SkillGroup {
	category: string;
	/** The skills as printed: a comma-separated list. */
	skills: string;
}
