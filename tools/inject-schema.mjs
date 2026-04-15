// Inject a clean JustBE JSON-LD schema block into every scraped HTML page.
// Covers LocalBusiness + MedicalBusiness + FAQPage + per-service Service entities.
// Idempotent: skips pages that already contain the JustBE schema marker.
import { readFile, writeFile } from 'node:fs/promises';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../public/', import.meta.url));

async function walkHtml(dir) {
  const out = [];
  async function rec(d) {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === 'wp-content' || e.name === 'wp-includes' || e.name === 'wp-json') continue;
        await rec(p);
      } else if (e.name === 'index.html') {
        out.push(p);
      }
    }
  }
  await rec(dir);
  return out;
}

const BASE = 'https://justbeaesthetics.com';
const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'MedicalBusiness'],
      '@id': `${BASE}/#business`,
      name: 'JustBE Aesthetics',
      alternateName: 'JustBE',
      url: BASE,
      telephone: '+1-469-804-7212',
      email: 'doctor@jbaesthetics.org',
      image: `${BASE}/wp-content/uploads/2026/03/Just-Be-Aesthetics.png`,
      logo: `${BASE}/wp-content/uploads/2026/03/Just-Be-Aesthetics.png`,
      priceRange: '$$',
      description: 'Physician-led, nutrition-first wellness and aesthetic practice in Dallas, TX. Every appointment is with Dr. Adir Marchuk directly — in-person or telehealth.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '6780 Abrams St, Suite 209–210',
        addressLocality: 'Dallas',
        addressRegion: 'TX',
        postalCode: '75231',
        addressCountry: 'US'
      },
      geo: { '@type': 'GeoCoordinates', latitude: 32.8729, longitude: -96.7498 },
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '17:00' }
      ],
      areaServed: [
        { '@type': 'City', name: 'Dallas' }, { '@type': 'City', name: 'Highland Park' },
        { '@type': 'City', name: 'University Park' }, { '@type': 'City', name: 'Preston Hollow' },
        { '@type': 'City', name: 'Plano' }, { '@type': 'City', name: 'Frisco' },
        { '@type': 'City', name: 'Richardson' }, { '@type': 'City', name: 'Addison' },
        { '@type': 'City', name: 'Carrollton' }, { '@type': 'City', name: 'Irving' }
      ],
      founder: { '@type': 'Physician', name: 'Dr. Adir Marchuk' },
      employee: { '@type': 'Physician', name: 'Dr. Adir Marchuk', jobTitle: 'Physician, Founder' },
      medicalSpecialty: ['Aesthetics', 'Nutrition', 'WeightLoss'],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '1200',
        bestRating: '5',
        worstRating: '1'
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'MedicalProcedure', name: 'Botox / Neurotoxin', description: 'Wrinkle-relaxing injections priced per unit.', procedureType: 'Cosmetic', url: `${BASE}/treatment-botox/` },
            priceSpecification: { '@type': 'PriceSpecification', price: '13-16', priceCurrency: 'USD', unitText: 'per unit' }
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'MedicalProcedure', name: 'Dermal Fillers', description: 'Hyaluronic-acid fillers for lips, cheeks, and nasolabial folds.', procedureType: 'Cosmetic', url: `${BASE}/treatment-dermal-fillers/` },
            priceSpecification: { '@type': 'PriceSpecification', price: '650-900', priceCurrency: 'USD', unitText: 'per syringe' }
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'MedicalProcedure', name: 'Medical Weight Loss', description: 'Physician-led weight-loss program including GLP-1 / semaglutide protocols.', url: `${BASE}/treatment-medical-weight-loss/` },
            priceSpecification: { '@type': 'PriceSpecification', price: '350', priceCurrency: 'USD', unitText: 'starting per month' }
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'MedicalProcedure', name: 'Peptide Therapy', description: 'Custom peptide protocols (BPC-157, CJC-1295/Ipamorelin, etc.).', url: `${BASE}/treatment-peptide-therapy/` },
            priceSpecification: { '@type': 'PriceSpecification', price: '300', priceCurrency: 'USD', unitText: 'starting per month' }
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Nutrition & Lifestyle Coaching', description: 'Root-cause nutrition and lifestyle program with labs review.', url: `${BASE}/nutrition-lifestyle-coaching/` },
            priceSpecification: { '@type': 'PriceSpecification', price: '250', priceCurrency: 'USD', unitText: 'starting, initial consultation' }
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Telehealth', description: 'Virtual visits with Dr. Marchuk directly.', url: `${BASE}/telehealth/` }
          }
        ]
      },
      sameAs: []
    },
    {
      '@type': 'FAQPage',
      '@id': `${BASE}/#faq`,
      mainEntity: [
        { '@type': 'Question', name: 'What does a first visit at JustBE cost?', acceptedAnswer: { '@type': 'Answer', text: 'A first consultation is $250 and includes a full intake, review of any existing labs, and a recommended next step. Lab work, if ordered, is billed through the lab.' } },
        { '@type': 'Question', name: 'How much does Botox cost at JustBE?', acceptedAnswer: { '@type': 'Answer', text: 'Botox is priced per unit at $13–$16. A typical forehead or frown treatment uses 20–40 units, so most treatments land between $260 and $640.' } },
        { '@type': 'Question', name: 'Do you accept insurance?', acceptedAnswer: { '@type': 'Answer', text: 'JustBE is a cash-pay practice. We provide itemized superbills that many PPO plans reimburse for the medical (non-aesthetic) portions of care.' } },
        { '@type': 'Question', name: 'Do you offer telehealth?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Telehealth is available for new and existing clients for nutrition, medical weight loss, peptide therapy, lab review, and follow-ups.' } },
        { '@type': 'Question', name: 'How long until I see results from medical weight loss?', acceptedAnswer: { '@type': 'Answer', text: 'Most clients on a GLP-1 / semaglutide protocol see 5–10% body-weight reduction in 3–4 months when combined with the nutrition program.' } },
        { '@type': 'Question', name: 'What areas of Dallas do you serve?', acceptedAnswer: { '@type': 'Answer', text: 'The in-person clinic is in North Dallas (75231), convenient to Highland Park, University Park, Preston Hollow, Lake Highlands, and Uptown. Telehealth patients are served anywhere Dr. Marchuk is licensed.' } },
        { '@type': 'Question', name: 'Who will I see at my appointment?', acceptedAnswer: { '@type': 'Answer', text: 'You always see Dr. Adir Marchuk directly — every appointment, every time. No nurse practitioner or rotating provider.' } },
        { '@type': 'Question', name: 'What makes JustBE different from a medspa?', acceptedAnswer: { '@type': 'Answer', text: 'JustBE is physician-led and nutrition-first. Treatments begin with a labs-and-lifestyle assessment rather than a menu of services. Aesthetic procedures are offered alongside root-cause medicine, not separately from it.' } }
      ]
    }
  ]
};

const MARKER = '<!-- justbe-schema -->';
const BLOCK = `\n${MARKER}\n<script type="application/ld+json">${JSON.stringify(SCHEMA)}</script>\n`;

const files = await walkHtml(ROOT);
let injected = 0, skipped = 0;
for (const f of files) {
  let html = await readFile(f, 'utf8');
  if (html.includes(MARKER)) { skipped++; continue; }
  if (!html.includes('</head>')) continue;
  html = html.replace('</head>', `${BLOCK}</head>`);
  await writeFile(f, html, 'utf8');
  injected++;
}
console.log(`JSON-LD injected into ${injected} pages, skipped ${skipped} (already present).`);
