import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto supports only some environments, see https://svelte.dev/docs/kit/adapter-auto
		// or choose a specific adapter for your deployment target
		adapter: adapter()
	}
};

export default config;