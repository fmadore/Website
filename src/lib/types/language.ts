// src/lib/types/language.ts
export interface Language {
	id: string; // Unique identifier (e.g., 'french', 'english')
	name: string; // Language name (e.g., 'French', 'English')
	proficiency: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native'; // CEFR levels or Native
	order?: number; // Optional order for display (lower numbers first)
}
