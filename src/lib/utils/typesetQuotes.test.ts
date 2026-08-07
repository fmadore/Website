import { describe, expect, it } from 'vitest';
import { quoteTitle, typesetQuotes } from './typesetQuotes';

describe('quoteTitle', () => {
	it('wraps a plain title in typographic double quotes', () => {
		expect(quoteTitle('Current Dynamics of Islam in Burkina Faso')).toBe(
			'“Current Dynamics of Islam in Burkina Faso”'
		);
	});

	it('demotes a trailing curly quotation so it cannot collide with the wrapper', () => {
		expect(quoteTitle('Workshop “Religions on Campus: Reformulating the Secular”')).toBe(
			'“Workshop ‘Religions on Campus: Reformulating the Secular’”'
		);
	});

	it('demotes straight inner quotes', () => {
		expect(quoteTitle('Presenting "Islam\'s Peripheries" at the "Open Up" Kick-Off Event')).toBe(
			'“Presenting ‘Islam’s Peripheries’ at the ‘Open Up’ Kick-Off Event”'
		);
	});

	it('handles a quotation that opens the title', () => {
		expect(quoteTitle('“Political” Islam in Senegal and Burkina Faso')).toBe(
			'“‘Political’ Islam in Senegal and Burkina Faso”'
		);
	});

	it('closes a quotation that ends on punctuation', () => {
		expect(quoteTitle('“Madame est au niveau 2, et moi…?” Gendered Dynamics')).toBe(
			'“‘Madame est au niveau 2, et moi…?’ Gendered Dynamics”'
		);
	});

	it('resolves German low/high marks by position, not by character', () => {
		expect(quoteTitle('Koranlektüre-Kurse für „Intellektuelle“ in Dakar')).toBe(
			'“Koranlektüre-Kurse für ‘Intellektuelle’ in Dakar”'
		);
	});

	it('resolves French guillemets', () => {
		expect(quoteTitle('Les « intellectuels musulmans » et la laïcité')).toBe(
			'“Les ‘intellectuels musulmans’ et la laïcité”'
		);
	});

	it('curls apostrophes without treating them as quotations', () => {
		expect(quoteTitle("Présentation de l'ouvrage sur la Côte d'Ivoire")).toBe(
			'“Présentation de l’ouvrage sur la Côte d’Ivoire”'
		);
	});

	it('curls a possessive apostrophe that ends a word', () => {
		expect(quoteTitle("Students' Associations on Campus")).toBe(
			'“Students’ Associations on Campus”'
		);
	});

	it('leaves an already-curled apostrophe alone', () => {
		expect(quoteTitle('Islam’s Peripheries')).toBe('“Islam’s Peripheries”');
	});

	it('does not double-wrap a title that is itself only a quotation', () => {
		expect(quoteTitle('“Good Muslim, Bad Muslim”')).toBe('“Good Muslim, Bad Muslim”');
		expect(quoteTitle('"West African Newspaper Archive"')).toBe('“West African Newspaper Archive”');
	});

	it('still demotes when a wrapped-looking title holds a second quotation', () => {
		expect(quoteTitle('“Good Muslim, Bad Muslim” in “Togo”')).toBe(
			'“‘Good Muslim, Bad Muslim’ in ‘Togo’”'
		);
	});

	it('trims surrounding whitespace', () => {
		expect(quoteTitle('  Islam and Muslims in West Africa  ')).toBe(
			'“Islam and Muslims in West Africa”'
		);
	});

	it('returns an empty string for missing titles', () => {
		expect(quoteTitle(undefined)).toBe('');
		expect(quoteTitle(null)).toBe('');
		expect(quoteTitle('   ')).toBe('');
	});
});

describe('typesetQuotes', () => {
	it('curls a quotation without changing its level', () => {
		expect(typesetQuotes('Cluster of Excellence "Africa Multiple", University of Bayreuth')).toBe(
			'Cluster of Excellence “Africa Multiple”, University of Bayreuth'
		);
	});

	it('keeps a single quotation single', () => {
		expect(typesetQuotes("Workshop Media and 'Public' Islam in Africa")).toBe(
			'Workshop Media and ‘Public’ Islam in Africa'
		);
	});

	it('curls apostrophes', () => {
		expect(typesetQuotes("Cahiers d'études africaines")).toBe('Cahiers d’études africaines');
		expect(typesetQuotes("Revue d'Histoire Contemporaine de l'Afrique")).toBe(
			'Revue d’Histoire Contemporaine de l’Afrique'
		);
	});

	it('converts guillemets to double marks and drops their inner space', () => {
		expect(typesetQuotes("Les « imams chocos » ou la mutation de l'autorité")).toBe(
			'Les “imams chocos” ou la mutation de l’autorité'
		);
	});

	it('keeps German low/high marks at double level', () => {
		expect(typesetQuotes('Kurse für „Intellektuelle“ in Dakar')).toBe(
			'Kurse für “Intellektuelle” in Dakar'
		);
	});

	it('handles a quotation nested inside a quotation', () => {
		expect(typesetQuotes('Vincent Hiribarren, "Review of \'Islam Burkina Faso Collection\'"')).toBe(
			'Vincent Hiribarren, “Review of ‘Islam Burkina Faso Collection’”'
		);
	});

	it('leaves text without marks untouched', () => {
		expect(typesetQuotes('University of Bayreuth')).toBe('University of Bayreuth');
	});

	it('returns an empty string for missing text', () => {
		expect(typesetQuotes(undefined)).toBe('');
		expect(typesetQuotes(null)).toBe('');
		expect(typesetQuotes('')).toBe('');
	});
});
