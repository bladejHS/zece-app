import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  base: '/zece-app/',
  site: 'https://bladejhs.github.io',
  build: {
    format: 'file',
  },
});