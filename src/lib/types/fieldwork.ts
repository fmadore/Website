export interface Fieldwork {
	id: string;
	city: string;
	country: string;
	date: string;
	year: number;
	description?: string;
	tags?: string[];
	project?: string;
	coordinates?: {
		latitude: number;
		longitude: number;
	};
	image?: string;
	heroImage?: {
		src: string;
		alt: string;
		caption?: string;
	};
}
