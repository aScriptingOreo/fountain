import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const base = '/slick-portfolio-svelte-5';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Use adapter-static and write the static site to `dist` so deployment tools
		// (like Cloudflare Pages / Wrangler) can publish the directory directly.
		adapter: adapter({ pages: 'dist', assets: 'dist', fallback: '404.html' }),
		paths: {
			base: process.env.NODE_ENV === 'production' ? base : ''
		}
	}
};

export default config;
