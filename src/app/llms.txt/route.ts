import { getMenuItems, getGuidosProducts, getFaqs, getSettings } from '@/lib/cms';
import { SITE, SERVICE_COMMUNITIES } from '@/lib/seo';

// /llms.txt: curated business summary for answer engines and assistant
// crawlers. Composed from live CMS content with the same 300s ISR window as
// the public pages; each CMS getter degrades to a pointer at the live page
// if Convex is unavailable.
export const revalidate = 300;

/** Collapse CMS text to a single markdown-safe line. */
function oneLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function money(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}

export async function GET(): Promise<Response> {
  const [menuItems, products, faqs, settings] = await Promise.all([
    getMenuItems().catch(() => []),
    getGuidosProducts().catch(() => []),
    getFaqs().catch(() => []),
    getSettings(), // already outage-safe (returns {})
  ]);

  const hoursNote = settings['business_hours_note'] || 'Consultations & tastings by appointment';
  const lines: string[] = [];

  lines.push('# Melting Moments Catering');
  lines.push('');
  lines.push(
    `Melting Moments Catering is a full-service caterer based in Esquimalt (Victoria, BC, Canada), owned and run by Executive Chef Paul Silletta for 17+ years. Two brands under one kitchen: Melting Moments Catering (custom catering for weddings, corporate functions, and private events across Greater Victoria) and Guido's Gourmet (homemade ready-made Italian meals for delivery or pickup). Chef Paul plans every menu personally; menus are fully customizable, including vegan, vegetarian, gluten-free, and allergy-safe options.`
  );
  lines.push('');
  lines.push(`Website: ${SITE.url}`);
  lines.push('');

  lines.push('## Services');
  lines.push(`- Wedding catering: ${SITE.url}/weddings`);
  lines.push(`- Corporate catering & office luncheons: ${SITE.url}/corporate`);
  lines.push(`- Private events & dinner parties: ${SITE.url}/private-events`);
  lines.push(`- Family-style dining: ${SITE.url}/family-style`);
  lines.push(`- Chocolate & beverage fountains: ${SITE.url}/fountains`);
  lines.push('');

  lines.push('## Catering Menu');
  lines.push(`Full menus with pricing: ${SITE.url}/menus`);
  if (menuItems.length > 0) {
    // getMenuItems() is pre-sorted by category then orderIndex
    let currentCategory = '';
    for (const item of menuItems) {
      if (item.category !== currentCategory) {
        currentCategory = item.category;
        lines.push('');
        lines.push(`### ${oneLine(item.category)}`);
      }
      const price = item.priceLabel ? `: ${oneLine(item.priceLabel)}` : '';
      lines.push(`- ${oneLine(item.name)}${price}`);
    }
  }
  lines.push('');

  lines.push("## Guido's Gourmet (ready-made Italian meals)");
  lines.push(`Menu: ${SITE.url}/guidos/menu · Order: ${SITE.url}/guidos/order`);
  const available = products.filter((p) => p.isAvailable);
  if (available.length > 0) {
    let currentCategory = '';
    for (const product of available) {
      if (product.category !== currentCategory) {
        currentCategory = product.category;
        lines.push('');
        lines.push(`### ${oneLine(product.category)}`);
      }
      const sizes =
        product.sizes && product.sizes.length > 0
          ? ` (${product.sizes.map((s) => `${oneLine(s.label)} ${money(s.price)}`).join(', ')})`
          : '';
      const limited = product.isLimitedEdition ? ', limited edition' : '';
      lines.push(`- ${oneLine(product.name)}: From ${money(product.priceFrom)}${sizes}${limited}`);
    }
  }
  lines.push('');

  lines.push('## Service Area');
  lines.push(
    `Based in Esquimalt, serving Greater Victoria: ${SERVICE_COMMUNITIES.join(', ')}. For weddings and larger events the team travels up-Island (Cowichan Valley, Nanaimo, and beyond).`
  );
  lines.push(
    "Guido's Gourmet delivery: flat rate $12.50 anywhere in Greater Victoria; pickup by appointment from the Esquimalt kitchen."
  );
  lines.push('');

  lines.push('## Contact');
  lines.push(`- Phone: ${SITE.phone}`);
  lines.push(`- Email: ${SITE.email}`);
  lines.push(`- Address: ${SITE.street}, ${SITE.locality}, ${SITE.region} ${SITE.postal}, Canada`);
  lines.push(`- Hours: ${oneLine(hoursNote)}`);
  lines.push(
    '- Booking terms: 25% deposit at booking; balance due 7 days before the event; guaranteed guest count 2 weeks in advance; per-person pricing based on a minimum of 75 guests.'
  );
  lines.push('');

  lines.push('## FAQ');
  if (faqs.length > 0) {
    for (const faq of faqs) {
      lines.push(`Q: ${oneLine(faq.question)}`);
      lines.push(`A: ${oneLine(faq.answer)}`);
      lines.push('');
    }
  } else {
    lines.push(`See ${SITE.url}/faq`);
    lines.push('');
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
