/**
 * Stub for SvelteKit's `$app/paths` virtual module in plain-Node Vitest runs
 * (no SvelteKit plugin loaded — see vitest.config.ts). The site deploys at the
 * domain root, so both resolve to a root path, as on the client.
 */
export const resolve = (path: string): string => (path.startsWith('/') ? path : `/${path}`);
export const asset = (file: string): string => `/${file.replace(/^\/+/, '')}`;
