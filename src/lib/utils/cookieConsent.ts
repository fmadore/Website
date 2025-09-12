/**
 * Cookie Consent Management Utility
 * Handles cookie consent persistence, expiration, and different consent types
 */

export interface CookieConsentData {
	accepted: boolean;
	timestamp: number;
	version: string;
	categories?: {
		necessary: boolean;
		analytics: boolean;
		marketing: boolean;
		preferences: boolean;
	};
}

export interface CookieConsentOptions {
	storageKey?: string;
	expirationDays?: number;
	version?: string;
	requiresRefresh?: boolean;
}

const DEFAULT_OPTIONS: Required<CookieConsentOptions> = {
	storageKey: 'cookieConsent',
	expirationDays: 365,
	version: '1.0',
	requiresRefresh: false
};

/**
 * Cookie consent manager class
 */
export class CookieConsentManager {
	private options: Required<CookieConsentOptions>;
	private isClient: boolean;

	constructor(options: CookieConsentOptions = {}) {
		this.options = { ...DEFAULT_OPTIONS, ...options };
		this.isClient = typeof window !== 'undefined';
	}

	/**
	 * Check if localStorage is available
	 */
	private isStorageAvailable(): boolean {
		if (!this.isClient) return false;

		try {
			const test = '__storage_test__';
			localStorage.setItem(test, test);
			localStorage.removeItem(test);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Get current consent data
	 */
	getConsent(): CookieConsentData | null {
		if (!this.isStorageAvailable()) return null;

		try {
			const stored = localStorage.getItem(this.options.storageKey);
			if (!stored) return null;

			const data: CookieConsentData = JSON.parse(stored);

			// Check if consent has expired
			if (this.isExpired(data)) {
				this.clearConsent();
				return null;
			}

			// Check if version has changed and requires refresh
			if (this.options.requiresRefresh && data.version !== this.options.version) {
				this.clearConsent();
				return null;
			}

			return data;
		} catch (error) {
			console.warn('Error reading cookie consent:', error);
			return null;
		}
	}

	/**
	 * Save consent data
	 */
	setConsent(accepted: boolean, categories?: CookieConsentData['categories']): boolean {
		if (!this.isStorageAvailable()) return false;

		const consentData: CookieConsentData = {
			accepted,
			timestamp: Date.now(),
			version: this.options.version,
			categories: categories || {
				necessary: true,
				analytics: accepted,
				marketing: accepted,
				preferences: accepted
			}
		};

		try {
			localStorage.setItem(this.options.storageKey, JSON.stringify(consentData));
			return true;
		} catch (error) {
			console.warn('Error saving cookie consent:', error);
			return false;
		}
	}

	/**
	 * Clear consent data
	 */
	clearConsent(): void {
		if (!this.isStorageAvailable()) return;

		try {
			localStorage.removeItem(this.options.storageKey);
			// Also clear legacy keys
			localStorage.removeItem('cookiesAccepted');
			localStorage.removeItem('cookieConsentTimestamp');
		} catch (error) {
			console.warn('Error clearing cookie consent:', error);
		}
	}

	/**
	 * Check if consent has expired
	 */
	private isExpired(data: CookieConsentData): boolean {
		const expirationTime = data.timestamp + this.options.expirationDays * 24 * 60 * 60 * 1000;
		return Date.now() > expirationTime;
	}

	/**
	 * Check if consent is needed
	 */
	needsConsent(): boolean {
		return this.getConsent() === null;
	}

	/**
	 * Check if specific category is accepted
	 */
	isCategoryAccepted(category: keyof NonNullable<CookieConsentData['categories']>): boolean {
		const consent = this.getConsent();
		if (!consent || !consent.accepted) return false;

		return consent.categories?.[category] ?? false;
	}

	/**
	 * Migrate from legacy storage format
	 */
	migrateLegacyConsent(): void {
		if (!this.isStorageAvailable()) return;

		try {
			// Check for legacy format
			const legacyAccepted = localStorage.getItem('cookiesAccepted');
			const legacyTimestamp = localStorage.getItem('cookieConsentTimestamp');

			if (legacyAccepted !== null && !this.getConsent()) {
				const accepted = legacyAccepted === 'true';
				const timestamp = legacyTimestamp ? parseInt(legacyTimestamp) : Date.now();

				// Create new format consent
				const consentData: CookieConsentData = {
					accepted,
					timestamp,
					version: this.options.version,
					categories: {
						necessary: true,
						analytics: accepted,
						marketing: accepted,
						preferences: accepted
					}
				};

				localStorage.setItem(this.options.storageKey, JSON.stringify(consentData));

				// Clean up legacy keys
				localStorage.removeItem('cookiesAccepted');
				localStorage.removeItem('cookieConsentTimestamp');
			}
		} catch (error) {
			console.warn('Error migrating legacy cookie consent:', error);
		}
	}

	/**
	 * Get consent summary for debugging
	 */
	getConsentSummary(): {
		hasConsent: boolean;
		accepted: boolean;
		categories: CookieConsentData['categories'] | null;
		daysRemaining: number | null;
		version: string | null;
	} {
		const consent = this.getConsent();

		if (!consent) {
			return {
				hasConsent: false,
				accepted: false,
				categories: null,
				daysRemaining: null,
				version: null
			};
		}

		const daysRemaining = Math.ceil(
			(consent.timestamp + this.options.expirationDays * 24 * 60 * 60 * 1000 - Date.now()) /
				(24 * 60 * 60 * 1000)
		);

		return {
			hasConsent: true,
			accepted: consent.accepted,
			categories: consent.categories || null,
			daysRemaining,
			version: consent.version
		};
	}
}

// Create default instance
export const cookieConsent = new CookieConsentManager();

// Utility functions for backward compatibility
export function getCookieConsent(): boolean | null {
	const consent = cookieConsent.getConsent();
	return consent?.accepted ?? null;
}

export function setCookieConsent(accepted: boolean): boolean {
	return cookieConsent.setConsent(accepted);
}

export function needsCookieConsent(): boolean {
	return cookieConsent.needsConsent();
}

export function isAnalyticsAllowed(): boolean {
	return cookieConsent.isCategoryAccepted('analytics');
}

export function isMarketingAllowed(): boolean {
	return cookieConsent.isCategoryAccepted('marketing');
}

// Auto-migrate legacy consent on import
if (typeof window !== 'undefined') {
	cookieConsent.migrateLegacyConsent();
}
