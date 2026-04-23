// Copy the fresh inline script from public/index.html into every other
// mirrored page. Replaces the old "Toggle .is-scrolled" script block.
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

// Extract the canonical script block from homepage
const home = await readFile(join(ROOT, 'index.html'), 'utf8');
const m = home.match(/<!-- Post-mirror runtime:[\s\S]*?<\/script>/);
if (!m) {
  console.error('cannot find canonical inline script in homepage');
  process.exit(1);
}
const canonical = m[0];

const files = await walkHtml(ROOT);
let updated = 0;
for (const f of files) {
  if (f.endsWith(join('public', 'index.html'))) continue;   // homepage is source
  let html = await readFile(f, 'utf8');

  // Possible old markers to replace
  const patterns = [
    /<!-- Toggle \.is-scrolled on the sticky header[\s\S]*?<\/script>/,
    /<!-- Post-mirror runtime:[\s\S]*?<\/script>/
  ];
  let replaced = false;
  for (const re of patterns) {
    if (re.test(html)) { html = html.replace(re, canonical); replaced = true; break; }
  }
  if (!replaced) {
    // No existing block — insert before </body>
    html = html.replace(/<\/body>/i, canonical + '\n</body>');
  }
  await writeFile(f, html, 'utf8');
  updated++;
}
console.log(`Updated inline script on ${updated} page(s).`);
