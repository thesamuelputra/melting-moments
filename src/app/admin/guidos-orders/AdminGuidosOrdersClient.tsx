'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { ConfirmDialog, useAutoRefresh, useToast } from '../_components';
import SessionExpiredToast from './SessionExpiredToast';
import {
  deleteGuidosOrder,
  updateGuidosOrderStatus,
  type ActionResult,
  type OrderStatus,
} from './actions';

type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: string;
  deliveryMethod: string;
  deliveryAddress: string;
  notes: string;
  status: string; // schema is a plain string; the select only OFFERS the 5 statuses
  submittedAt: number;
};

const STATUS_OPTIONS: readonly OrderStatus[] = ['received', 'preparing', 'ready', 'delivered', 'picked_up'];

/** Pipeline position; delivered and picked_up are both terminal. */
const STATUS_RANK: Record<OrderStatus, number> = {
  received: 0,
  preparing: 1,
  ready: 2,
  delivered: 3,
  picked_up: 3,
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  received: { bg: '#DBEAFE', color: '#1E40AF' },
  preparing: { bg: '#FEF3C7', color: '#92400E' },
  ready: { bg: '#D1FAE5', color: '#065F46' },
  delivered: { bg: '#E5E7EB', color: '#374151' },
  picked_up: { bg: '#E5E7EB', color: '#374151' },
};

const MAIL_SUBJECT = encodeURIComponent("Your Guido's Gourmet order");

const FAILED: ActionResult = { success: false, error: 'failed' };

const isOrderStatus = (s: string): s is OrderStatus => (STATUS_OPTIONS as readonly string[]).includes(s);

const statusLabel = (s: string) => s.replace('_', ' ');

