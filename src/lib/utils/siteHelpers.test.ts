import { describe, it, expect } from 'vitest';
import { address, author, contact } from '$lib/data/siteConfig';
import {
	getAddressLines,
	getCvDescription,
	getDefaultDescription,
	getEmailWithName,
	getRssDescription,
	pageTitle
} from './siteHelpers';

describe('pageTitle', () => {
	it('closes every title with the site name from siteConfig', () => {
		expect(pageTitle('Research')).toBe(`Research | ${author.name}`);
	});

	it('orders segments most specific first', () => {
		expect(pageTitle('IWAC', 'Digital Humanities')).toBe(
			`IWAC | Digital Humanities | ${author.name}`
		);
	});

	it('is the bare site name with no segments', () => {
		expect(pageTitle()).toBe(author.name);
	});
});

describe('getAddressLines', () => {
	it('leads with the institution unless asked not to', () => {
		expect(getAddressLines()[0]).toBe(address.institution);
		expect(getAddressLines({ includeInstitution: false })).not.toContain(address.institution);
	});

	it('always carries the postcode and city', () => {
		expect(getAddressLines().join('\n')).toContain(`${address.postalCode} ${address.city}`);
	});
});

describe('site descriptions', () => {
	it('compose from siteConfig rather than restating the author', () => {
		for (const text of [getDefaultDescription(), getCvDescription(), getRssDescription()]) {
			expect(text).toContain(author.name);
			expect(text).toContain(author.position);
		}
	});

	it('formats the RSS managing-editor field as "email (name)"', () => {
		expect(getEmailWithName()).toBe(`${contact.email} (${author.name})`);
	});
});
