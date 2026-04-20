// Wire the footer's "Privacy Policy" and "Terms & Conditions" links to
// the new legal pages on every HTML page in public/.
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
        if (['wp-content','wp-includes','wp-json'].includes(e.name)) continue;
        await rec(p);
      } else if (e.name === 'index.html') out.push(p);
    }
  }
  await rec(dir); return out;
}

const files = await walkHtml(ROOT);
let linkFixed = 0;
for (const f of files) {
  let html = await readFile(f, 'utf8');
  let changed = false;
  // Find the footer <a href="#"><span class="elementor-icon-list-text">Privacy Policy</span></a>
  // and replace the href. Same for Terms.
  const rules = [
    { text: 'Privacy Policy', href: '/privacy-policy/' },
    { text: 'Terms &amp; Conditions', href: '/terms-and-conditions/' },
    { text: 'Terms & Conditions', href: '/terms-and-conditions/' },
  ];
  for (const r of rules) {
    // Negative lookahead (?!</a>) prevents the inner-group from spanning
    // across multiple anchors (which previously rewrote the Services nav
    // trigger instead of just the footer link).
    const re = new RegExp(`<a([^>]*?)\\shref="#"([^>]*)>((?:(?!<\\/a>)[\\s\\S])*?<span class="elementor-icon-list-text">${r.text}</span>(?:(?!<\\/a>)[\\s\\S])*?)</a>`, 'g');
    const before = html;
    html = html.replace(re, (_, b, a, inner) => `<a${b} href="${r.href}"${a}>${inner}</a>`);
    if (html !== before) { changed = true; linkFixed++; }
  }
  if (changed) await writeFile(f, html, 'utf8');
}
console.log(`Wired ${linkFixed} legal links across ${files.length} pages.`);
