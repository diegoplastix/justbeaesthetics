// Create /privacy-policy/ and /terms-and-conditions/ pages by taking
// an existing mirrored page as template (to reuse header/footer/styles)
// and replacing only the body content section.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../public/', import.meta.url));
const TEMPLATE = join(ROOT, 'about', 'index.html');

const PRIVACY_TITLE = 'Privacy Policy - JustBE Aesthetics';
const TERMS_TITLE = 'Terms & Conditions - JustBE Aesthetics';

function MD(s) {
  // inline: bold, italic, separator
  const inline = (txt) => txt
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

  // Process line by line so we can group list items and paragraphs properly
  const lines = s.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '---') {
      out.push('<hr/>');
      i++; continue;
    }
    if (trimmed.startsWith('### ')) {
      out.push(`<h3>${inline(trimmed.slice(4))}</h3>`);
      i++; continue;
    }
    if (trimmed.startsWith('## ')) {
      out.push(`<h2>${inline(trimmed.slice(3))}</h2>`);
      i++; continue;
    }
    if (trimmed.startsWith('# ')) {
      out.push(`<h1>${inline(trimmed.slice(2))}</h1>`);
      i++; continue;
    }
    if (trimmed.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(`<li>${inline(lines[i].trim().slice(2))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }
    if (!trimmed) { i++; continue; }
    // paragraph: gather contiguous non-empty, non-special lines
    const paraLines = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t) break;
      if (t.startsWith('#') || t === '---' || t.startsWith('- ')) break;
      paraLines.push(t);
      i++;
    }
    out.push(`<p>${inline(paraLines.join(' '))}</p>`);
  }
  return out.join('\n');
}

const PRIVACY_CONTENT = `# Privacy Policy

**Effective date:** April 2026

JustBE Aesthetics ("JustBE," "we," "our," or "us") is a physician-led wellness and aesthetics practice in Dallas, Texas, owned and operated by Dr. Adir Marchuk. This Privacy Policy explains how we collect, use, and protect information when you visit justbeaesthetics.com (the "Site"), contact us, or become a patient of the practice.

This policy addresses both general website privacy and the additional privacy protections that apply to our patients under federal health privacy law (HIPAA) and Texas state law.

## 1. Information We Collect

### Information you give us directly

- **Contact details** you submit through forms on the Site (name, email, phone, the service you are asking about, any message you send).
- **Appointment and scheduling information** you provide when you book a consultation.
- **Medical and health information** you share with Dr. Marchuk as part of clinical care — including intake forms, medical history, medications, lab work, photos, and notes from visits. This category of information is Protected Health Information (PHI) under HIPAA.
- **Payment information** you provide at the point of service. Card data is processed by our payment processor; JustBE does not store full card numbers.

### Information collected automatically

- **Device and usage data** such as IP address, browser type, operating system, referring URL, pages viewed, and timestamps, collected through server logs and analytics.
- **Cookies and similar technologies** used to keep the Site functional and to understand traffic patterns. You can disable cookies in your browser; some features may stop working.

### Information from third parties

- **Lab and imaging partners** that perform testing ordered by Dr. Marchuk, with your authorization.
- **Payment processors** that confirm the result of a transaction (but not your full card number).

## 2. How We Use Your Information

- To respond to inquiries, book consultations, and provide the services you request.
- To provide, coordinate, and document clinical care.
- To bill for services and process payments.
- To communicate with you about appointments, follow-ups, and important changes to your care.
- To operate and improve the Site (analytics, debugging, security).
- To comply with law and protect the rights, property, and safety of patients, staff, and the practice.

We do not sell your personal information or your Protected Health Information. We do not rent or share it for third-party marketing.

## 3. How We Share Your Information

We share information only in the ways listed below:

- **With your clinical team at JustBE** — which in this solo practice means Dr. Marchuk and, where necessary, a limited administrative support contractor who is bound by confidentiality.
- **With vendors who help us operate**, such as our website host, electronic medical record vendor, scheduling platform, email provider, telehealth platform, and payment processor. These vendors are contractually bound to protect your information and, for PHI, act as HIPAA Business Associates.
- **With other providers or labs** that you ask us to coordinate with.
- **When required by law**, including valid subpoenas, court orders, or public health reporting obligations.
- **To protect against imminent harm** — for example, a serious and imminent threat to your health or the safety of others.

## 4. Your Rights as a Patient (HIPAA)

If you are a patient of the practice, HIPAA gives you the following rights regarding your Protected Health Information:

- **Right of access** — to inspect and obtain a copy of your medical record, usually within 30 days.
- **Right to amend** — to request a correction of information you believe is inaccurate or incomplete.
- **Right to an accounting of disclosures** — a list of certain disclosures we have made of your PHI.
- **Right to request restrictions** on certain uses and disclosures.
- **Right to confidential communications** at a specific phone, email, or address.
- **Right to file a complaint** with us or with the U.S. Department of Health and Human Services, Office for Civil Rights, without retaliation.

A full Notice of Privacy Practices is provided at your first visit and on request.

## 5. Your Rights as a Website Visitor

Depending on where you live, you may have additional rights — to access, correct, delete, or port the personal information we hold about you — under Texas law and other applicable privacy laws. To exercise any of these rights, contact us at the address below. We will respond within the timeframe required by the applicable law.

## 6. Cookies and Analytics

The Site uses cookies and analytics to understand how visitors navigate pages and to keep the Site running correctly. You can opt out of analytics in your browser settings. We honor the Global Privacy Control (GPC) signal where applicable.

## 7. Security

We use reasonable administrative, technical, and physical safeguards to protect your information, including encryption in transit, restricted access to patient records, and vendor diligence for any partner that handles PHI. No system is perfectly secure, and we cannot guarantee absolute security. If we become aware of a breach affecting your information, we will notify you as required by law.

## 8. Minors

JustBE's services are intended for adults aged 18 and older. We do not knowingly collect personal information from children under 13. If you believe a minor has provided personal information through the Site, contact us so we can delete it.

## 9. Third-Party Links

The Site may link to third-party websites (for example, lab portals, payment pages, social platforms). Those sites have their own privacy policies, which we do not control.

## 10. Changes to This Policy

We may update this Privacy Policy from time to time. The "Effective date" at the top will reflect the latest version. Material changes will be communicated through a notice on the Site or, where appropriate, by email.

## 11. Contact Us

**JustBE Aesthetics**
6780 Abrams St, Suite 209–210
Dallas, TX 75231
Phone: (469) 804-7212
Email: doctor@jbaesthetics.org

---

*This policy is provided for general information and does not create a doctor-patient relationship or legal advice. Please review with a qualified attorney to ensure it reflects your specific practice and complies with current state, federal, and HIPAA requirements.*`;

const TERMS_CONTENT = `# Terms & Conditions

**Effective date:** April 2026

These Terms & Conditions ("Terms") govern your use of justbeaesthetics.com (the "Site") and the services provided by JustBE Aesthetics, a solo physician practice owned by Dr. Adir Marchuk and located in Dallas, Texas ("JustBE," "we," "our"). By using the Site, booking an appointment, or receiving services, you agree to these Terms.

## 1. No Medical Advice on the Site

The information on the Site — including blog posts, service descriptions, FAQs, and testimonials — is for general educational purposes only. It is **not medical advice** and does not create a doctor-patient relationship. A doctor-patient relationship forms only after you have been evaluated by Dr. Marchuk in a consultation. Never delay seeking medical care, disregard professional advice, or start or stop any medication based on information you read on the Site.

If you are experiencing a medical emergency, call 911.

## 2. Appointments, Bookings, and Cancellations

- **Booking.** Appointments can be booked through the Site, by phone, or by email. A valid booking is not final until it is confirmed by the practice.
- **New-patient requirements.** New patients complete an intake form before their first visit. Medical weight-loss and peptide patients may be required to complete lab work before a treatment plan is written.
- **Cancellations and rescheduling.** We ask for at least 24 hours' notice to cancel or reschedule. Late cancellations (under 24 hours) and no-shows may be charged a $75 fee. The fee is waived in cases of illness, emergency, or documented hardship.
- **Late arrivals.** If you arrive more than 15 minutes late, we may need to reschedule so we do not run over into another patient's appointment.

## 3. Telehealth

- Telehealth visits are available to new and existing patients in states where Dr. Marchuk is licensed. You are responsible for confirming your state is covered at booking.
- You must be physically located in a covered state during the visit.
- Telehealth has inherent limitations: a physical exam cannot always substitute a video visit. If a condition requires in-person evaluation, we will say so and help you arrange it.
- You consent to the use of the telehealth platform we select. The platform's separate terms and privacy policy apply to the technology itself.

## 4. Payment and Insurance

- **Cash-pay practice.** JustBE is a cash-pay practice. Payment is due at the time of service.
- **Superbills.** We provide itemized superbills on request that many PPO plans reimburse for the medical (non-aesthetic) portions of care. We do not guarantee reimbursement.
- **Refunds.** Consultation fees and services rendered are non-refundable. Unused portions of pre-paid programs may be refunded on a prorated basis at our discretion.
- **Product sales.** Supplements, peptides, and other products are dispensed by prescription where applicable and are non-returnable once dispensed, for safety reasons, except in the case of a defective product.

## 5. Aesthetic Procedures — Expectations and Risks

- Botox, fillers, and other aesthetic procedures are medical procedures with real risks, including but not limited to bruising, swelling, asymmetry, infection, and, rarely, vascular complications. You will be consented for every procedure individually at your visit.
- Results vary between patients. Before/after photos on the Site represent actual results for specific individuals and should not be read as a promise of your personal outcome.
- Touch-ups, if medically appropriate, are handled on a case-by-case basis and are not automatic.

## 6. Medical Weight Loss and Peptide Programs

- GLP-1 / semaglutide and peptide protocols are prescribed based on labs, medical history, and physical assessment. They are not guaranteed to produce a specific weight-loss or performance outcome.
- You are responsible for following the prescribed protocol, attending follow-up appointments, and reporting any side effects promptly.
- Medications will be shipped by a licensed compounding or specialty pharmacy; shipping times and availability are controlled by the pharmacy.

## 7. Use of the Site

By using the Site, you agree not to:

- Use the Site for any unlawful purpose or in violation of any applicable law.
- Attempt to gain unauthorized access to any portion of the Site or any accounts, systems, or networks.
- Upload viruses, malware, or otherwise interfere with the Site's operation.
- Scrape, harvest, or resell content without our written permission.

All content on the Site — text, images, videos, the JustBE name and logo — is owned by JustBE or used with permission and is protected by copyright and trademark law. You may share links to the Site freely, but commercial reuse of our content requires written permission.

## 8. Testimonials and Reviews

Testimonials and before/after content on the Site are provided by real patients with their written consent. They describe individual experiences and are not a guarantee of any specific outcome.

## 9. Third-Party Services

The Site may link to third-party platforms (scheduling, telehealth, payment, lab portals, social media). We do not control those services and are not responsible for their content, availability, or privacy practices.

## 10. Disclaimer of Warranties

The Site is provided "as is" and "as available." To the fullest extent permitted by law, we disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement regarding the Site. Services provided in the clinic are subject to the applicable standard of care under Texas medical practice law — this disclaimer does not limit the standard of care for clinical services.

## 11. Limitation of Liability

To the fullest extent permitted by law, in no event will JustBE be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Site. Nothing in these Terms limits our responsibility for the standard of care owed to patients during clinical services, or any liability that cannot be disclaimed under applicable law.

## 12. Governing Law

These Terms are governed by the laws of the State of Texas, without regard to conflict-of-law principles. Any dispute arising from these Terms or the Site will be resolved in the state or federal courts located in Dallas County, Texas.

## 13. Changes

We may update these Terms from time to time. Material changes will be reflected in the "Effective date" at the top of this page and, where appropriate, communicated through the Site.

## 14. Contact

**JustBE Aesthetics**
6780 Abrams St, Suite 209–210
Dallas, TX 75231
Phone: (469) 804-7212
Email: doctor@jbaesthetics.org

---

*These terms are provided for general informational purposes. Please have a qualified attorney review them against your specific practice, state regulations, and risk profile before publication.*`;

// --- Inject content into an existing-page template ---
const template = await readFile(TEMPLATE, 'utf8');

function buildPage({ title, bodyHtml }) {
  let html = template;
  // swap <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  // swap og:title + og:description meta
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${title} - JustBE Aesthetics" />`);
  // Find and replace the main page-content section (between <div data-elementor-type="wp-page"...> and </footer>)
  // Strategy: replace the first match of `<div data-elementor-type="wp-page"` through the line before `<footer`
  const startIdx = html.indexOf('<div data-elementor-type="wp-page"');
  const footerIdx = html.indexOf('<footer', startIdx);
  if (startIdx === -1 || footerIdx === -1) throw new Error('template structure changed');
  const before = html.slice(0, startIdx);
  const after = html.slice(footerIdx);
  const wrapper = `<div data-elementor-type="wp-page" class="elementor elementor-legal" data-elementor-post-type="page">
  <style>
    .legal-page { padding: 140px 24px 96px; background: #faf6f0; min-height: 60vh; }
    .legal-page__article { max-width: 820px; margin: 0 auto; background: #fffdfa; padding: 56px 48px; border-radius: 8px; color: #333; font-family: "Hedvig Letters Sans", sans-serif; line-height: 1.7; font-size: 16px; box-shadow: 0 1px 3px rgba(26,37,48,0.06); }
    .legal-page__article h1 { font-family: "Hedvig Letters Serif", serif; color: rgb(26, 37, 48); font-size: 40px; line-height: 1.15; margin: 0 0 24px; font-weight: 400; }
    .legal-page__article h2 { font-family: "Hedvig Letters Serif", serif; color: rgb(26, 37, 48); font-size: 26px; line-height: 1.25; margin: 44px 0 14px; font-weight: 500; }
    .legal-page__article h3 { font-family: "Hedvig Letters Sans", sans-serif; color: rgb(26, 37, 48); font-size: 18px; line-height: 1.35; margin: 28px 0 10px; font-weight: 600; }
    .legal-page__article p { margin: 0 0 16px; }
    .legal-page__article ul { margin: 0 0 20px; padding-left: 22px; }
    .legal-page__article li { margin: 6px 0; }
    .legal-page__article strong { color: rgb(26, 37, 48); font-weight: 600; }
    .legal-page__article em { color: #666; font-style: italic; }
    .legal-page__article hr { border: 0; border-top: 1px solid rgba(26,37,48,0.12); margin: 32px 0; }
    .legal-page__article a { color: rgb(122, 40, 59); text-decoration: underline; }
    @media (max-width: 720px) {
      .legal-page { padding: 120px 16px 64px; }
      .legal-page__article { padding: 32px 24px; }
      .legal-page__article h1 { font-size: 32px; }
      .legal-page__article h2 { font-size: 22px; }
    }
  </style>
  <section class="legal-page">
    <article class="legal-page__article">
      ${bodyHtml}
    </article>
  </section>
</div>
`;
  return before + wrapper + after;
}

const pages = [
  { slug: 'privacy-policy', title: PRIVACY_TITLE, content: PRIVACY_CONTENT },
  { slug: 'terms-and-conditions', title: TERMS_TITLE, content: TERMS_CONTENT }
];

for (const p of pages) {
  const bodyHtml = MD(p.content);
  const html = buildPage({ title: p.title, bodyHtml });
  const dir = join(ROOT, p.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), html, 'utf8');
  console.log(`Wrote public/${p.slug}/index.html (${html.length} bytes)`);
}
