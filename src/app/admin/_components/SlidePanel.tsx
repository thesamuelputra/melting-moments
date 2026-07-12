'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ConfirmDialog from './ConfirmDialog';
import { useModalBehavior, useMounted } from './modalBehavior';

export type SlidePanelProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  /** Rendered pinned to the bottom of the panel (save/cancel buttons). */
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** When true, Escape / overlay / X ask for confirmation before closing. */
  dirty?: boolean;
};

export default function SlidePanel({ open, title, onClose, footer, children, dirty = false }: SlidePanelProps) {
  const mounted = useMounted();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const [confirmingClose, setConfirmingClose] = useState(false);

  // Reset the discard prompt whenever the panel closes.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setConfirmingClose(false);
  }

  const requestClose = () => {
    if (dirty) setConfirmingClose(true);
    else onClose();
  };

  useModalBehavior({
    open: open && !confirmingClose,
    containerRef: panelRef,
    onEscape: requestClose,
  });

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <div className="admin-modal-overlay" onClick={requestClose} />
      <div
        ref={panelRef}
        className="admin-modal admin-modal--panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="admin-panel__header">
          <h2 id={titleId} className="admin-panel__title">{title}</h2>
          <button type="button" className="admin-modal__close" onClick={requestClose} aria-label="Close panel">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>
        <div className="admin-panel__body">{children}</div>
        {footer && <div className="admin-panel__footer">{footer}</div>}
      </div>
      <ConfirmDialog
        open={confirmingClose}
        title="Discard changes?"
        body="You have unsaved changes. If you close this panel now, your edits will be lost."
        confirmLabel="Discard"
        destructive
        onConfirm={() => {
          setConfirmingClose(false);
          onClose();
        }}
        onCancel={() => setConfirmingClose(false)}
      />
    </>,
    document.body
  );
}
