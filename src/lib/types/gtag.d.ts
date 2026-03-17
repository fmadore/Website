// Type definitions for Google Analytics gtag
interface Window {
	dataLayer?: unknown[];
	gtag?: (
		command: 'js' | 'config' | 'event' | 'set' | 'consent',
		targetIdOrEventName: Date | string,
		options?: {
			[key: string]: string | number | boolean | Record<string, string> | undefined | null;
		}
	) => void;
}
