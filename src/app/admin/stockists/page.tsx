import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminStockistsClient, { type Stockist } from './AdminStockistsClient';
import type { StockistKind } from './actions';

export default async function AdminStockistsPage() {
  // null = Convex unreachable (the client shows a "CMS unreachable" state
  // instead of crashing to the error boundary); an empty array means no
  // stockists have been added yet.
  let stockists: Stockist[] | null;
  try {
    const raw = await fetchQuery(api.stockists.list, { adminSecret: process.env.ADMIN_PASSWORD! });
    stockists = raw.map((s) => ({
      id: s._id,
      name: s.name,
      kind: s.kind as StockistKind,
      address: s.address,
      lat: s.lat,
      lng: s.lng,
      website: s.website ?? '',
      note: s.note ?? '',
      isActive: s.isActive,
    }));
  } catch {
    stockists = null;
  }

  return <AdminStockistsClient initialStockists={stockists} />;
}
