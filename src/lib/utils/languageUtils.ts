/**
 * Language helpers for content metadata.
 *
 * The site chrome is English (`<html lang="en">`), but many publication and
 * communication titles are French. Emitting `lang` on those titles lets
 * screen readers switch pronunciation instead of reading French with English
 * phonology, and helps search engines classify the work.
 */

const LANGUAGE_CODES: Record<string, string> = {
	english: 'en',
	french: 'fr',
	german: 'de',
	arabic: 'ar',
	hausa: 'ha'
};

/** A `language` field as the records store it: "French", "English, French", ['English', 'French']. */
export type LanguageField = string | readonly string[] | undefined;

/** The field's language names, split, trimmed and lower-cased, empties dropped. */
function languageNames(language: LanguageField): string[] {
	if (!language) return [];
	const list = typeof language === 'string' ? language.split(',') : language;
	return list.map((l) => l.trim().toLowerCase()).filter(Boolean);
}

/**
 * The BCP 47 codes for a record's `language` field, in the order the record
 * lists them and without repeats: `'English, French'` → `['en', 'fr']`.
 *
 * The one name → code map for every machine-readable surface (JSON-LD
 * `inLanguage`, `citation_language`, `DC.language`), so a display string such
 * as "French" never reaches a field that wants a language tag. A value that is
 * already a bare two- or three-letter tag passes through; a name the map does
 * not know is dropped rather than published as if it were a tag.
 */
export function languageCodes(language: LanguageField): string[] {
	const codes = languageNames(language)
		.map((name) => LANGUAGE_CODES[name] ?? (/^[a-z]{2,3}$/.test(name) ? name : undefined))
		.filter((code): code is string => Boolean(code));
	return [...new Set(codes)];
}

/**
 * schema.org `inLanguage`: one code as a string, several as an array, none as
 * undefined (the property is then left out).
 */
export function jsonLdLanguage(language: LanguageField): string | string[] | undefined {
	const codes = languageCodes(language);
	if (codes.length === 0) return undefined;
	return codes.length === 1 ? codes[0] : codes;
}

/**
 * BCP-47 `lang` attribute for an item's title, derived from its `language`
 * field ("French", "English, French", ['English']…).
 *
 * Returns undefined when the attribute should be omitted: English content
 * (the page default), multilingual items (the title's language is ambiguous),
 * or unknown values.
 */
export function titleLangAttr(language: LanguageField): string | undefined {
	const normalized = languageNames(language);
	if (normalized.length !== 1) return undefined;
	const code = LANGUAGE_CODES[normalized[0] ?? ''];
	return code === 'en' ? undefined : code;
}
