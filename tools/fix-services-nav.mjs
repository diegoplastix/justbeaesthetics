// The Services dropdown PARENT anchor in the nav should stay as href="#"
// — it's a click-to-open trigger, not a link. An earlier greedy regex in
// wire-legal-links.mjs accidentally rewrote it to /privacy-policy/
// (desktop) and /terms-and-conditions/ (mobile). This script restores it.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../public/', import.meta.url));

async function walkHtml(dir) {
  const out = [];
  async function rec(d) {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) {
        if (['wp-content','wp-includes','wp-json','downloads'].includes(e.name)) continue;
        await rec(p);
      } else if (e.name === 'index.html') out.push(p);
    }
  }
  await rec(dir); return out;
}

const files = await walkHtml(ROOT);
let fixed = 0;

for (const f of files) {
  let html = await readFile(f, 'utf8');
  const before = html;
  // Desktop dropdown trigger
  html = html.replace(
    /<a href="\/privacy-policy\/" class="elementor-item elementor-item-anchor">Services<\/a>/g,
    '<a href="#" class="elementor-item elementor-item-anchor">Services</a>'
  );
  // Mobile dropdown trigger
  html = html.replace(
    /<a href="\/terms-and-conditions\/" class="elementor-item elementor-item-anchor" tabindex="-1">Services<\/a>/g,
    '<a href="#" class="elementor-item elementor-item-anchor" tabindex="-1">Services</a>'
  );
  if (html !== before) {
    await writeFile(f, html, 'utf8');
    fixed++;
  }
}
console.log(`Restored Services dropdown trigger on ${fixed} page(s).`);
