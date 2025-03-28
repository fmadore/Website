import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const dev = process.argv.includes('dev');

const config = {
	preprocess: [vitePreprocess(), mdsvex()],
	kit: { 
		adapter: adapter({
			// default options are shown
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: true
		}),
		paths: {
			base: dev ? '' : '/Website'
		},
		trailingSlash: 'always'
	},
	extensions: ['.svelte', '.svx']
};

export default config;
