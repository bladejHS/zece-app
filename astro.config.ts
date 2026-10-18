import { defineConfig } from 'astro/config';
import legacyApp from './integrations/legacy-app';
import serviceWorker from './integrations/service-worker';

/* GitHub Pages: aplicația stă la https://bladejhs.github.io/zece-app/ */
export default defineConfig({
  site: 'https://bladejhs.github.io',
  base: '/zece-app/',
  trailingSlash: 'ignore',
  build: { assets: '_astro', inlineStylesheets: 'never' },
  vite: { plugins: [legacyApp()] },
  integrations: [serviceWorker()],
});