const isTerminal = (s: string) => s === 'delivered' || s === 'picked_up';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatRelativeTime(ts: number, now: number): string {
  const diff = Math.max(0, now - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatUpdatedAgo(ms: number): string {
  const secs = Math.max(0, Math.floor(ms / 1000));
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function orderSummary(order: Order): string {
  return [
    `Guido's Gourmet order: ${order.customerName}`,
    `Status: ${statusLabel(order.status)}`,
    `Submitted: ${formatDate(order.submittedAt)}`,
    `Email: ${order.customerEmail}`,
    `Phone: ${order.customerPhone}`,
    `Method: ${order.deliveryMethod}`,
    ...(order.deliveryAddress ? [`Address: ${order.deliveryAddress}`] : []),
    '',
    'Items:',
    order.items,
    ...(order.notes ? ['', `Notes: ${order.notes}`] : []),
  ].join('\n');
}

export default function AdminGuidosOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const toast = useToast();
  const { refresh } = useAutoRefresh(60000);

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  // Re-sync whenever the server sends a fresh payload (auto-refresh, manual
  // refresh, or the RSC update that follows a server action's revalidatePath).
  const [prevInitial, setPrevInitial] = useState(initialOrders);
  if (initialOrders !== prevInitial) {
    setPrevInitial(initialOrders);
    setOrders(initialOrders);
  }

  // Timestamp of the last server payload; drives "Updated Xs ago".
  // (In an effect, not render: Date.now() is impure during render.)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  useEffect(() => {
    setLastUpdated(Date.now());
  }, [initialOrders]);

  const [filterStatus, setFilterStatus] = useState<'all' | OrderStatus>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [sessionExpired, setSessionExpired] = useState(false);

  // Confirmations
  const [confirmingStatus, setConfirmingStatus] = useState<{ order: Order; to: OrderStatus } | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Order | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  // Ticker so "Updated Xs ago" / relative times stay fresh between refreshes.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .filter((o) => filterStatus === 'all' || o.status === filterStatus)
      .filter(
        (o) =>
          q === '' ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q)
      )
      .sort((a, b) => b.submittedAt - a.submittedAt); // newest first
  }, [orders, filterStatus, search]);

  const activeCount = orders.filter((o) => !isTerminal(o.status)).length;

  const surfaceFailure = (res: Extract<ActionResult, { success: false }>, fallback: string) => {
    if (res.error === 'unauthorized') setSessionExpired(true);
    else toast.error(res.message ?? fallback);
  };

  const markPending = (id: string, pending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  /* ===== status changes ===== */

  const applyStatusChange = async (order: Order, to: OrderStatus) => {
    const previous = order.status;
    markPending(order.id, true);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: to } : o)));

    const res = await updateGuidosOrderStatus(order.id, to).catch(() => FAILED);
    if (res.success) {
      toast.success(`${order.customerName}'s order marked "${statusLabel(to)}"`);
    } else {
      // Rollback to the snapshot status (row position is unchanged).
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: previous } : o)));
      surfaceFailure(res, 'Could not update status. Change reverted');
    }
    markPending(order.id, false);
  };

  const requestStatusChange = (order: Order, to: OrderStatus) => {
    if (to === order.status || pendingIds.has(order.id)) return;
    const fromRank = isOrderStatus(order.status) ? STATUS_RANK[order.status] : -1;
    if (fromRank > STATUS_RANK[to]) {
      // Backwards transition (e.g. delivered → received): confirm first.
      setConfirmingStatus({ order, to });
      return;
    }
    void applyStatusChange(order, to);
  };

  /* ===== delete ===== */

  const handleDelete = async () => {
    const order = confirmingDelete;
    if (!order) return;
    const originalIndex = orders.findIndex((o) => o.id === order.id);
    setConfirmBusy(true);
    // Optimistic removal…
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    const res = await deleteGuidosOrder(order.id).catch(() => FAILED);
    setConfirmBusy(false);
    setConfirmingDelete(null);
    if (res.success) {
      toast.success(`${order.customerName}'s order deleted`);
    } else {
      // …restored at its original index on failure.
      setOrders((prev) => {
        if (prev.some((o) => o.id === order.id)) return prev;
        const next = [...prev];
        next.splice(Math.min(Math.max(originalIndex, 0), next.length), 0, order);
        return next;
      });
      surfaceFailure(res, 'Could not delete. Order restored');
    }
  };

  /* ===== clipboard ===== */

  const copySummary = async (order: Order) => {
    try {
      await navigator.clipboard.writeText(orderSummary(order));
      toast.success('Order summary copied');
    } catch {
      toast.error('Could not copy to the clipboard');
    }
  };

  /* ===== render ===== */

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Guido&apos;s Orders</h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
            {orders.length} total orders · {activeCount} active
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>
            Updated {lastUpdated === null ? 'just now' : formatUpdatedAgo(now - lastUpdated)}
          </span>
          <button className="admin-btn admin-btn--sm" onClick={refresh}>
            Refresh
          </button>
        </div>
      </div>

      {/* Search + status filter */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="search"
          className="admin-inline-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email…"
          aria-label="Search orders by customer name or email"
          style={{ minWidth: 220 }}
        />
        {search && (
          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
            {filtered.length} match{filtered.length === 1 ? '' : 'es'}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className={`admin-btn admin-btn--sm ${filterStatus === 'all' ? 'admin-btn--primary' : ''}`}
          aria-pressed={filterStatus === 'all'}
          onClick={() => setFilterStatus('all')}
        >
          All ({orders.length})
        </button>
        {STATUS_OPTIONS.map((status) => {
          const count = orders.filter((o) => o.status === status).length;
          return (
            <button
              key={status}
              className={`admin-btn admin-btn--sm ${filterStatus === status ? 'admin-btn--primary' : ''}`}
              aria-pressed={filterStatus === status}
              onClick={() => setFilterStatus(status)}
              style={{ textTransform: 'capitalize' }}
            >
              {statusLabel(status)} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Method</th>
              <th>Status</th>
              <th>Submitted</th>
              <th style={{ width: '220px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const pending = pendingIds.has(order.id);
              const expanded = expandedId === order.id;
              return (
                <Fragment key={order.id}>
                  <tr
                    onClick={() => setExpandedId(expanded ? null : order.id)}
                    style={{ cursor: 'pointer', opacity: pending ? 0.6 : 1 }}
                  >
                    <td>
                      <strong>{order.customerName}</strong>
                      <br />
                      <a
                        href={`mailto:${order.customerEmail}?subject=${MAIL_SUBJECT}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ fontSize: '0.75rem', color: '#6B7280' }}
                        title={`Email ${order.customerName}`}
                      >
                        {order.customerEmail}
                      </a>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{order.deliveryMethod}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px',
                          background: STATUS_COLORS[order.status]?.bg ?? '#E5E7EB',
                          color: STATUS_COLORS[order.status]?.color ?? '#374151',
                          textTransform: 'capitalize',
                        }}
                      >
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td>
                      <span title={formatDate(order.submittedAt)}>{formatRelativeTime(order.submittedAt, now)}</span>
                    </td>
                    <td>
                      {/* onClick only stops the row's expand toggle from firing under the controls */}
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <select
                          className="admin-btn admin-btn--sm"
                          value={isOrderStatus(order.status) ? order.status : ''}
                          aria-label={`Order status for ${order.customerName}`}
                          disabled={pending}
                          onChange={(e) => requestStatusChange(order, e.target.value as OrderStatus)}
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.4rem', textTransform: 'capitalize' }}
                        >
                          {!isOrderStatus(order.status) && (
                            <option value="" disabled>
                              {statusLabel(order.status)}
                            </option>
                          )}
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {statusLabel(s)}
                            </option>
                          ))}
                        </select>
                        <button
                          className="admin-btn admin-btn--sm"
                          onClick={() => setExpandedId(expanded ? null : order.id)}
                          aria-expanded={expanded}
                          aria-label={`${expanded ? 'Hide' : 'Show'} details for ${order.customerName}'s order`}
                        >
                          {expanded ? 'Hide' : 'Details'}
                        </button>
                        <button
                          className="admin-btn admin-btn--sm admin-btn--danger"
                          disabled={pending}
                          onClick={() => setConfirmingDelete(order)}
                          aria-label={`Delete ${order.customerName}'s order`}
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded && (
                    <tr>
                      <td colSpan={5} style={{ background: '#F9FAFB', padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                          <div>
                            <strong style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>Order Items</strong>
                            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', marginTop: '0.5rem', lineHeight: 1.5 }}>{order.items}</pre>
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>Details</strong>
                            <p style={{ marginTop: '0.5rem' }}>
                              <strong>Phone:</strong>{' '}
                              <a href={`tel:${order.customerPhone}`} title={`Call ${order.customerName}`}>{order.customerPhone}</a>
                            </p>
                            <p>
                              <strong>Email:</strong>{' '}
                              <a href={`mailto:${order.customerEmail}?subject=${MAIL_SUBJECT}`} title={`Email ${order.customerName}`}>
                                {order.customerEmail}
                              </a>
                            </p>
                            {order.deliveryAddress && (
                              <p><strong>Address:</strong> {order.deliveryAddress}</p>
                            )}
                            {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
                            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#9CA3AF' }}>
                              Submitted: {formatDate(order.submittedAt)}
                            </p>
                            <button
                              className="admin-btn admin-btn--sm"
                              style={{ marginTop: '0.5rem' }}
                              onClick={() => copySummary(order)}
                            >
                              Copy order summary
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>
                  {orders.length === 0
                    ? 'No orders yet.'
                    : 'No orders match the current search / filter.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Backwards status transition confirmation */}
      <ConfirmDialog
        open={confirmingStatus !== null}
        title="Move order backwards?"
        body={
          confirmingStatus
            ? `${confirmingStatus.order.customerName}'s order goes from “${statusLabel(confirmingStatus.order.status)}” back to “${statusLabel(confirmingStatus.to)}”.`
            : undefined
        }
        confirmLabel="Move back"
        onConfirm={() => {
          const pendingChange = confirmingStatus;
          setConfirmingStatus(null);
          if (pendingChange) void applyStatusChange(pendingChange.order, pendingChange.to);
        }}
        onCancel={() => setConfirmingStatus(null)}
      />

      {/* Delete confirmation: extra warning for orders still in the pipeline */}
      <ConfirmDialog
        open={confirmingDelete !== null}
        title={
          confirmingDelete && !isTerminal(confirmingDelete.status)
            ? 'Delete an ACTIVE order?'
            : 'Delete order?'
        }
        body={
          confirmingDelete
            ? confirmingDelete.status && !isTerminal(confirmingDelete.status)
              ? `${confirmingDelete.customerName}'s order is still “${statusLabel(confirmingDelete.status)}”. It has not been delivered or picked up. Deleting it permanently removes the record and cannot be undone.`
              : `${confirmingDelete.customerName}'s order record will be permanently removed. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        busy={confirmBusy}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(null)}
      />

      <SessionExpiredToast open={sessionExpired} />
    </div>
  );
}
