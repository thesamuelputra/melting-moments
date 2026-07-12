'use client';

import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useModalBehavior, useMounted } from './modalBehavior';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  body?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button; initial focus lands on Cancel instead of Confirm. */
  destructive?: boolean;
  /** Disables both buttons and Escape/overlay dismissal while an action runs. */
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const mounted = useMounted();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const bodyId = useId();

  useModalBehavior({
    open,
    containerRef: dialogRef,
    // Destructive: focus Cancel to guard against accidental Enter. Otherwise focus Confirm.
    initialFocusRef: destructive ? cancelRef : confirmRef,
    onEscape: () => {
      if (!busy) onCancel();
    },
  });

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="admin-dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        className="admin-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={body ? bodyId : undefined}
      >
        <h3 id={titleId} className="admin-dialog__title">{title}</h3>
        {body && (
          <div id={bodyId} className="admin-dialog__body">
            {body}
          </div>
        )}
        <div className="admin-dialog__actions">
          <button type="button" ref={cancelRef} className="admin-btn" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmRef}
            className={`admin-btn ${destructive ? 'admin-btn--danger' : 'admin-btn--primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
