// Generate a plain-markdown `index.md` for every `index.html` under
// public/. Strips Elementor/WordPress chrome (nav, footer, scripts,
// styles, invisible nodes), then converts the remaining body HTML to
// readable markdown. AI models can fetch `/any-page/index.md` for a
// clean, quotable copy of the page.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../public/', import.meta.url));
const SITE = 'https://justbeaesthetics.com';

async function walkHtml(dir) {
  const out = [];
  async function rec(d) {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) {
        if (['wp-content','wp-includes','wp-json','comments','feed'].includes(e.name)) continue;
        await rec(p);
      } else if (e.name === 'index.html') out.push(p);
    }
  }
  await rec(dir); return out;
}

// --- Minimal HTML → markdown converter (no deps) ---
// Enough for a content page: headings, paragraphs, lists, links, images,
// line breaks, basic tables. Strips scripts/styles/nav/footer/form.

function toMarkdown(html) {
  // 1) Strip <script>, <style>, <noscript>
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  // 2) Strip header/footer/nav (site chrome)
  html = html.replace(/<header[\s\S]*?<\/header>/gi, '');
  html = html.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  html = html.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  // 3) Strip HTML comments
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  // 4) Grab only the body's main element
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) html = bodyMatch[1];

  // 5) Block-level conversions
  const replacements = [
    [/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n\n# ${stripTags(t)}\n`],
    [/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${stripTags(t)}\n`],
    [/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n### ${stripTags(t)}\n`],
    [/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `\n\n#### ${stripTags(t)}\n`],
    [/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, t) => `\n\n##### ${stripTags(t)}\n`],
    [/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, t) => `\n\n###### ${stripTags(t)}\n`],
    [/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${stripTags(t).trim()}`],
    [/<\/?(ul|ol)[^>]*>/gi, '\n'],
    [/<br\s*\/?>/gi, '\n'],
    [/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `\n\n${stripTags(t).trim()}\n`],
    [/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, t) => `\n\n> ${stripTags(t).trim().replace(/\n/g, '\n> ')}\n`],
    [/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, (_, alt, src) => alt ? `![${alt}](${src})` : ''],
    [/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, ''],
    [/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => {
      const text = stripTags(t).trim();
      if (!text) return '';
      if (!href || href === '#') return text;
      return `[${text}](${href})`;
    }],
    [/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**'],
    [/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**'],
    [/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*'],
    [/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*'],
  ];
  for (const [re, rep] of replacements) html = html.replace(re, rep);

  // 6) Remaining tags → strip
  html = stripTags(html);

  // 7) Entity decode (bare minimum)
  html = decodeEntities(html);

  // 8) Cleanup
  html = html.replace(/\t+/g, ' ');
  html = html.replace(/ {2,}/g, ' ');
  html = html.replace(/\n +/g, '\n');
  html = html.replace(/\n{3,}/g, '\n\n');
  // Drop standalone step numbers like "01" "02" on their own lines
  html = html.replace(/\n\s*0\d\s*\n/g, '\n');
  // Drop bullet-separator characters
  html = html.replace(/^[·•]\s*/gm, '- ');
  return html.trim() + '\n';
}

function stripTags(s) {
  return String(s).replace(/<[^>]+>/g, '');
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&#8230;/g, '…')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

// --- Run ---
const files = await walkHtml(ROOT);
let written = 0;
for (const f of files) {
  const html = await readFile(f, 'utf8');
  // Extract meta for frontmatter
  const title = (html.match(/<title>([^<]+)<\/title>/) || ['',''])[1].trim();
  const desc = (html.match(/<meta\s+name="description"\s+content="([^"]+)"/) || ['',''])[1].trim();
  const relPath = f.replace(ROOT, '').replace(/\\/g, '/').replace(/index\.html$/, '');
  const url = `${SITE}${relPath.startsWith('/') ? '' : '/'}${relPath}`;

  const md = toMarkdown(html);
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(title || 'Untitled')}`,
    desc ? `description: ${JSON.stringify(desc)}` : null,
    `url: ${url}`,
    '---',
    ''
  ].filter(Boolean).join('\n');

  const outPath = f.replace(/index\.html$/, 'index.md');
  await writeFile(outPath, frontmatter + '\n' + md, 'utf8');
  written++;
}
console.log(`Wrote ${written} markdown mirrors.`);
