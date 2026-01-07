// src/lib/utils.ts
// Utility functions for the application

type ClassValue = string | boolean | undefined | null | Record<string, boolean | undefined | null>;

/**
 * Merge CSS class names together, filtering out falsy values
 * Similar to clsx/classnames libraries
 * Supports: strings, booleans, objects with boolean values
 */
export function cn(...classes: ClassValue[]): string {
    const result: string[] = [];

    for (const cls of classes) {
        if (!cls) continue;

        if (typeof cls === 'string') {
            result.push(cls);
        } else if (typeof cls === 'object') {
            for (const [key, value] of Object.entries(cls)) {
                if (value) {
                    result.push(key);
                }
            }
        }
    }

    return result.join(' ');
}
