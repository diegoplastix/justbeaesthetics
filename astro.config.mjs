import { defineConfig } from 'astro/config';

// The homepage is served as-is from public/index.html (byte-for-byte mirror
// of the original WordPress output) so nothing is reprocessed. Astro just
// copies public/ to dist/ and adds a valid static-site shell.
export default defineConfig({
  // Static output — compatible with Netlify and Vercel without extra adapters.
  output: 'static',
  // Don't compress HTML — preserves original formatting exactly.
  compressHTML: false,
  build: {
    // Match WordPress-style paths: /foo/ -> /foo/index.html
    format: 'directory',
    // Inline nothing — we serve the mirrored assets from public/.
    assets: '_astro',
  },
  // Keep trailing slashes to match WordPress URLs exactly.
  trailingSlash: 'always',
});
