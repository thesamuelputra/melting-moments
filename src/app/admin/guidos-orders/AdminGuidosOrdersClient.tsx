'use client';

import { useState } from 'react';
import { updateGuidosOrderStatus, deleteGuidosOrder } from './actions';

type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: string;
  deliveryMethod: string;
  deliveryAddress: string;
  notes: string;
  status: string;
  submittedAt: number;
};

const STATUS_OPTIONS = ['received', 'preparing', 'ready', 'delivered', 'picked_up'];
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  received: { bg: '#DBEAFE', color: '#1E40AF' },
  preparing: { bg: '#FEF3C7', color: '#92400E' },
  ready: { bg: '#D1FAE5', color: '#065F46' },
  delivered: { bg: '#E5E7EB', color: '#374151' },
  picked_up: { bg: '#E5E7EB', color: '#374151' },
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminGuidosOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);
  const activeCount = orders.filter(o => !['delivered', 'picked_up'].includes(o.status)).length;

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateGuidosOrderStatus(id, newStatus);
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this order? This cannot be undone.')) return;
    try {
      await deleteGuidosOrder(id);
      setOrders(orders.filter(o => o.id !== id));
    } catch (e) {
      console.error('Failed to delete order:', e);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Guido&apos;s Orders</h1>
        <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{orders.length} total orders · {activeCount} active</p>
      </div>

      {/* Status Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className={`admin-btn admin-btn--sm ${filterStatus === 'all' ? 'admin-btn--primary' : ''}`} onClick={() => setFilterStatus('all')}>
          All ({orders.length})
        </button>
        {STATUS_OPTIONS.map(status => {
          const count = orders.filter(o => o.status === status).length;
          return (
            <button key={status} className={`admin-btn admin-btn--sm ${filterStatus === status ? 'admin-btn--primary' : ''}`} onClick={() => setFilterStatus(status)}>
              {status.replace('_', ' ')} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Method</th>
              <th>Status</th>
              <th>Submitted</th>
              <th style={{ width: '180px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <>
                <tr key={order.id} onClick={() => setExpandedId(expandedId === order.id ? null : order.id)} style={{ cursor: 'pointer' }}>
                  <td>
                    <strong>{order.customerName}</strong>
                    <br />
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{order.customerEmail}</span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{order.deliveryMethod}</td>
                  <td>
                    <span style={{
                      fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px',
                      background: STATUS_COLORS[order.status]?.bg ?? '#E5E7EB',
                      color: STATUS_COLORS[order.status]?.color ?? '#374151',
                      textTransform: 'capitalize',
                    }}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span title={formatDate(order.submittedAt)}>{formatRelativeTime(order.submittedAt)}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }} onClick={e => e.stopPropagation()}>
                      <select
                        className="admin-btn admin-btn--sm"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{ fontSize: '0.7rem', padding: '0.3rem 0.4rem', textTransform: 'capitalize' }}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                      <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(order.id)}>×</button>
                    </div>
                  </td>
                </tr>
                {/* Expanded detail row */}
                {expandedId === order.id && (
                  <tr key={`${order.id}-detail`}>
                    <td colSpan={5} style={{ background: '#F9FAFB', padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>Order Items</strong>
                          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', marginTop: '0.5rem', lineHeight: 1.5 }}>{order.items}</pre>
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>Details</strong>
                          <p style={{ marginTop: '0.5rem' }}><strong>Phone:</strong> {order.customerPhone}</p>
                          {order.deliveryAddress && <p><strong>Address:</strong> {order.deliveryAddress}</p>}
                          {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
                          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#9CA3AF' }}>
                            Submitted: {formatDate(order.submittedAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
