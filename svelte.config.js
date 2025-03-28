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
		appDir: 'app', // Ensures all generated JS is under this directory
		// Make sure all pages are pre-rendered
		prerender: {
			entries: ['*'],
			handleHttpError: ({ path, referrer, message }) => {
				// If the error is a missing page, return a 404 status
				if (path.startsWith('/Website/')) {
					console.warn(`Ignoring ${path} - redirecting via 404.html`);
					return;
				}
				// Otherwise, throw the error and stop the build
				throw new Error(message);
			}
		}
	},
	extensions: ['.svelte', '.svx']
};

export default config;
