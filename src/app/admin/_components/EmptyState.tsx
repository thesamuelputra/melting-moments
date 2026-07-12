'use client';

export type EmptyStateProps = {
  title: string;
  body?: string;
  /** e.g. a "+ Add item" button. */
  action?: React.ReactNode;
};

export default function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="admin-empty">
      <h3 className="admin-empty__title">{title}</h3>
      {body && <p className="admin-empty__body">{body}</p>}
      {action && <div className="admin-empty__action">{action}</div>}
    </div>
  );
}
