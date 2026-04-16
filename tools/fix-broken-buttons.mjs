// Patch non-homepage pages where CTA buttons go to the wrong destination.
// Specifically:
//   1. Any Elementor button whose text is "Request a Nutrition Consultation"
//      → /contact/
//   2. Any Elementor button whose text is "Download the Free Guide"
//      → /downloads/JustBE-Aesthetics_Stress-Nutrition-Guide.pdf
//      (also add download + target=_blank so browser saves the file)
//   3. Any link pointing to /peptide-therapy-is-not-a-wellness-trend.../
//      (which never got scraped because the WP post doesn't exist)
//      → /treatment-peptide-therapy/
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

const GUIDE_URL = '/downloads/JustBE-Aesthetics_Stress-Nutrition-Guide.pdf';

// Rewrite an Elementor-button anchor by matching its button-text span.
// Crucial: the inner-group pattern uses a negative lookahead so it CANNOT
// span multiple <a>…</a> anchors. Without this the regex balloons across
// the whole page.
function rewriteButton(html, buttonText, newHref, extraAttrs = '') {
  const escaped = buttonText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `<a([^>]*?)\\shref="[^"]*"([^>]*)>((?:(?!<\\/a>)[\\s\\S])*?<span class="elementor-button-text">\\s*${escaped}\\s*</span>(?:(?!<\\/a>)[\\s\\S])*?)</a>`,
    'g'
  );
  return html.replace(re, (_, before, after, inner) => {
    const clean = (before + after).replace(/\starget="[^"]*"/g, '').replace(/\sdownload(="[^"]*")?/g, '');
    return `<a${clean} href="${newHref}"${extraAttrs}>${inner}</a>`;
  });
}

// Rewrite by href match (change any anchor pointing at from → to)
function rewriteHref(html, fromPrefix, toHref) {
  // Match href="...fromPrefix..." with any trailing path component
  const re = new RegExp(`href="${fromPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"`, 'g');
  return html.replace(re, `href="${toHref}"`);
}

const files = await walkHtml(ROOT);
let total = { nutritionCta: 0, downloadCta: 0, peptideLinks: 0 };

for (const f of files) {
  let html = await readFile(f, 'utf8');
  const before = html;

  // 1) "Request a Nutrition Consultation" → /contact/
  const newHtml1 = rewriteButton(html, 'Request a Nutrition Consultation', '/contact/');
  if (newHtml1 !== html) total.nutritionCta++;
  html = newHtml1;

  // 2) "Download the Free Guide" → the PDF, with download + target=_blank
  const newHtml2 = rewriteButton(
    html,
    'Download the Free Guide',
    GUIDE_URL,
    ' target="_blank" rel="noopener" download'
  );
  if (newHtml2 !== html) total.downloadCta++;
  html = newHtml2;

  // 3) Broken "peptide-therapy-is-not-a-wellness-trend..." links → /treatment-peptide-therapy/
  const newHtml3 = rewriteHref(html, '/peptide-therapy-is-not-a-wellness-trend', '/treatment-peptide-therapy/');
  if (newHtml3 !== html) total.peptideLinks++;
  html = newHtml3;

  if (html !== before) {
    await writeFile(f, html, 'utf8');
    console.log('  patched', f.replace(ROOT, ''));
  }
}
console.log('\nSummary:', JSON.stringify(total, null, 2));
