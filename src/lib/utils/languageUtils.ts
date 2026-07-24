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

/**
 * BCP-47 `lang` attribute for an item's title, derived from its `language`
 * field ("French", "English, French", ['English']…).
 *
 * Returns undefined when the attribute should be omitted: English content
 * (the page default), multilingual items (the title's language is ambiguous),
 * or unknown values.
 */
export function titleLangAttr(language: string | string[] | undefined): string | undefined {
	if (!language) return undefined;
	const list = Array.isArray(language) ? language : language.split(',');
	const normalized = list.map((l) => l.trim().toLowerCase()).filter(Boolean);
	if (normalized.length !== 1) return undefined;
	const code = LANGUAGE_CODES[normalized[0] ?? ''];
	return code === 'en' ? undefined : code;
}
