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
	// Generated artifact (slim reference index) — committed but not hand-edited.
	{ ignores: ['src/lib/data/referenceIndex.generated.ts'] },
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
			// Ratcheted to error 2026-07 after the grandfathered occurrences were burned down to zero.
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			],
			'no-useless-escape': 'error',
			'no-useless-assignment': 'error',
			'prefer-rest-params': 'error'
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
			// Ratcheted to error 2026-07: every remaining {@html} site renders trusted static
			// data or internal-formatter output and carries an eslint-disable with justification.
			'svelte/no-at-html-tags': 'error',
			// Ratcheted to error 2026-07 after grandfathered occurrences reached zero.
			'svelte/prefer-svelte-reactivity': 'error',
			'svelte/require-each-key': 'error',
			'svelte/no-useless-mustaches': 'error',
			'svelte/no-useless-children-snippet': 'error',
			'svelte/no-unused-props': 'error',
			'svelte/prefer-writable-derived': 'error'
		}
	}
);
