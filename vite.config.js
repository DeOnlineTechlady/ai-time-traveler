import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration for deploying the AI Time Traveler app.
 *
 * The `base` option is set to '/' so that all assets (JavaScript, CSS, images)
 * are loaded relative to the root of your custom domain. Without this setting,
 * GitHub Pages may attempt to fetch assets from incorrect paths when using
 * a custom domain, resulting in missing styling and broken functionality.
 */
export default defineConfig({
  plugins: [react()],
  base: '/',
});
