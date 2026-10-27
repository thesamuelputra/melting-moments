'use server';

import { fetchMutation } from 'convex/nextjs';
import { revalidatePath, updateTag } from 'next/cache';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { STOCKIST_KINDS, type StockistKind } from '@/../convex/statuses';
import { ensureAdmin, type ActionResult } from '@/lib/admin-actions';
import { MAP_GEO } from '@/components/guidos/stockist-map-data';
import { COVERAGE_DESCRIPTION, isInsideCoverage } from '@/components/guidos/stockist-map-geometry';
import { normaliseWebsite } from './website';

export type { ActionResult } from '@/lib/admin-actions';
export type { StockistKind } from '@/../convex/statuses';

export type StockistFields = {
  name: string;
  kind: StockistKind;
  address: string;
  lat: number;
  lng: number;
  website?: string;
  note?: string;
};

const MAX_NAME = 120;
const MAX_ADDRESS = 200;
const MAX_NOTE = 280;

const failed = (message: string) => ({ success: false as const, error: 'failed' as const, message });
const invalid = (message: string) => ({ success: false as const, error: 'invalid' as const, message });

// Public pages read stockists through the 'cms' cache tag (src/lib/cms.ts),
// so expiring it puts a change on the live map straight away.
function invalidateStockistCaches() {
  updateTag('cms');
  revalidatePath('/guidos');
  revalidatePath('/admin/stockists');
  revalidatePath('/admin');
}

function isKind(value: unknown): value is StockistKind {
  return (STOCKIST_KINDS as readonly unknown[]).includes(value);
}

type Checked = { name: string; kind: StockistKind; address: string; lat: number; lng: number; website: string; note: string };

function check(fields: StockistFields): { ok: true; value: Checked } | { ok: false; error: ReturnType<typeof invalid> } {
  const name = fields.name?.trim() ?? '';
  const address = fields.address?.trim() ?? '';
  const note = fields.note?.trim() ?? '';
  if (!name) return { ok: false, error: invalid('Name is required') };
  if (name.length > MAX_NAME) return { ok: false, error: invalid(`Name must be ${MAX_NAME} characters or fewer`) };
  if (!isKind(fields.kind)) return { ok: false, error: invalid('Choose restaurant or grocer') };
  if (!address) return { ok: false, error: invalid('Address is required') };
  if (address.length > MAX_ADDRESS) return { ok: false, error: invalid(`Address must be ${MAX_ADDRESS} characters or fewer`) };
  if (!Number.isFinite(fields.lat) || !Number.isFinite(fields.lng)) {
    return { ok: false, error: invalid('Place the pin on the map, or find the address first') };
  }
  if (!isInsideCoverage({ lat: fields.lat, lng: fields.lng })) {
    return { ok: false, error: invalid(`The map covers ${COVERAGE_DESCRIPTION}. This pin is outside it.`) };
  }
  const website = normaliseWebsite(fields.website);
  if (!website.ok) return { ok: false, error: invalid('That website address does not look right, or is too long') };
  if (note.length > MAX_NOTE) return { ok: false, error: invalid(`The note must be ${MAX_NOTE} characters or fewer`) };
  return { ok: true, value: { name, kind: fields.kind, address, lat: fields.lat, lng: fields.lng, website: website.value, note } };
}

export async function createStockist(fields: StockistFields): Promise<ActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  const checked = check(fields);
  if (!checked.ok) return checked.error;
  const { website, note, ...rest } = checked.value;

  try {
    const id = await fetchMutation(api.stockists.create, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      ...rest,
      ...(website ? { website } : {}),
      ...(note ? { note } : {}),
    });
    invalidateStockistCaches();
    return { success: true, id: id as string };
  } catch {
    return failed('Could not save the stockist');
  }
}

/** Saves the whole form for an existing stockist. Website and note are sent
 *  as empty strings when cleared, which the mutation stores as absent. */
export async function updateStockist(id: string, fields: StockistFields): Promise<ActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  const checked = check(fields);
  if (!checked.ok) return checked.error;

  try {
    await fetchMutation(api.stockists.update, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'stockists'>,
      ...checked.value,
    });
    invalidateStockistCaches();
    return { success: true };
  } catch {
    return failed('Could not update the stockist');
  }
}

export async function setStockistVisible(id: string, isActive: boolean): Promise<ActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  try {
    await fetchMutation(api.stockists.update, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'stockists'>,
      isActive,
    });
    invalidateStockistCaches();
    return { success: true };
  } catch {
    return failed('Could not change visibility');
  }
}

export async function deleteStockist(id: string): Promise<ActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  try {
    await fetchMutation(api.stockists.remove, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'stockists'>,
    });
    invalidateStockistCaches();
    return { success: true };
  } catch {
    return failed('Could not delete the stockist');
  }
}

/** Atomic whole-list reorder: the id list must be complete and in order. */
export async function reorderStockists(ids: string[]): Promise<ActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  if (ids.length === 0) return { success: true };
  try {
    await fetchMutation(api.stockists.reorder, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      ids: ids as Id<'stockists'>[],
    });
    invalidateStockistCaches();
    return { success: true };
  } catch {
    return failed('Could not save the new order');
  }
}

/* ===== Address search ===== */

export type AddressMatch = { label: string; name: string; address: string; lat: number; lng: number };

type NominatimResult = {
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  address?: Record<string, string>;
};

// OpenStreetMap's Nominatim allows light use at no more than one request a
// second with an identifying user agent, which an admin clicking Search
// never approaches; the pause below keeps it true even for quick repeats.
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'MeltingMomentsAdmin/1.0 (info@meltingmoments.ca)';
let lastLookupAt = 0;

function shortAddress(address: Record<string, string> | undefined, fallback: string): string {
  if (!address) return fallback.split(',').slice(0, 3).join(',').trim();
  const street = [address.house_number, address.road].filter(Boolean).join(' ');
  const locality = address.city || address.town || address.village || address.suburb || address.municipality || '';
  const line = [street, locality].filter(Boolean).join(', ');
  return line || fallback.split(',').slice(0, 3).join(',').trim();
}

/** Finds an address or a business by name within the area the map covers. */
export async function findStockistAddress(
  query: string
): Promise<{ success: true; matches: AddressMatch[] } | Extract<ActionResult, { success: false }>> {
  const denied = await ensureAdmin();
  if (denied) return denied;

  const q = query.trim();
  if (q.length < 3) return invalid('Type at least a few letters of the address or the shop name');
  if (q.length > 200) return invalid('That search is too long');

  const wait = lastLookupAt + 1100 - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastLookupAt = Date.now();

  const params = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    limit: '6',
    countrycodes: 'ca',
    viewbox: `${MAP_GEO.west},${MAP_GEO.north},${MAP_GEO.east},${MAP_GEO.south}`,
    bounded: '1',
    q,
  });

  try {
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en' },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return failed('The address search is not answering right now. Try again in a moment');
    const results = (await res.json()) as NominatimResult[];
    const matches = results
      .map((r) => {
        const lat = Number(r.lat);
        const lng = Number(r.lon);
        const address = shortAddress(r.address, r.display_name);
        const name = r.name && !address.startsWith(r.name) ? r.name : '';
        return { label: name ? `${name}, ${address}` : address, name, address, lat, lng };
      })
      .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng) && isInsideCoverage(m));
    return { success: true, matches };
  } catch {
    return failed('The address search is not answering right now. Try again in a moment');
  }
}
