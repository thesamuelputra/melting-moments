'use client';

/**
 * Shared modal plumbing for ConfirmDialog + SlidePanel:
 * - a module-level modal stack so only the top layer reacts to Escape / traps Tab
 *   (a ConfirmDialog stacked over a SlidePanel must win the Escape key);
 * - focus trap (Tab cycling within the container);
 * - focus restore to the element that was focused before the layer opened;
 * - initial focus placement.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const modalStack: symbol[] = [];

/** Registers this layer on the modal stack while `open`; returns an `isTop()` check. */
function useModalLayer(open: boolean): () => boolean {
  const [id] = useState(() => Symbol('admin-modal-layer'));
  useEffect(() => {
    if (!open) return;
    modalStack.push(id);
    return () => {
      const i = modalStack.indexOf(id);
      if (i >= 0) modalStack.splice(i, 1);
    };
  }, [open, id]);
  return useCallback(() => modalStack[modalStack.length - 1] === id, [id]);
}

export type ModalBehaviorOptions = {
  open: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
  /** Element to focus when the layer opens; falls back to first focusable in container. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Called on Escape, only while this layer is topmost. */
  onEscape?: () => void;
};

export function useModalBehavior({ open, containerRef, initialFocusRef, onEscape }: ModalBehaviorOptions): void {
  const isTop = useModalLayer(open);

  // Keep the latest onEscape without re-binding the document listener.
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  });

  // Focus restore: remember what was focused when the layer opened, restore on close/unmount.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => {
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [open]);

  // Initial focus.
  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    const target =
      initialFocusRef?.current ??
      container?.querySelector<HTMLElement>(FOCUSABLE) ??
      container;
    target?.focus();
  }, [open, containerRef, initialFocusRef]);

  // Escape + Tab trap: capture phase so we run before page-level handlers.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isTop()) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscapeRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const container = containerRef.current;
      if (!container) return;
      const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const inside = active instanceof HTMLElement && container.contains(active);
      if (e.shiftKey) {
        if (!inside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, isTop, containerRef]);
}

/** True after the first client render; gates portals so SSR never touches `document`. */
const emptySubscribe = () => () => {};
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false // server snapshot
  );
}
