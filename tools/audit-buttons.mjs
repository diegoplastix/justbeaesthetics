// Scan every mirrored page and list (button text → href) pairs so we can
// see which ones point to the wrong place.
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../public/', import.meta.url));
const pages = process.argv.slice(2);
if (!pages.length) {
  // default: every /slug/index.html except homepage
  for (const e of await readdir(ROOT, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    if (['wp-content','wp-includes','wp-json','comments','feed','downloads'].includes(e.name)) continue;
    pages.push(join(ROOT, e.name, 'index.html'));
  }
}

for (const file of pages) {
  let html;
  try { html = await readFile(file, 'utf8'); } catch { continue; }
  // Match each elementor button anchor — href + the inner text
  const re = /<a[^>]*class="[^"]*elementor-button[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
  const lines = [];
  let m;
  while ((m = re.exec(html))) {
    const anchor = m[0];
    const href = (anchor.match(/href="([^"]*)"/) || [])[1] || '(no-href)';
    const text = (m[1].match(/<span class="elementor-button-text">([^<]+)<\/span>/) || [])[1]?.trim() || '?';
    lines.push(`  "${text}" → ${href}`);
  }
  // Also match the hero/secondary "Read More"-style anchors (elementor-cta/link patterns)
  const re2 = /<a[^>]*class="[^"]*(?:elementor-cta__button|elementor-post__read-more)[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
  while ((m = re2.exec(html))) {
    const href = (m[0].match(/href="([^"]*)"/) || [])[1] || '(no-href)';
    const text = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
    lines.push(`  (cta) "${text}" → ${href}`);
  }
  if (lines.length) {
    console.log(`\n${file.replace(ROOT, '')}:`);
    for (const l of lines) console.log(l);
  }
}
