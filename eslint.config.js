import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			'no-undef': 'off',
			// Pre-existing: 76 occurrences across data files and utilities
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			],
			'no-useless-escape': 'warn',
			'no-useless-assignment': 'warn',
			'prefer-rest-params': 'warn'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		ignores: ['eslint.config.js', 'svelte.config.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		},
		rules: {
			'svelte/no-navigation-without-resolve': 'error',
			// Pre-existing: {@html} is used intentionally for rich content rendering
			'svelte/no-at-html-tags': 'warn',
			// Pre-existing: ephemeral Map/Date/Set usage in non-reactive contexts
			'svelte/prefer-svelte-reactivity': 'warn',
			// Pre-existing: some each blocks don't need keys (static lists)
			'svelte/require-each-key': 'warn',
			'svelte/no-useless-mustaches': 'warn',
			'svelte/no-useless-children-snippet': 'warn',
			// Pre-existing: some props are part of interface but accessed via spread
			'svelte/no-unused-props': 'warn',
			// Pre-existing: $state + $effect pattern used for prop sync
			'svelte/prefer-writable-derived': 'warn'
		}
	}
);
