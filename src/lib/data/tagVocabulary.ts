/**
 * Controlled vocabulary for the free-text keyword fields: `tags` on
 * publications, talks and activities, and `skills` on digital-humanities
 * records.
 *
 * Tags are facet values and `?tag=` deep links, and the cross-dataset views
 * (tag clouds, the record rails, the API) join on the literal string, so one
 * concept spelled two ways is two facet values that never meet. Each map
 * below sends an alias to its canonical form. The records themselves carry
 * only canonical forms; `dataIntegrity.test.ts` fails on an alias in a record
 * and on two canonical values that fold to the same key, so a split cannot
 * regrow.
 *
 * Conventions for tags: Title Case; British spelling (`-isation`, `-ise`);
 * spelled-out names rather than acronyms for technical concepts (Artificial
 * Intelligence, Optical Character Recognition, …), while acronyms that are
 * names (IWAC, ZMO, MCP, DFG) stay as they are; plural for kinds of
 * institution or actor (Universities, Religious Organisations).
 *
 * Skills follow the same Title Case, but keep the acronyms a skills list is
 * read in (OCR, NLP, LLM), and product names keep their own casing (spaCy,
 * pandas, vLLM).
 *
 * Merge only true synonyms here. A broader/narrower pair (Entity Linking and
 * Entity Disambiguation, Decoloniality and Decolonisation) is two concepts.
 */
import { normalizeSearchText } from '#lib/utils/searchText.ts';

/** Tag alias → canonical tag. */
export const TAG_ALIASES: Readonly<Record<string, string>> = Object.freeze({
	// Spelled-out names for technical concepts.
	AI: 'Artificial Intelligence',
	LLM: 'Large Language Models',
	LLMs: 'Large Language Models',
	NER: 'Named Entity Recognition',
	'Named-Entity Recognition': 'Named Entity Recognition',
	NLP: 'Natural Language Processing',
	OCR: 'Optical Character Recognition',
	'Linked Data': 'Linked Open Data',
	// One name per organisation, in English.
	VolkswagenStiftung: 'Volkswagen Foundation',
	Hannover: 'Hanover',
	// Synonyms.
	Methodology: 'Research Methods',
	'Research Methodology': 'Research Methods',
	Campus: 'University Campuses',
	Collection: 'Digital Collections',
	Collections: 'Digital Collections',
	'Interreligious Relations': 'Interfaith Relations',
	'Historical Source Criticism': 'Source Criticism',
	Decolonial: 'Decoloniality',
	'Decolonial Approach': 'Decoloniality',
	'Muslim Preachers': 'Islamic Preachers',
	'Student Organisations': 'Student Associations',
	// Plural for kinds of institution.
	University: 'Universities',
	'Religious Organisation': 'Religious Organisations',
	// British spelling.
	Democratization: 'Democratisation',
	Mediatization: 'Mediatisation',
	Radicalization: 'Radicalisation',
	Securitization: 'Securitisation'
});

/** Skill alias → canonical skill. */
export const SKILL_ALIASES: Readonly<Record<string, string>> = Object.freeze({
	// Title Case, as the majority of the skills already were.
	'Agent skills': 'Agent Skills',
	'Audio transcription': 'Audio Transcription',
	'Data visualisation': 'Data Visualisation',
	'Digital exhibitions': 'Digital Exhibitions',
	'Inter-rater agreement': 'Inter-rater Agreement',
	'Interactive mapping': 'Interactive Mapping',
	'Network graphs': 'Network Graphs',
	'Open-weight models': 'Open-weight Models',
	'Semantic search': 'Semantic Search',
	'Sentiment analysis': 'Sentiment Analysis',
	'Web scraping': 'Web Scraping',
	// British spelling.
	'Data Visualization': 'Data Visualisation',
	'Topic Modeling': 'Topic Modelling'
});

function lookup(aliases: Readonly<Record<string, string>>, value: string): string {
	// `hasOwn`, so `toString` and friends are never read as aliases.
	const canonical = Object.hasOwn(aliases, value) ? aliases[value] : undefined;
	return canonical ?? value;
}

/** The canonical form of a tag (the tag itself when it is not an alias). */
export function canonicalTag(tag: string): string {
	return lookup(TAG_ALIASES, tag);
}

/** The canonical form of a DH skill (the skill itself when it is not an alias). */
export function canonicalSkill(skill: string): string {
	return lookup(SKILL_ALIASES, skill);
}

/**
 * The comparison key two spellings of one term share: case, diacritics,
 * apostrophe variants, punctuation and spacing folded away, so `Named-Entity
 * Recognition` and `named entity recognition` meet.
 */
export function vocabularyFoldKey(term: string): string {
	return normalizeSearchText(term).replace(/[^\p{L}\p{N}]+/gu, '');
}
