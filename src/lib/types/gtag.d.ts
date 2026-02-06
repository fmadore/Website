// Type definitions for Google Analytics gtag
interface Window {
	dataLayer?: any[];
	gtag?: (
		command: 'js' | 'config' | 'event' | 'set' | 'consent',
		targetIdOrEventName: Date | string,
		options?: {
			[key: string]: any;
		}
	) => void;
}
