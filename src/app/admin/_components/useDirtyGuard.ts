'use client';

import { useEffect } from 'react';
import { registerDirtyListener } from '../AdminLayoutClient';

/**
 * While `dirty` is true:
 * - registers with the admin shell's dirty registry (sidebar/breadcrumb nav shows
 *   the "Unsaved Changes" confirmation before navigating away);
 * - adds a `beforeunload` handler so refresh/tab-close also warn.
 */
export function useDirtyGuard(dirty: boolean): void {
  useEffect(() => {
    if (!dirty) return;
    const unregister = registerDirtyListener(() => true);
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Chrome requires returnValue to be set for the native prompt.
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      unregister();
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [dirty]);
}
