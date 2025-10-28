import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';

export default defineConfig({
	plugins: [sveltekit(), UnoCSS()],
	preview: {
		host: '0.0.0.0',
		port: 3000
	}
});
