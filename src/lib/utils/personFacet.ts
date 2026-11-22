/**
 * A co-author facet keyed on people rather than on spellings (#220).
 *
 * A credit carries a `personId` where the record links the name to the people
 * registry. Keyed on that id, two spellings of one person ("Muriel
 * Gomez-Perez", "Muriel Gomez Perez") are one facet value, and a renamed
 * entry keeps its shared links. Built only from the ids the records already
 * carry, so the index never loads the registry itself: a name credited
 * without an id (a table of contents, an editor line) takes the id it carries
 * elsewhere in the corpus, and a name never linked keys on itself.
 *
 * Old links name people (`?author=Muriel Gomez-Perez`), and so do agents:
 * `alias` maps a name, exactly or case- and accent-insensitively, onto its key.
 */
import { normalizeSearchText } from './searchText.ts';

export interface Credit {
	name: string;
	personId?: string;
}

export interface PersonFacet {
	/** The facet value for a credit: its person id, else the id its name carries elsewhere, else the name. */
	keyOf: (credit: Credit) => string;
	/** The display form of a key: the name the corpus first credits it under. */
	label: (key: string) => string;
	/** A name or key from outside the page, as the key it names. */
	alias: (value: string) => string;
}

const fold = (value: string) => normalizeSearchText(value).trim();

export function buildPersonFacet(credits: Iterable<Credit>): PersonFacet {
	const all = [...credits];
	const idByName = new Map<string, string>();
	const labelById = new Map<string, string>();
	for (const { name, personId } of all) {
		if (!personId) continue;
		if (!idByName.has(name)) idByName.set(name, personId);
		if (!labelById.has(personId)) labelById.set(personId, name);
	}
	const keyOf = ({ name, personId }: Credit) => personId ?? idByName.get(name) ?? name;

	const keyByName = new Map<string, string>();
	const keyByFold = new Map<string, string>();
	for (const credit of all) {
		const key = keyOf(credit);
		if (!keyByName.has(credit.name)) keyByName.set(credit.name, key);
		const folded = fold(credit.name);
		if (!keyByFold.has(folded)) keyByFold.set(folded, key);
	}

	return {
		keyOf,
		label: (key) => labelById.get(key) ?? key,
		alias: (value) => keyByName.get(value) ?? keyByFold.get(fold(value)) ?? value
	};
}
