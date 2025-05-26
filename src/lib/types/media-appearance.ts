// src/lib/types/media-appearance.ts
export interface MediaAppearance {
	id: string; // Unique identifier (e.g., 'tv5-monde-2019-01-29')
	outlet: string; // e.g., 'TV5 Monde', 'QUB Radio', 'Journal de Montréal'
	program?: string; // Optional: e.g., '64' le monde en français'
	topic: string; // e.g., 'Deteriorating security situation in Burkina Faso'
	year: number;
	dateISO: string; // Full date for sorting, e.g., '2019-01-29'
	url?: string; // Optional URL to the appearance/article
	details?: string; // Optional extra details
	type: 'interview' | 'article' | string; // Type of appearance
}
