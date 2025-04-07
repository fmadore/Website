// src/lib/types/filters.ts

// Define the structure for individual filter options
export interface BaseFilterOption<T> {
    type: 'checkbox' | 'range' | 'buttons';
    title: string; // e.g., "Publication Types", "Years"
    items?: T[]; // For checkbox/buttons, e.g., ['book', 'article'] or ['tag1', 'tag2']
    allYears?: number[]; // Specifically for range slider
    itemLabels?: { [key: string]: string }; // Optional labels, e.g., {'book': 'Books'}
    counts?: { [key: string]: number }; // Optional counts for items
}

// Specific filter option types using discriminated unions based on 'type'
export interface CheckboxFilterOption<T> extends BaseFilterOption<T> {
    type: 'checkbox';
    items: T[];
    activeItems: T[];
    toggleItem: (item: T) => void;
}

export interface RangeFilterOption extends BaseFilterOption<number> {
    type: 'range';
    allYears: number[];
    activeRange: { min: number; max: number } | null;
    updateRange: (min: number, max: number) => void;
    resetRange: () => void;
}

export interface ButtonsFilterOption<T> extends BaseFilterOption<T> {
    type: 'buttons';
    items: T[];
    activeItems: T[];
    toggleItem: (item: T) => void;
}

// Union type for any filter section configuration
// Refined to use specific string types for Checkbox/Buttons, matching child component expectations
export type FilterSectionConfig = CheckboxFilterOption<string> | RangeFilterOption | ButtonsFilterOption<string>;

// Define the structure for the main configuration object passed to the universal sidebar
export interface UniversalFilterConfig {
    sections: FilterSectionConfig[]; // An array of different filter sections
    clearAllFilters: () => void; // Function to clear all active filters
    // Optional: Add global properties like sidebar title if needed
    // title?: string;
}

// Maybe also define the ActiveFilters structure if it's complex and used across modules
// Example:
// export interface ActiveFilters {
//   types?: string[];
//   yearRange?: { min: number; max: number } | null;
//   tags?: string[];
//   languages?: string[];
//   authors?: string[];
//   countries?: string[];
//   // Add other potential filters
// } 