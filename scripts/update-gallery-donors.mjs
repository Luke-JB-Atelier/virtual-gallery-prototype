import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const STRIPE_API = 'https://api.stripe.com/v1';
const secretKey = String(process.env.STRIPE_SECRET_KEY || '').trim();
const paymentLinkId = String(process.env.STRIPE_PAYMENT_LINK_ID || '').trim();
const minimum = Math.max(0, Number(process.env.GALLERY_DONOR_MINIMUM || 500) || 500);
const outputPath = path.resolve(process.cwd(), 'public/data/gallery-donors.json');

if (!secretKey.startsWith('sk_')) {
  throw new Error('STRIPE_SECRET_KEY chybi nebo nema ocekavany format sk_...');
}
if (!paymentLinkId.startsWith('plink_')) {
  throw new Error('STRIPE_PAYMENT_LINK_ID chybi nebo nema ocekavany format plink_...');
}

async function stripeGet(resourcePath, params = {}) {
  const url = new URL(STRIPE_API + resourcePath);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body?.error?.message || `${response.status} ${response.statusText}`;
    throw new Error(`Stripe API: ${detail}`);
  }
  return body;
}

function normalizeKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function sanitizeName(value) {
  return String(value || '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 40);
}

function getCustomFieldValue(field) {
  const type = String(field?.type || '');
  const typed = field?.[type];
  return typed?.value ?? '';
}

function getDonorName(session) {
  const preferredKeys = new Set(['nick', 'nickname', 'prezdivka', 'jmeno', 'name']);
  const fields = Array.isArray(session?.custom_fields) ? session.custom_fields : [];
  for (const field of fields) {
    const key = normalizeKey(field?.key);
    const label = normalizeKey(field?.label?.custom || field?.label?.type);
    if (!preferredKeys.has(key) && !preferredKeys.has(label)) continue;
    const value = sanitizeName(getCustomFieldValue(field));
    if (value) return value;
  }
  return sanitizeName(session?.customer_details?.name) || 'Anonym';
}

async function listPaidSessions() {
  const sessions = [];
  let startingAfter = '';
  while (true) {
    const page = await stripeGet('/checkout/sessions', {
      limit: 100,
      status: 'complete',
      payment_link: paymentLinkId,
      starting_after: startingAfter,
    });
    const rows = Array.isArray(page?.data) ? page.data : [];
    sessions.push(...rows);
    if (!page?.has_more || rows.length === 0) break;
    startingAfter = rows.at(-1)?.id || '';
    if (!startingAfter) break;
  }
  return sessions;
}

function buildDonors(sessions) {
  const totals = new Map();
  for (const session of sessions) {
    if (session?.livemode !== true) continue;
    if (session?.payment_status !== 'paid') continue;
    const currency = String(session?.currency || '').toUpperCase();
    if (currency !== 'CZK') continue;
    const amountMinor = Number(session?.amount_total);
    if (!Number.isFinite(amountMinor) || amountMinor <= 0) continue;
    const amount = amountMinor / 100;
    const name = getDonorName(session);
    const key = `${name.toLocaleLowerCase('cs-CZ')}|${currency}`;
    const current = totals.get(key) || { name, amount: 0, currency };
    current.amount += amount;
    totals.set(key, current);
  }
  return [...totals.values()]
    .filter((donor) => donor.amount >= minimum)
    .map((donor) => ({
      name: donor.name,
      amount: Number(donor.amount.toFixed(2)),
      currency: donor.currency,
    }))
    .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name, 'cs'));
}

async function readExisting() {
  try {
    return JSON.parse(await fs.readFile(outputPath, 'utf8'));
  } catch {
    return null;
  }
}

function comparable(payload) {
  return JSON.stringify({
    schemaVersion: 1,
    minimum,
    currency: 'CZK',
    donors: payload?.donors || [],
  });
}

const link = await stripeGet(`/payment_links/${encodeURIComponent(paymentLinkId)}`);
if (link?.id !== paymentLinkId) throw new Error('Stripe Payment Link ID nesouhlasi s odpovedi Stripe.');
if (link?.livemode !== true) throw new Error('Galerie smi synchronizovat jen LIVE Stripe Payment Link.');
if (link?.active === false) console.warn('Upozorneni: Stripe Payment Link je neaktivni.');

const sessions = await listPaidSessions();
const donors = buildDonors(sessions);
const existing = await readExisting();
const candidate = { donors };

if (existing?.generatedAt && comparable(existing) === comparable(candidate)) {
  console.log(`Beze zmeny: ${donors.length} darcu od ${minimum} CZK.`);
  process.exit(0);
}

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  minimum,
  currency: 'CZK',
  donors,
};
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Aktualizovano: ${donors.length} darcu od ${minimum} CZK.`);
